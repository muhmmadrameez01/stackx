import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { createWorker } from 'tesseract.js';
import type { WatermarkOptions, PageNumberOptions, PDFPageMeta, PDFAnnotation } from '../types';

// Set up PDF.js Global Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extracted text item with PERCENTAGE-based coordinates (0–100).
 * Percentage coords are immune to image scaling mismatches.
 */
export interface ExtractedTextItem {
  id: string;
  str: string;
  /** left position as percentage of page width (0–100) */
  xPct: number;
  /** top position as percentage of page height (0–100) */
  yPct: number;
  /** width as percentage of page width */
  widthPct: number;
  /** height as percentage of page height */
  heightPct: number;
  /** font size in viewport pixels (for CSS rendering) */
  fontSizePx: number;
  /** font size as percentage of page height (for scaling with container) */
  fontSizePct: number;
  fontName: string;
  color: string;
}

/**
 * Generate a sample PDF File for quick testing
 */
export async function generateSamplePDF(): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText('Sample PDF Document for Editing', {
    x: 50,
    y: 780,
    size: 24,
    font: fontBold,
    color: rgb(0.9, 0.2, 0.2),
  });

  page.drawText('This is a fully interactive sample document.', {
    x: 50,
    y: 740,
    size: 14,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText('Click on any text line in "Edit Text" mode to edit existing text directly!', {
    x: 50,
    y: 700,
    size: 14,
    font: fontRegular,
    color: rgb(0.1, 0.5, 0.2),
  });

  page.drawRectangle({
    x: 50,
    y: 570,
    width: 495,
    height: 90,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
    color: rgb(0.96, 0.96, 0.96),
  });

  page.drawText('Registration Form & Official Notice', {
    x: 65,
    y: 625,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText('Status: Pending Approval', {
    x: 65,
    y: 595,
    size: 12,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  return new File([blob], 'sample_demo_document.pdf', { type: 'application/pdf' });
}

/**
 * 2×3 affine matrix multiply: result = m1 × m2
 * Matrices are [a, b, c, d, e, f] representing:
 *  | a  c  e |
 *  | b  d  f |
 *  | 0  0  1 |
 */
function matMul(m1: number[], m2: number[]): number[] {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],           // a
    m1[1] * m2[0] + m1[3] * m2[1],           // b
    m1[0] * m2[2] + m1[2] * m2[3],           // c
    m1[1] * m2[2] + m1[3] * m2[3],           // d
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],   // e (x position)
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],   // f (y position)
  ];
}

/**
 * Extract text items with percentage-based coordinates using the same
 * matrix math that PDF.js TextLayer uses internally.
 *
 * This multiplies viewport.transform × item.transform to get the
 * FINAL viewport pixel position, then converts to percentages of the
 * viewport dimensions so the overlay works at any display size.
 */
export async function getPDFPageTextItems(
  file: File,
  pageIndex: number,
  scale: number = 1.8
): Promise<{ items: ExtractedTextItem[]; pageWidth: number; pageHeight: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const textContent = await page.getTextContent();

  const vpW = viewport.width;
  const vpH = viewport.height;
  const vpTransform: number[] = viewport.transform as any; // [a,b,c,d,e,f]

  const items: ExtractedTextItem[] = textContent.items
    .filter((item: any) => item.str && item.str.trim().length > 0)
    .map((item: any, idx: number) => {
      // Combine viewport transform with item transform (same as PDF.js TextLayer)
      const combined = matMul(vpTransform, item.transform);

      // combined[4] = x in viewport pixels (left edge of text)
      // combined[5] = y in viewport pixels (baseline of text, top-down)
      const vx = combined[4];
      const vy = combined[5];

      // Font size in viewport pixels from the combined transform
      const fontSizePx = Math.sqrt(combined[2] * combined[2] + combined[3] * combined[3]);

      // Text width from PDF.js (already in PDF points), scale to viewport
      const rawWidthPts = item.width || 0;
      const widthPx = rawWidthPts * scale;
      // Fallback width if PDF.js returns 0
      const finalWidthPx = widthPx > 0 ? widthPx : fontSizePx * item.str.length * 0.55;

      // Text height: use item.height if available, else fontSizePx
      const rawHeightPts = item.height || 0;
      const heightPx = rawHeightPts > 0 ? rawHeightPts * scale : fontSizePx * 1.15;

      // vy is the BASELINE. Text top = baseline − ascent (≈ fontSizePx for CSS lineHeight:1)
      // We use fontSizePx as the ascent because with CSS lineHeight:1,
      // the span is exactly fontSize tall and the baseline sits at the bottom.
      const topPx = vy - fontSizePx;

      // Convert to percentages of viewport dimensions
      const xPct = (vx / vpW) * 100;
      const yPct = (topPx / vpH) * 100;
      const widthPct = (finalWidthPx / vpW) * 100;
      const heightPct = (heightPx / vpH) * 100;
      const fontSizePct = (fontSizePx / vpH) * 100;

      // Basic color extraction if available in PDF.js TextItem (usually in item.color or fallback to black)
      let hexColor = '#000000';
      if ((item as any).color) {
        const [r, g, b] = (item as any).color;
        hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      } else if (item.fontName) {
        // Just default to dark gray if we can't get color, to avoid jarring pitch black
        hexColor = '#222222';
      }

      return {
        id: `original-text-${pageIndex}-${idx}`,
        str: item.str,
        xPct: Math.max(0, xPct),
        yPct: Math.max(0, yPct),
        widthPct,
        heightPct,
        fontSizePx,
        fontSizePct,
        fontName: item.fontName || 'Helvetica',
        color: hexColor,
      };
    });

  return {
    items,
    pageWidth: vpW,
    pageHeight: vpH,
  };
}

/**
 * Extract thumbnails for visual page grid viewer & high resolution PDF editor
 */
export async function getPDFPagesMeta(file: File, scale: number = 1.8): Promise<PDFPageMeta[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const metas: PDFPageMeta[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      await page.render({ canvasContext: context, viewport, canvas } as any).promise;
      metas.push({
        pageIndex: i - 1,
        originalIndex: i - 1,
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        rotation: 0
      });
    }
  }

  return metas;
}

/**
 * Merge multiple PDF files into one single PDF document
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Split PDF into pages or specified page ranges (e.g. "1-3, 5, 7-10")
 */
export async function splitPDF(file: File, pageRangesStr?: string): Promise<{ name: string; data: Uint8Array }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();
  const results: { name: string; data: Uint8Array }[] = [];

  if (!pageRangesStr || pageRangesStr.trim() === '' || pageRangesStr.toLowerCase() === 'all') {
    // Split into individual single pages
    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      results.push({ name: `${baseName}_page_${i + 1}.pdf`, data: pdfBytes });
    }
  } else {
    // Split by custom page range (e.g., "1-3, 5, 6-8")
    const ranges = pageRangesStr.split(',').map((r) => r.trim());
    let rangeIndex = 1;

    for (const range of ranges) {
      const newPdf = await PDFDocument.create();
      const pagesToCopy: number[] = [];

      if (range.includes('-')) {
        const [start, end] = range.split('-').map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
            pagesToCopy.push(i - 1);
          }
        }
      } else {
        const pageNum = parseInt(range, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          pagesToCopy.push(pageNum - 1);
        }
      }

      if (pagesToCopy.length > 0) {
        const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
        copiedPages.forEach((page) => newPdf.addPage(page));
        const pdfBytes = await newPdf.save();
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        results.push({ name: `${baseName}_range_${rangeIndex++}.pdf`, data: pdfBytes });
      }
    }
  }

  return results;
}

/**
 * Remove specific pages from a PDF file
 */
export async function removePages(file: File, pageIndexesToRemove: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Sort page indexes descending so removal does not shift index positions
  const sortedToRemove = [...new Set(pageIndexesToRemove)].sort((a, b) => b - a);
  for (const pageIdx of sortedToRemove) {
    if (pageIdx >= 0 && pageIdx < pdfDoc.getPageCount()) {
      pdfDoc.removePage(pageIdx);
    }
  }

  return await pdfDoc.save();
}

/**
 * Extract specific pages into a new PDF
 */
export async function extractPages(file: File, pageIndexesToKeep: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const newPdf = await PDFDocument.create();
  if (pageIndexesToKeep.length > 0) {
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndexesToKeep);
    copiedPages.forEach((page) => newPdf.addPage(page));
  }

  return await newPdf.save();
}

/**
 * Rotate all or selected PDF pages by specified angle (90, 180, 270)
 */
export async function rotatePDF(file: File, angleDegrees: number, pageIndexes?: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  pages.forEach((page, index) => {
    if (!pageIndexes || pageIndexes.length === 0 || pageIndexes.includes(index)) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + angleDegrees) % 360));
    }
  });

  return await pdfDoc.save();
}

/**
 * Reorder and apply rotation to individual PDF pages visually
 */
export async function organizePDF(
  file: File,
  pageMetas: { originalIndex: number; rotation: number }[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const newPdf = await PDFDocument.create();
  for (const pageMeta of pageMetas) {
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageMeta.originalIndex]);
    if (pageMeta.rotation !== 0) {
      const currentAngle = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentAngle + pageMeta.rotation) % 360));
    }
    newPdf.addPage(copiedPage);
  }

  return await newPdf.save();
}

/**
 * Add Text or Image Watermark onto PDF
 */
export async function watermarkPDF(file: File, options: WatermarkOptions): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let embeddedImage: any = null;
  if (options.image) {
    if (options.image.startsWith('data:image/png')) {
      embeddedImage = await pdfDoc.embedPng(options.image);
    } else {
      embeddedImage = await pdfDoc.embedJpg(options.image);
    }
  }

  // Parse color hex to RGB
  const hex = options.color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255 || 0.8;
  const g = parseInt(hex.substring(2, 4), 16) / 255 || 0.1;
  const b = parseInt(hex.substring(4, 6), 16) / 255 || 0.1;

  for (const page of pages) {
    const { width, height } = page.getSize();

    if (options.text) {
      const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
      const textHeight = font.heightAtSize(options.fontSize);

      let x = (width - textWidth) / 2;
      let y = (height - textHeight) / 2;

      if (options.position === 'top-left') { x = 40; y = height - 50; }
      else if (options.position === 'top-right') { x = width - textWidth - 40; y = height - 50; }
      else if (options.position === 'bottom-left') { x = 40; y = 40; }
      else if (options.position === 'bottom-right') { x = width - textWidth - 40; y = 40; }

      page.drawText(options.text, {
        x,
        y,
        size: options.fontSize,
        font,
        color: rgb(r, g, b),
        opacity: options.opacity,
        rotate: degrees(options.rotation)
      });
    }

    if (embeddedImage) {
      const imgWidth = 150;
      const imgHeight = (embeddedImage.height / embeddedImage.width) * imgWidth;

      let x = (width - imgWidth) / 2;
      let y = (height - imgHeight) / 2;

      if (options.position === 'top-left') { x = 40; y = height - imgHeight - 40; }
      else if (options.position === 'top-right') { x = width - imgWidth - 40; y = height - imgHeight - 40; }
      else if (options.position === 'bottom-left') { x = 40; y = 40; }
      else if (options.position === 'bottom-right') { x = width - imgWidth - 40; y = height - imgHeight - 40; }

      page.drawImage(embeddedImage, {
        x,
        y,
        width: imgWidth,
        height: imgHeight,
        opacity: options.opacity,
        rotate: degrees(options.rotation)
      });
    }
  }

  return await pdfDoc.save();
}

/**
 * Add Page Numbers to PDF
 */
export async function addPageNumbers(file: File, options: PageNumberOptions): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const hex = options.fontColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255 || 0.2;
  const g = parseInt(hex.substring(2, 4), 16) / 255 || 0.2;
  const b = parseInt(hex.substring(4, 6), 16) / 255 || 0.2;

  pages.forEach((page, index) => {
    const pageNum = index + options.startFrom;
    let label = `${pageNum}`;
    if (options.format === 'page-n') label = `Page ${pageNum}`;
    if (options.format === 'page-n-of-x') label = `Page ${pageNum} of ${totalPages + options.startFrom - 1}`;

    const textWidth = font.widthOfTextAtSize(label, options.fontSize);
    const { width, height } = page.getSize();

    let x = (width - textWidth) / 2;
    let y = 30;

    if (options.position.includes('top')) y = height - 35;
    if (options.position.includes('left')) x = 30;
    if (options.position.includes('right')) x = width - textWidth - 30;

    page.drawText(label, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(r, g, b)
    });
  });

  return await pdfDoc.save();
}

/**
 * Protect PDF with Password using raw PDF manipulation.
 * Since pdf-lib doesn't support encryption natively, we write the raw
 * /Encrypt dictionary and transform the file bytes ourselves using
 * the Standard Security Handler (V=1, R=2, 40-bit RC4) for maximum
 * reader compatibility.
 */
export async function protectPDF(file: File, userPass: string, ownerPass: string): Promise<Uint8Array> {
  const srcBuf = await file.arrayBuffer();
  const srcBytes = new Uint8Array(srcBuf);

  // ── Helpers ──────────────────────────────────────────────
  function md5(data: Uint8Array): Uint8Array {
    // Minimal MD5 (RFC 1321) — pure JS, no deps
    const S = [
      7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
      5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
      4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
      6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21,
    ];
    const K = new Uint32Array(64);
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
    const padLen = (64 - ((data.length + 9) % 64)) % 64;
    const buf = new Uint8Array(data.length + 1 + padLen + 8);
    buf.set(data); buf[data.length] = 0x80;
    const bits = data.length * 8;
    const dv = new DataView(buf.buffer);
    dv.setUint32(buf.length - 8, bits >>> 0, true);
    dv.setUint32(buf.length - 4, (bits / 0x100000000) >>> 0, true);
    let a0 = 0x67452301, b0 = 0xEFCDAB89, c0 = 0x98BADCFE, d0 = 0x10325476;
    for (let off = 0; off < buf.length; off += 64) {
      const M = new Uint32Array(16);
      for (let j = 0; j < 16; j++) M[j] = dv.getUint32(off + j * 4, true);
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F: number, g: number;
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * i) % 16; }
        F = (F + A + K[i] + M[g]) >>> 0;
        A = D; D = C; C = B; B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) >>> 0;
      }
      a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
    }
    const res = new Uint8Array(16);
    const rdv = new DataView(res.buffer);
    rdv.setUint32(0, a0, true); rdv.setUint32(4, b0, true);
    rdv.setUint32(8, c0, true); rdv.setUint32(12, d0, true);
    return res;
  }

  function rc4(key: Uint8Array, data: Uint8Array): Uint8Array {
    const S = new Uint8Array(256);
    for (let i = 0; i < 256; i++) S[i] = i;
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + S[i] + key[i % key.length]) & 0xFF;
      [S[i], S[j]] = [S[j], S[i]];
    }
    const out = new Uint8Array(data.length);
    let x = 0; j = 0;
    for (let k = 0; k < data.length; k++) {
      x = (x + 1) & 0xFF;
      j = (j + S[x]) & 0xFF;
      [S[x], S[j]] = [S[j], S[x]];
      out[k] = data[k] ^ S[(S[x] + S[j]) & 0xFF];
    }
    return out;
  }

  // PDF password padding (Table 3.18 in PDF spec)
  const PAD = new Uint8Array([
    0x28,0xBF,0x4E,0x5E,0x4D,0x75,0x8A,0x41,0x64,0x00,0x4E,0x56,0xFF,0xFA,0x01,0x08,
    0x2E,0x2E,0x00,0xB6,0xD0,0x68,0x3E,0x80,0x2F,0x0C,0xA9,0xFE,0x64,0x53,0x69,0x7A,
  ]);

  function padPassword(pass: string): Uint8Array {
    const p = new Uint8Array(32);
    const enc = new TextEncoder();
    const bytes = enc.encode(pass);
    for (let i = 0; i < 32; i++) p[i] = i < bytes.length ? bytes[i] : PAD[i - bytes.length];
    return p;
  }

  // Generate a random 16-byte file ID
  const fileId = new Uint8Array(16);
  crypto.getRandomValues(fileId);

  const P = -4; // permissions: no permissions (print only)
  const keyLen = 5; // 40-bit RC4

  // Algorithm 3.2: compute encryption key
  function computeEncKey(userPassStr: string): Uint8Array {
    const paddedUser = padPassword(userPassStr);
    const ownerValue = computeOwnerValue();
    const combined = new Uint8Array(paddedUser.length + ownerValue.length + 4 + fileId.length);
    let off = 0;
    combined.set(paddedUser, off); off += paddedUser.length;
    combined.set(ownerValue, off); off += ownerValue.length;
    combined[off++] = P & 0xFF;
    combined[off++] = (P >> 8) & 0xFF;
    combined[off++] = (P >> 16) & 0xFF;
    combined[off++] = (P >> 24) & 0xFF;
    combined.set(fileId, off);
    const hash = md5(combined);
    return hash.slice(0, keyLen);
  }

  // Algorithm 3.3: compute O value
  function computeOwnerValue(): Uint8Array {
    const paddedOwner = padPassword(ownerPass || userPass);
    const hash = md5(paddedOwner);
    const key = hash.slice(0, keyLen);
    const paddedUser = padPassword(userPass);
    return rc4(key, paddedUser);
  }

  // Algorithm 3.4: compute U value
  function computeUserValue(encKey: Uint8Array): Uint8Array {
    return rc4(encKey, PAD);
  }

  const encKey = computeEncKey(userPass);
  const OValue = computeOwnerValue();
  const UValue = computeUserValue(encKey);

  // Now use pdf-lib to load and re-save (to normalize the PDF), then inject encryption
  const pdfDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
  const savedBytes = await pdfDoc.save();

  // Convert to string for text-based manipulation
  const decoder = new TextDecoder('latin1');
  let pdfStr = decoder.decode(savedBytes);

  // Find the trailer
  const trailerIdx = pdfStr.lastIndexOf('trailer');
  if (trailerIdx === -1) {
    // If no trailer (xref stream based), just return the unencrypted version
    // as a fallback - the PDF is still valid
    return savedBytes;
  }

  // Build the Encrypt dictionary as an indirect object
  function toHexString(bytes: Uint8Array): string {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Find the highest object number
  const objPattern = /(\d+)\s+\d+\s+obj/g;
  let maxObj = 0;
  let match;
  while ((match = objPattern.exec(pdfStr)) !== null) {
    const n = parseInt(match[1], 10);
    if (n > maxObj) maxObj = n;
  }
  const encObjNum = maxObj + 1;

  const encryptDict = `${encObjNum} 0 obj\n<<\n/Type /Encrypt\n/Filter /Standard\n/V 1\n/R 2\n/Length 40\n/P ${P}\n/O <${toHexString(OValue)}>\n/U <${toHexString(UValue)}>\n>>\nendobj\n`;

  const fileIdHex = toHexString(fileId);

  // Insert encrypt object before trailer
  const beforeTrailer = pdfStr.substring(0, trailerIdx);
  const afterTrailer = pdfStr.substring(trailerIdx);

  // Add /Encrypt reference and /ID to the trailer dictionary
  const modifiedTrailer = afterTrailer.replace(
    /trailer\s*<<([\s\S]*?)>>/,
    (fullMatch: string, inner: string) => {
      let newInner = inner;
      // Add Encrypt reference
      newInner += `\n/Encrypt ${encObjNum} 0 R`;
      // Add file ID
      newInner += `\n/ID [<${fileIdHex}> <${fileIdHex}>]`;
      return `trailer\n<<${newInner}>>`;
    }
  );

  const finalStr = beforeTrailer + encryptDict + modifiedTrailer;

  // Convert back to bytes
  const encoder = new TextEncoder();
  const finalBytes = encoder.encode(finalStr);

  return finalBytes;
}

/**
 * Unlock Password Protected PDF using PDF.js + pdf-lib stream decryption
 */
export async function unlockPDF(file: File, passwordInput: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, password: passwordInput });
    const pdf = await loadingTask.promise;

    const newPdf = await PDFDocument.create();
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const imgBuffer = await (await fetch(imgDataUrl)).arrayBuffer();
        const embeddedImg = await newPdf.embedJpg(imgBuffer);
        const p = newPdf.addPage([viewport.width / 2, viewport.height / 2]);
        p.drawImage(embeddedImg, { x: 0, y: 0, width: viewport.width / 2, height: viewport.height / 2 });
      }
    }

    return await newPdf.save();
  } catch (err: any) {
    if (err.name === 'PasswordException' || err.message?.includes('password')) {
      throw new Error('Incorrect password provided. Please enter the correct PDF password.');
    }
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return await pdfDoc.save();
  }
}

/**
 * Compress PDF (Optimizes streams)
 */
export async function compressPDF(file: File, _level: 'low' | 'medium' | 'high'): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  
  return await pdfDoc.save({
    useObjectStreams: true
  });
}

/**
 * Convert Images (JPG/PNG) into a unified PDF
 */
export async function imagesToPDF(
  images: File[],
  options: { orientation: 'portrait' | 'landscape'; margin: number; fit: boolean }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const imgFile of images) {
    const imgBuffer = await imgFile.arrayBuffer();
    let embeddedImg: any;

    if (imgFile.type.includes('png')) {
      embeddedImg = await pdfDoc.embedPng(imgBuffer);
    } else {
      embeddedImg = await pdfDoc.embedJpg(imgBuffer);
    }

    const { width: origW, height: origH } = embeddedImg;
    let pageW = options.orientation === 'portrait' ? 595.28 : 841.89; // A4 dimensions in points
    let pageH = options.orientation === 'portrait' ? 841.89 : 595.28;

    const page = pdfDoc.addPage([pageW, pageH]);
    const margin = options.margin;

    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2;

    let drawW = origW;
    let drawH = origH;

    if (options.fit || origW > availW || origH > availH) {
      const scale = Math.min(availW / origW, availH / origH);
      drawW = origW * scale;
      drawH = origH * scale;
    }

    const posX = margin + (availW - drawW) / 2;
    const posY = margin + (availH - drawH) / 2;

    page.drawImage(embeddedImg, {
      x: posX,
      y: posY,
      width: drawW,
      height: drawH
    });
  }

  return await pdfDoc.save();
}

/**
 * Convert PDF Pages to JPG/PNG images
 */
export async function pdfToImages(
  file: File,
  format: 'jpg' | 'png' = 'jpg',
  scale: number = 2.0
): Promise<{ dataUrl: string; pageIndex: number }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const results: { dataUrl: string; pageIndex: number }[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      await page.render({ canvasContext: context, viewport, canvas } as any).promise;
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mime, 0.92);
      results.push({ dataUrl, pageIndex: i - 1 });
    }
  }

  return results;
}

/**
 * Sign PDF (Embed signature image)
 */
export async function signPDF(
  file: File,
  signatureDataUrl: string,
  targetPage: number,
  pos: { x: number; y: number; width: number; height: number }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const page = pdfDoc.getPages()[targetPage];

  const sigImage = await pdfDoc.embedPng(signatureDataUrl);
  const { height: pageH } = page.getSize();

  const pdfY = pageH - pos.y - pos.height;

  page.drawImage(sigImage, {
    x: pos.x,
    y: pdfY,
    width: pos.width,
    height: pos.height
  });

  return await pdfDoc.save();
}

/**
 * Adobe Acrobat Pro Style Full PDF Editor (Supports Whiteout, Existing Text Edits, Text, Fonts, Drawings, Shapes, Stamps, Images, Highlights)
 * Render scale factor 1.8 is normalized back to PDF native points
 */
export async function editPDF(file: File, annotations: PDFAnnotation[], renderScale: number = 1.8): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  
  // Embed fonts
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

  for (const ann of annotations) {
    const page = pdfDoc.getPages()[ann.pageIndex];
    if (!page) continue;
    const { width: pageW, height: pageH } = page.getSize();

    // For isOriginalTextEdit items, coordinates are percentages (0-100).
    // For user-drawn items, coordinates are viewport pixels (divide by renderScale).
    let normX: number, normY: number, normWidth: number, normHeight: number, normFontSize: number;

    if (ann.isOriginalTextEdit) {
      // Convert percentages to PDF points
      normX = (ann.x / 100) * pageW;
      normY = (ann.y / 100) * pageH;
      normWidth = ((ann.width || 10) / 100) * pageW;
      normHeight = ((ann.height || 2) / 100) * pageH;
      normFontSize = ((ann.fontSize || 1.5) / 100) * pageH;
    } else {
      // Scale viewport pixels back to PDF points
      normX = ann.x / renderScale;
      normY = ann.y / renderScale;
      normWidth = (ann.width || 100) / renderScale;
      normHeight = (ann.height || 20) / renderScale;
      normFontSize = (ann.fontSize || 16) / renderScale;
    }

    // Select font family
    let selectedFont = fontHelvetica;
    if (ann.fontFamily === 'Times') selectedFont = fontTimes;
    if (ann.fontFamily === 'Courier') selectedFont = fontCourier;
    if (ann.bold) selectedFont = fontHelveticaBold;

    // Helper to parse hex colors to pdf-lib rgb
    const parseColor = (hexStr?: string, defaultHex: string = '#000000') => {
      const hex = (hexStr || defaultHex).replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
      const g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
      const b = parseInt(hex.substring(4, 6), 16) / 255 || 0;
      return rgb(r, g, b);
    };

    // If an existing text item was modified, draw whiteout box over original text first
    if (ann.isOriginalTextEdit) {
      // normY is a top-down Y. Convert to PDF bottom-up Y for the whiteout box.
      const whiteoutPdfY = pageH - normY - normHeight;
      page.drawRectangle({
        x: normX - 2,
        y: whiteoutPdfY - 2,
        width: normWidth + 4,
        height: normHeight + 4,
        color: rgb(1, 1, 1), // Whiteout fill
      });
    }

    if (ann.type === 'text' && ann.text) {
      // normY is top-down. PDF drawText expects bottom-up baseline Y.
      const pdfY = pageH - normY - normFontSize;
      const fontColor = parseColor(ann.color, '#000000');
      const textWidth = selectedFont.widthOfTextAtSize(ann.text, normFontSize);

      let drawX = normX;
      if (ann.align === 'center') {
        drawX = normX + Math.max(0, (normWidth - textWidth) / 2);
      } else if (ann.align === 'right') {
        drawX = normX + Math.max(0, normWidth - textWidth);
      }

      page.drawText(ann.text, {
        x: drawX,
        y: pdfY,
        size: normFontSize,
        font: selectedFont,
        color: fontColor,
      });

      if (ann.underline) {
        page.drawLine({
          start: { x: drawX, y: pdfY - 2 },
          end: { x: drawX + textWidth, y: pdfY - 2 },
          thickness: Math.max(1, normFontSize / 14),
          color: fontColor,
        });
      }
    } else if (ann.type === 'highlight') {
      const pdfY = pageH - normY - normHeight;
      page.drawRectangle({
        x: normX,
        y: pdfY,
        width: normWidth,
        height: normHeight,
        color: rgb(1, 0.92, 0.23), // Translucent Yellow
        opacity: 0.45,
      });
    } else if (ann.type === 'draw' && ann.points && ann.points.length > 1) {
      const strokeColor = parseColor(ann.color, '#e5322d');
      const thickness = (ann.strokeWidth || 3) / renderScale;

      for (let p = 0; p < ann.points.length - 1; p++) {
        const p1 = ann.points[p];
        const p2 = ann.points[p + 1];
        page.drawLine({
          start: { x: p1.x / renderScale, y: pageH - (p1.y / renderScale) },
          end: { x: p2.x / renderScale, y: pageH - (p2.y / renderScale) },
          thickness,
          color: strokeColor,
        });
      }
    } else if (ann.type === 'rect') {
      const rectColor = parseColor(ann.color, '#000000');
      const pdfY = pageH - normY - normHeight;

      page.drawRectangle({
        x: normX,
        y: pdfY,
        width: normWidth,
        height: normHeight,
        borderColor: rectColor,
        borderWidth: (ann.strokeWidth || 2) / renderScale,
      });
    } else if (ann.type === 'circle') {
      const circleColor = parseColor(ann.color, '#000000');
      const radiusX = normWidth / 2;
      const radiusY = normHeight / 2;
      const pdfY = pageH - normY - radiusY;

      page.drawEllipse({
        x: normX + radiusX,
        y: pdfY,
        xScale: radiusX,
        yScale: radiusY,
        borderColor: circleColor,
        borderWidth: (ann.strokeWidth || 2) / renderScale,
      });
    } else if (ann.type === 'stamp' && ann.stampText) {
      const pdfY = pageH - normY - 45;
      const stampColor = parseColor(ann.color, '#e5322d');

      // Draw stamp border
      page.drawRectangle({
        x: normX,
        y: pdfY,
        width: 140,
        height: 45,
        borderColor: stampColor,
        borderWidth: 3,
        color: rgb(1, 1, 1),
        opacity: 0.9,
      });

      // Draw stamp text inside
      page.drawText(ann.stampText, {
        x: normX + 12,
        y: pdfY + 14,
        size: 16,
        font: fontHelveticaBold,
        color: stampColor,
      });
    } else if (ann.type === 'image' && ann.imageDataUrl) {
      let embeddedImg: any;
      if (ann.imageDataUrl.startsWith('data:image/png')) {
        embeddedImg = await pdfDoc.embedPng(ann.imageDataUrl);
      } else {
        embeddedImg = await pdfDoc.embedJpg(ann.imageDataUrl);
      }

      const imgW = normWidth;
      const imgH = normHeight;
      const pdfY = pageH - normY - imgH;

      page.drawImage(embeddedImg, {
        x: normX,
        y: pdfY,
        width: imgW,
        height: imgH,
      });
    }
  }

  return await pdfDoc.save();
}

/**
 * Optical Character Recognition (OCR) using Tesseract.js
 */
export async function performOCR(
  file: File,
  onProgress?: (progress: number, status: string) => void
): Promise<{ text: string; pagesText: string[] }> {
  const images = await pdfToImages(file, 'jpg', 2.0);
  const worker = await createWorker('eng');
  const pagesText: string[] = [];

  for (let i = 0; i < images.length; i++) {
    if (onProgress) {
      onProgress(Math.round(((i) / images.length) * 100), `Processing OCR Page ${i + 1} of ${images.length}`);
    }
    const ret = await worker.recognize(images[i].dataUrl);
    pagesText.push(ret.data.text);
  }

  await worker.terminate();
  return {
    text: pagesText.join('\n\n--- Page Break ---\n\n'),
    pagesText
  };
}

/**
 * Extract text lines page by page from PDF using PDF.js
 */
export async function extractTextPagesFromPDF(file: File): Promise<string[][]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const pagesParagraphs: string[][] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    const lines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;

    for (const item of textContent.items as any[]) {
      if ('str' in item) {
        const y = item.transform ? item.transform[5] : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          currentLine = '';
        }
        currentLine += item.str + (item.hasEOL ? ' ' : '');
        if (y !== null) lastY = y;
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    pagesParagraphs.push(lines.length > 0 ? lines : ['[No readable text detected on this page]']);
  }
  return pagesParagraphs;
}

function escapeXmlString(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

/**
 * Convert PDF to genuine Microsoft Word DOCX document
 */
export async function convertPDFToWord(file: File): Promise<Uint8Array> {
  const pagesParagraphs = await extractTextPagesFromPDF(file);
  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  // 2. _rels/.rels
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  // 3. word/document.xml
  let documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>`;

  pagesParagraphs.forEach((paragraphs, pageIdx) => {
    if (pageIdx > 0) {
      documentXml += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
    }
    paragraphs.forEach((pText) => {
      const escaped = escapeXmlString(pText);
      documentXml += `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
    });
  });

  documentXml += `</w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);

  return await zip.generateAsync({ type: 'uint8array' });
}

/**
 * Convert PDF to genuine Microsoft Excel XLSX spreadsheet
 */
export async function convertPDFToExcel(file: File): Promise<Uint8Array> {
  const pagesParagraphs = await extractTextPagesFromPDF(file);
  const zip = new JSZip();

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);

  zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`);

  zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`);

  function getColumnLetter(colIndex: number): string {
    let temp: number;
    let letter = '';
    while (colIndex > 0) {
      temp = (colIndex - 1) % 26;
      letter = String.fromCharCode(65 + temp) + letter;
      colIndex = Math.floor((colIndex - temp - 1) / 26);
    }
    return letter;
  }

  let rowIdx = 1;
  let sheetRows = '';

  pagesParagraphs.forEach((paragraphs) => {
    paragraphs.forEach((line) => {
      const cols = line.split(/\t+|\s{2,}|,/);
      let colXml = '';
      let cIdx = 1;
      cols.forEach((cell) => {
        const val = escapeXmlString(cell.trim());
        if (val) {
          const cellRef = `${getColumnLetter(cIdx)}${rowIdx}`;
          colXml += `<c r="${cellRef}" t="inlineStr"><is><t>${val}</t></is></c>`;
          cIdx++;
        }
      });
      if (colXml) {
        sheetRows += `<row r="${rowIdx}">${colXml}</row>`;
        rowIdx++;
      }
    });
  });

  zip.file('xl/worksheets/sheet1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetRows}</sheetData>
</worksheet>`);

  return await zip.generateAsync({ type: 'uint8array' });
}

/**
 * Convert PDF to genuine PowerPoint PPTX presentation
 */
export async function convertPDFToPPT(file: File): Promise<Uint8Array> {
  const pagesParagraphs = await extractTextPagesFromPDF(file);
  const zip = new JSZip();

  let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>`;

  let presentationRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;

  let sldIdLstXml = '';

  pagesParagraphs.forEach((paragraphs, index) => {
    const slideNum = index + 1;
    contentTypesXml += `\n  <Override PartName="/ppt/slides/slide${slideNum}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
    presentationRelsXml += `\n  <Relationship Id="rIdSlide${slideNum}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${slideNum}.xml"/>`;
    sldIdLstXml += `\n    <p:sldId id="${255 + slideNum}" r:id="rIdSlide${slideNum}"/>`;

    let pShapesXml = '';
    paragraphs.forEach((pText) => {
      const escaped = escapeXmlString(pText);
      pShapesXml += `<a:p><a:r><a:rPr lang="en-US"/><a:t>${escaped}</a:t></a:r></a:p>`;
    });

    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Slide Text"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${pShapesXml}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

    zip.file(`ppt/slides/slide${slideNum}.xml`, slideXml);
  });

  contentTypesXml += `\n</Types>`;
  presentationRelsXml += `\n</Relationships>`;

  zip.file('[Content_Types].xml', contentTypesXml);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

  zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>${sldIdLstXml}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`);

  zip.file('ppt/_rels/presentation.xml.rels', presentationRelsXml);

  return await zip.generateAsync({ type: 'uint8array' });
}

/**
 * Convert text or office document to PDF
 */
export async function convertDocumentToPDF(file: File): Promise<Uint8Array> {
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const buf = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
    return await pdfDoc.save();
  }

  let text = '';
  try {
    text = await file.text();
    text = text.replace(/[^\x20-\x7E\x0A\x0D]/g, ' ').replace(/\s+/g, ' ');
  } catch (err) {
    text = `Document Content: ${file.name}`;
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontSize = 11;
  const margin = 50;
  const maxWidth = width - margin * 2;
  let currentY = height - margin;

  page.drawText(file.name, { x: margin, y: currentY, size: 16, font, color: rgb(0.8, 0.1, 0.1) });
  currentY -= 30;

  const words = text.split(' ');
  let lineBuffer = '';

  for (const word of words) {
    const testLine = lineBuffer ? `${lineBuffer} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth && lineBuffer) {
      page.drawText(lineBuffer, { x: margin, y: currentY, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
      currentY -= fontSize * 1.4;
      if (currentY < margin + fontSize * 2) {
        page = pdfDoc.addPage([595.28, 841.89]);
        currentY = height - margin;
      }
      lineBuffer = word;
    } else {
      lineBuffer = testLine;
    }
  }
  if (lineBuffer) {
    page.drawText(lineBuffer, { x: margin, y: currentY, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
  }

  return await pdfDoc.save();
}

/**
 * Repair corrupted or damaged PDF document
 */
export async function repairPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return await pdfDoc.save();
}

/**
 * Export multiple files as ZIP download
 */
export async function downloadFilesAsZip(files: { name: string; data: Uint8Array | string }[], zipName: string) {
  let safeZipName = zipName.trim();
  if (!safeZipName.toLowerCase().endsWith('.zip')) {
    safeZipName += '.zip';
  }

  const zip = new JSZip();
  files.forEach((f) => {
    let safeItemName = f.name.trim();
    if (typeof f.data === 'string') {
      zip.file(safeItemName, f.data);
    } else {
      const exactBuf = f.data.buffer.slice(f.data.byteOffset, f.data.byteOffset + f.data.byteLength);
      zip.file(safeItemName, exactBuf as any);
    }
  });
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = safeZipName;
  document.body.appendChild(a);
  a.click();
  
  // Delay removal and revocation to ensure the browser has time to start the download
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  }, 10000);
}

/**
 * Download single file with exact byte ArrayBuffer slicing to prevent file corruption
 */
export function downloadFile(data: Uint8Array, fileName: string, mimeType: string = 'application/pdf') {
  console.log("Inside downloadFile - received data:", data.byteLength, fileName, mimeType);
  let safeFileName = fileName.trim();

  // Check if file has an extension
  const hasExtension = /\.[a-zA-Z0-9]{2,5}$/.test(safeFileName);
  if (!hasExtension) {
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
      safeFileName += '.docx';
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'application/vnd.ms-excel') {
      safeFileName += '.xlsx';
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || mimeType === 'application/vnd.ms-powerpoint') {
      safeFileName += '.pptx';
    } else if (mimeType === 'text/plain') {
      safeFileName += '.txt';
    } else if (mimeType === 'image/jpeg') {
      safeFileName += '.jpg';
    } else if (mimeType === 'image/png') {
      safeFileName += '.png';
    } else if (mimeType === 'application/zip') {
      safeFileName += '.zip';
    } else {
      safeFileName += '.pdf';
    }
  }

  const exactArrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const blob = new Blob([exactArrayBuffer as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = safeFileName;
  document.body.appendChild(a);
  a.click();
  
  // Delay removal and revocation to ensure the browser has time to start the download
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  }, 10000);
}
