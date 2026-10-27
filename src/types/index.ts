export type CategoryId = 'organize' | 'convert-from' | 'convert-to' | 'edit-security' | 'advanced' | 'network-security' | 'media-tools' | 'text-tools' | 'seo-tools' | 'calculators';

export type ToolId = 
  | 'merge-pdf'
  | 'split-pdf'
  | 'remove-pages'
  | 'extract-pages'
  | 'organize-pdf'
  | 'compress-pdf'
  | 'rotate-pdf'
  | 'page-numbers'
  | 'watermark-pdf'
  | 'protect-pdf'
  | 'unlock-pdf'
  | 'sign-pdf'
  | 'redact-pdf'
  | 'compare-pdf'
  | 'pdf-to-jpg'
  | 'pdf-to-word'
  | 'pdf-to-excel'
  | 'pdf-to-ppt'
  | 'pdf-to-pdfa'
  | 'jpg-to-pdf'
  | 'word-to-pdf'
  | 'excel-to-pdf'
  | 'ppt-to-pdf'
  | 'html-to-pdf'
  | 'ocr-pdf'
  | 'repair-pdf'
  | 'speed-test'
  | 'ip-lookup'
  | 'dns-lookup'
  | 'reverse-dns'
  | 'dns-propagation'
  | 'ping-test'
  | 'http-headers'
  | 'website-status'
  | 'ssl-checker'
  | 'whois-lookup'
  | 'subnet-calculator'
  | 'url-scanner'
  | 'hash-generator'
  | 'password-checker'
  | 'password-generator'
  | 'jwt-decoder'
  | 'base64-tool'
  | 'url-encoder'
  | 'security-headers'
  | 'instagram-downloader'
  | 'facebook-downloader'
  | 'tiktok-downloader'
  | 'image-background-remover'
  | 'image-resizer'
  | 'word-counter'
  | 'character-counter'
  | 'case-converter'
  | 'small-text-generator'
  | 'invisible-character'
  | 'text-to-binary'
  | 'binary-to-text'
  | 'morse-code-translator'
  | 'citation-generator'
  | 'image-converter'
  | 'image-cropper'
  | 'color-converter'
  | 'xml-sitemap-generator'
  | 'robots-txt-generator'
  | 'open-graph-generator'
  | 'meta-tag-generator'
  | 'json-formatter'
  | 'html-formatter'
  | 'keyword-density-checker'
  | 'seo-score-checker'
  | 'age-calculator'
  | 'bmi-calculator'
  | 'loan-calculator'
  | 'discount-calculator'
  | 'margin-calculator'
  | 'qr-generator'
  | 'youtube-downloader';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: CategoryId;
  iconName: string;
  badge?: string;
  accept: string;
  multiple: boolean;
  popular?: boolean;
}

export interface PDFPageMeta {
  pageIndex: number;
  dataUrl: string;
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
}

export interface WatermarkOptions {
  text?: string;
  image?: string; // Data URL
  opacity: number;
  fontSize: number;
  color: string; // Hex
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  rotation: number;
  overContent: boolean;
}

export interface PageNumberOptions {
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  format: 'number-only' | 'page-n' | 'page-n-of-x';
  fontSize: number;
  fontColor: string;
  startFrom: number;
}

export interface PDFAnnotation {
  id: string;
  type: 'text' | 'draw' | 'rect' | 'circle' | 'line' | 'arrow' | 'image' | 'stamp' | 'highlight';
  pageIndex: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
  bgColor?: string;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  strokeWidth?: number;
  points?: { x: number; y: number }[];
  imageDataUrl?: string;
  stampText?: string;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  isOriginalTextEdit?: boolean;
  isUnmodifiedOriginal?: boolean;
}
