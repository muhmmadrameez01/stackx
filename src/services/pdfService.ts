import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { createWorker } from 'tesseract.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
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
 * Protect PDF with Password using standard AES-256 / RC4 encryption.
 * Encrypts document streams and sets user/owner password security.
 */
export async function protectPDF(file: File, userPass: string, ownerPass: string): Promise<Uint8Array> {
  const srcBuf = await file.arrayBuffer();
  const srcBytes = new Uint8Array(srcBuf);

  // Normalize document with pdf-lib first to ensure clean streams and valid trailer
  const pdfDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
  const normalizedBytes = await pdfDoc.save();

  try {
    return await encryptPDF(normalizedBytes, userPass, {
      ownerPassword: ownerPass || userPass,
      algorithm: 'AES-256',
      allowPrinting: true,
      allowCopying: false,
      allowModifying: false,
    });
  } catch (err) {
    console.warn('AES-256 encryption unavailable, falling back to RC4:', err);
    return await encryptPDF(normalizedBytes, userPass, {
      ownerPassword: ownerPass || userPass,
      algorithm: 'RC4',
      allowPrinting: true,
      allowCopying: false,
      allowModifying: false,
    });
  }
}

/**
 * Unlock Password Protected PDF using PDF.js decryption + clean unencrypted recreation
 */
export async function unlockPDF(file: File, passwordInput: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, password: passwordInput });
    const pdf = await loadingTask.promise;

    const newPdf = await PDFDocument.create();
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const origViewport = page.getViewport({ scale: 1.0 });
      const renderViewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement('canvas');
      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport: renderViewport, canvas } as any).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const base64 = dataUrl.split(',')[1];
        const binary = atob(base64);
        const imgBytes = new Uint8Array(binary.length);
        for (let b = 0; b < binary.length; b++) imgBytes[b] = binary.charCodeAt(b);

        const embeddedImg = await newPdf.embedJpg(imgBytes);
        const p = newPdf.addPage([origViewport.width, origViewport.height]);
        p.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height,
        });
      }
    }

    return await newPdf.save();
  } catch (err: any) {
    if (err.name === 'PasswordException' || err.message?.toLowerCase().includes('password')) {
      throw new Error('Incorrect password provided. Please enter the correct PDF password.');
    }
    throw new Error(err.message || 'Failed to unlock PDF. Please verify password.');
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
 * Render formatted plain text or document content into a clean, multi-page PDF
 */
export async function renderTextToPDF(title: string, content: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  const fontSize = 10;
  const lineHeight = 15;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  // Header Title
  page.drawText(title, {
    x: margin,
    y: currentY - 14,
    size: 16,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  currentY -= 26;

  page.drawLine({
    start: { x: margin, y: currentY },
    end: { x: pageWidth - margin, y: currentY },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.92),
  });
  currentY -= 20;

  const paragraphs = content.split(/\r?\n\r?\n|\n/);

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      currentY -= 8;
      continue;
    }

    const words = trimmed.split(/\s+/);
    let line = '';

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const testWidth = fontRegular.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > contentWidth && line) {
        if (currentY - lineHeight < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }
        page.drawText(line, {
          x: margin,
          y: currentY,
          size: fontSize,
          font: fontRegular,
          color: rgb(0.15, 0.18, 0.23),
        });
        currentY -= lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      if (currentY - lineHeight < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
      page.drawText(line, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: fontRegular,
        color: rgb(0.15, 0.18, 0.23),
      });
      currentY -= lineHeight;
    }

    currentY -= 6;
  }

  return await pdfDoc.save();
}

/**
 * Extract text lines page by page from PDF with natural reading order and word spacing
 */
export async function extractTextPagesFromPDF(file: File): Promise<string[][]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const pagesParagraphs: string[][] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    interface PDFTextItem {
      str: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }

    const items: PDFTextItem[] = [];
    for (const rawItem of textContent.items as any[]) {
      if (rawItem && typeof rawItem.str === 'string' && rawItem.str.length > 0) {
        const tx = rawItem.transform || [1, 0, 0, 1, 0, 0];
        items.push({
          str: rawItem.str,
          x: tx[4] ?? 0,
          y: tx[5] ?? 0,
          width: rawItem.width ?? 0,
          height: rawItem.height || Math.abs(tx[3]) || 12,
        });
      }
    }

    // Sort items top-to-bottom (Y descending), then left-to-right (X ascending)
    items.sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 4) {
        return yDiff;
      }
      return a.x - b.x;
    });

    const lines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;
    let lastX = 0;
    let lastW = 0;

    for (const item of items) {
      if (lastY !== null && Math.abs(item.y - lastY) > 5) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = '';
        lastX = 0;
        lastW = 0;
      }

      if (currentLine && lastW > 0 && (item.x - (lastX + lastW)) > 2 && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
        currentLine += ' ';
      }

      currentLine += item.str;
      lastY = item.y;
      lastX = item.x;
      lastW = item.width;
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    pagesParagraphs.push(lines.length > 0 ? lines : ['[No readable text detected on this page]']);
  }

  return pagesParagraphs;
}

/**
 * Convert PDF to genuine Microsoft Word DOCX document
 */
export async function convertPDFToWord(file: File): Promise<Uint8Array> {
  const pagesParagraphs = await extractTextPagesFromPDF(file);

  const doc = new Document({
    sections: pagesParagraphs.map((paragraphs, pageIdx) => ({
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children: [
        ...(pageIdx > 0 ? [new Paragraph({ children: [new TextRun({ break: 1 })] })] : []),
        ...paragraphs.map((line) => new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 24, // 12pt
              font: 'Calibri',
            }),
          ],
          spacing: {
            after: 120, // 6pt
            line: 276, // 1.15
          },
        })),
      ],
    })),
  });

  const arrayBuffer = await Packer.toArrayBuffer(doc);
  return new Uint8Array(arrayBuffer);
}

/**
 * Convert PDF to genuine Microsoft Excel XLSX spreadsheet
 */
export async function convertPDFToExcel(file: File): Promise<Uint8Array> {
  const pagesParagraphs = await extractTextPagesFromPDF(file);
  const rows: string[][] = [];

  pagesParagraphs.forEach((paragraphs) => {
    paragraphs.forEach((line) => {
      const cols = line.split(/\t+|\s{2,}|,/);
      const cleanCols = cols.map(c => c.trim());
      if (cleanCols.some(c => c.length > 0)) {
        rows.push(cleanCols);
      }
    });
  });

  if (rows.length === 0) {
    rows.push(['No readable tabular data found in PDF']);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const u8 = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(u8);
}

/**
 * Convert PDF to genuine PowerPoint PPTX presentation
 */
export async function convertPDFToPPT(file: File): Promise<Uint8Array> {
  const pagesParagraphs = await extractTextPagesFromPDF(file);
  const PptxGen = (await import('pptxgenjs')).default;
  const pptx = new PptxGen();

  pagesParagraphs.forEach((paragraphs, index) => {
    const slide = pptx.addSlide();
    const slideNum = index + 1;

    if (paragraphs.length > 0) {
      const title = paragraphs[0].slice(0, 80);
      slide.addText(title, {
        x: 0.8,
        y: 0.6,
        w: 8.4,
        h: 0.8,
        fontSize: 20,
        bold: true,
        color: '1E293B',
      });

      const bodyText = paragraphs.slice(1).join('\n\n');
      if (bodyText.trim()) {
        slide.addText(bodyText, {
          x: 0.8,
          y: 1.6,
          w: 8.4,
          h: 4.8,
          fontSize: 12,
          color: '334155',
          lineSpacing: 18,
        });
      }
    } else {
      slide.addText(`Slide ${slideNum}`, {
        x: 0.8,
        y: 2.5,
        w: 8.4,
        h: 1.0,
        fontSize: 24,
        bold: true,
        color: '64748B',
        align: 'center',
      });
    }
  });

  const data = await pptx.write({ outputType: 'uint8array' });
  return data as Uint8Array;
}

/**
 * Convert Microsoft Word (.docx, .doc) to PDF
 */
export async function convertWordToPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  let extractedText = '';

  // 1. Try mammoth
  try {
    const input = typeof Buffer !== 'undefined' ? { buffer: Buffer.from(arrayBuffer) } : { arrayBuffer };
    const res = await mammoth.extractRawText(input as any);
    if (res && res.value && res.value.trim().length > 0) {
      extractedText = res.value;
    }
  } catch (err) {
    console.warn('Mammoth extraction failed, falling back to JSZip:', err);
  }

  // 2. JSZip fallback for DOCX
  if (!extractedText.trim()) {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (docXml) {
        const pMatches = docXml.match(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g) || [];
        const lines: string[] = [];
        for (const pXml of pMatches) {
          const tMatches = Array.from(pXml.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)).map(m => m[1]);
          const line = tMatches.join('').trim();
          if (line) lines.push(line);
        }
        if (lines.length > 0) {
          extractedText = lines.join('\n\n');
        }
      }
    } catch (err) {
      console.warn('JSZip DOCX fallback failed:', err);
    }
  }

  // 3. Fallback for legacy .doc binary format
  if (!extractedText.trim()) {
    try {
      const decoder = new TextDecoder('latin1');
      const raw = decoder.decode(arrayBuffer);
      const matches = raw.match(/[\x20-\x7E\xA0-\xFF]{4,}/g) || [];
      const cleanLines = matches
        .map(s => s.trim())
        .filter(s => s.length > 3 && !s.includes('CompObj') && !s.includes('WordDocument') && !s.startsWith('\x00'));
      if (cleanLines.length > 0) {
        extractedText = cleanLines.join('\n');
      }
    } catch (e) {
      // ignore
    }
  }

  if (!extractedText.trim()) {
    extractedText = `Document: ${file.name}\n\n[No readable text could be extracted from this document]`;
  }

  return await renderTextToPDF(file.name.replace(/\.[^/.]+$/, ''), extractedText);
}

/**
 * Convert Microsoft Excel (.xlsx, .xls, .csv) to styled landscape PDF
 */
export async function convertExcelToPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 841.89; // Landscape A4
  const pageHeight = 595.28;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const fontSize = 8.5;
  const cellPadding = 4;
  const rowHeight = 18;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
    if (!rawRows || rawRows.length === 0) continue;

    const rows = rawRows.filter(r => Array.isArray(r) && r.some(c => String(c).trim().length > 0));
    if (rows.length === 0) continue;

    const colCount = Math.min(12, Math.max(...rows.map(r => r.length)));
    if (colCount === 0) continue;

    const colWidth = contentWidth / colCount;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    // Sheet Title Header
    page.drawText(`${file.name.replace(/\.[^/.]+$/, '')} — ${sheetName}`, {
      x: margin,
      y: currentY - 12,
      size: 14,
      font: fontBold,
      color: rgb(0.12, 0.16, 0.22),
    });
    currentY -= 26;

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      if (currentY - rowHeight < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }

      const row = rows[rIdx];
      const isHeader = rIdx === 0;

      // Row background
      if (isHeader) {
        page.drawRectangle({
          x: margin,
          y: currentY - rowHeight,
          width: contentWidth,
          height: rowHeight,
          color: rgb(0.92, 0.94, 0.97),
        });
      } else if (rIdx % 2 === 1) {
        page.drawRectangle({
          x: margin,
          y: currentY - rowHeight,
          width: contentWidth,
          height: rowHeight,
          color: rgb(0.98, 0.98, 0.99),
        });
      }

      // Draw Cells
      for (let cIdx = 0; cIdx < colCount; cIdx++) {
        const cellX = margin + cIdx * colWidth;
        const cellVal = String(row[cIdx] ?? '').trim();

        page.drawRectangle({
          x: cellX,
          y: currentY - rowHeight,
          width: colWidth,
          height: rowHeight,
          borderColor: rgb(0.85, 0.88, 0.92),
          borderWidth: 0.5,
        });

        if (cellVal) {
          let displayVal = cellVal;
          const maxTextW = colWidth - cellPadding * 2;
          const activeFont = isHeader ? fontBold : fontRegular;
          while (displayVal.length > 3 && activeFont.widthOfTextAtSize(displayVal, fontSize) > maxTextW) {
            displayVal = displayVal.slice(0, -2) + '…';
          }

          page.drawText(displayVal, {
            x: cellX + cellPadding,
            y: currentY - rowHeight + 5,
            size: fontSize,
            font: activeFont,
            color: isHeader ? rgb(0.1, 0.15, 0.2) : rgb(0.2, 0.25, 0.3),
          });
        }
      }

      currentY -= rowHeight;
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawText(`Spreadsheet: ${file.name} (No sheet data found)`, {
      x: margin,
      y: pageHeight - margin - 20,
      size: 14,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  return await pdfDoc.save();
}

/**
 * Convert Microsoft PowerPoint (.pptx, .ppt) to styled slide presentation PDF
 */
export async function convertPPTToPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const slideWidth = 841.89; // Standard 16:9 Landscape
  const slideHeight = 473.56;
  const margin = 45;

  let slideCount = 0;

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const slideFiles = Object.keys(zip.files)
      .filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)![0], 10);
        const numB = parseInt(b.match(/\d+/)![0], 10);
        return numA - numB;
      });

    for (let i = 0; i < slideFiles.length; i++) {
      const xml = await zip.file(slideFiles[i])?.async('text');
      if (!xml) continue;

      slideCount++;
      const page = pdfDoc.addPage([slideWidth, slideHeight]);

      // Slide boundary card
      page.drawRectangle({
        x: 15,
        y: 15,
        width: slideWidth - 30,
        height: slideHeight - 30,
        borderColor: rgb(0.88, 0.9, 0.94),
        borderWidth: 1,
        color: rgb(0.99, 0.99, 1),
      });

      const paragraphs: string[] = [];
      const pMatches = xml.match(/<a:p(?:\s[^>]*)?>[\s\S]*?<\/a:p>/g) || [];
      for (const pXml of pMatches) {
        const tMatches = Array.from(pXml.matchAll(/<a:t(?:\s[^>]*)?>([^<]*)<\/a:t>/g)).map(m => m[1]);
        const text = tMatches.join('').trim();
        if (text) {
          paragraphs.push(text);
        }
      }

      let currentY = slideHeight - margin - 20;

      if (paragraphs.length > 0) {
        const titleText = paragraphs[0];
        page.drawText(titleText.slice(0, 70), {
          x: margin,
          y: currentY,
          size: 20,
          font: fontBold,
          color: rgb(0.12, 0.16, 0.24),
        });
        currentY -= 28;

        page.drawLine({
          start: { x: margin, y: currentY },
          end: { x: slideWidth - margin, y: currentY },
          thickness: 1.5,
          color: rgb(0.82, 0.85, 0.9),
        });
        currentY -= 25;

        for (let pIdx = 1; pIdx < paragraphs.length; pIdx++) {
          if (currentY < margin + 30) break;
          const bodyText = `•  ${paragraphs[pIdx]}`;
          page.drawText(bodyText.slice(0, 110), {
            x: margin + 10,
            y: currentY,
            size: 13,
            font: fontRegular,
            color: rgb(0.2, 0.24, 0.3),
          });
          currentY -= 22;
        }
      } else {
        page.drawText(`Slide ${i + 1}`, {
          x: margin,
          y: currentY,
          size: 22,
          font: fontBold,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      page.drawText(`Slide ${i + 1} of ${slideFiles.length}`, {
        x: slideWidth - margin - 80,
        y: 25,
        size: 9,
        font: fontRegular,
        color: rgb(0.6, 0.65, 0.7),
      });
    }
  } catch (err) {
    console.warn('PPTX parsing error:', err);
  }

  if (slideCount === 0) {
    return await renderTextToPDF(file.name.replace(/\.[^/.]+$/, ''), `Presentation: ${file.name}`);
  }

  return await pdfDoc.save();
}

/**
 * Convert HTML document to PDF with visual canvas rendering and semantic fallback
 */
export async function convertHTMLToPDF(file: File): Promise<Uint8Array> {
  const htmlText = await file.text();

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-99999px';
      container.style.left = '-99999px';
      container.style.width = '800px';
      container.style.background = '#ffffff';
      container.style.color = '#000000';
      container.style.padding = '30px';
      container.style.boxSizing = 'border-box';
      container.innerHTML = htmlText;
      document.body.appendChild(container);

      // Allow a brief moment for styles/images to settle
      await new Promise(r => setTimeout(r, 120));

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(container);

      const pdfDoc = await PDFDocument.create();
      const a4Width = 595.28;
      const a4Height = 841.89;
      const pageCanvasHeight = (canvas.width * a4Height) / a4Width;
      let renderedHeight = 0;

      while (renderedHeight < canvas.height) {
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(pageCanvasHeight, canvas.height - renderedHeight);
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            renderedHeight,
            canvas.width,
            sliceCanvas.height,
            0,
            0,
            canvas.width,
            sliceCanvas.height
          );

          const dataUrl = sliceCanvas.toDataURL('image/jpeg', 0.95);
          const base64 = dataUrl.split(',')[1];
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let b = 0; b < binaryStr.length; b++) bytes[b] = binaryStr.charCodeAt(b);

          const embedded = await pdfDoc.embedJpg(bytes);
          const sliceHeightPdf = (sliceCanvas.height * a4Width) / canvas.width;
          const page = pdfDoc.addPage([a4Width, a4Height]);
          page.drawImage(embedded, {
            x: 0,
            y: a4Height - sliceHeightPdf,
            width: a4Width,
            height: sliceHeightPdf,
          });
        }
        renderedHeight += pageCanvasHeight;
      }

      if (pdfDoc.getPageCount() > 0) {
        return await pdfDoc.save();
      }
    } catch (err) {
      console.warn('Visual HTML rendering failed, falling back to semantic layout:', err);
    }
  }

  // Semantic fallback
  let cleanText = '';
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    doc.querySelectorAll('script, style, noscript, svg').forEach(el => el.remove());
    cleanText = doc.body?.textContent || doc.body?.innerText || '';
  } else {
    cleanText = htmlText
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
  }

  cleanText = cleanText.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim();
  return await renderTextToPDF(file.name.replace(/\.[^/.]+$/, ''), cleanText);
}

/**
 * Smart dispatcher: Convert text or office document to PDF
 */
export async function convertDocumentToPDF(file: File): Promise<Uint8Array> {
  const fileName = file.name.toLowerCase();

  if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
    const buf = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
    return await pdfDoc.save();
  }

  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return await convertWordToPDF(file);
  }

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
    return await convertExcelToPDF(file);
  }

  if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
    return await convertPPTToPDF(file);
  }

  if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    return await convertHTMLToPDF(file);
  }

  // Plain text fallback
  let text = '';
  try {
    text = await file.text();
  } catch (err) {
    text = `Document Content: ${file.name}`;
  }
  return await renderTextToPDF(file.name.replace(/\.[^/.]+$/, ''), text);
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
