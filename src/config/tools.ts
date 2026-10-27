import type { ToolDefinition } from '../types';

export const TOOLS: ToolDefinition[] = [
  // Organize PDF
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    shortDescription: 'Combine PDFs in the order you want with the easiest PDF merger available.',
    fullDescription: 'Select multiple PDF files and combine them into a single unified document in seconds.',
    category: 'organize',
    iconName: 'GitMerge',
    accept: '.pdf',
    multiple: true,
    popular: true
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    shortDescription: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    fullDescription: 'Extract specific pages or page ranges from your PDF document into separate files.',
    category: 'organize',
    iconName: 'Scissors',
    accept: '.pdf',
    multiple: false,
    popular: true
  },
  {
    id: 'remove-pages',
    name: 'Remove PDF Pages',
    shortDescription: 'Delete unwanted pages from your PDF file in a few clicks.',
    fullDescription: 'Visually select and remove unnecessary pages from your PDF document instantly.',
    category: 'organize',
    iconName: 'Trash2',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'extract-pages',
    name: 'Extract PDF Pages',
    shortDescription: 'Pick specific pages from a PDF document to create a new customized file.',
    fullDescription: 'Select high-value pages and export them as a clean new PDF document.',
    category: 'organize',
    iconName: 'FileCheck',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'organize-pdf',
    name: 'Organize PDF',
    shortDescription: 'Sort, delete, and rotate PDF pages directly in an interactive grid view.',
    fullDescription: 'Drag and drop PDF pages to reorder them, delete unwanted pages, or rotate individual pages.',
    category: 'organize',
    iconName: 'LayoutGrid',
    accept: '.pdf',
    multiple: true,
    popular: true
  },

  // Optimize & Edit
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    shortDescription: 'Reduce file size while optimizing for maximal PDF quality.',
    fullDescription: 'Shrink the filesize of your PDF without losing visual clarity for easy email sharing.',
    category: 'advanced',
    iconName: 'Minimize2',
    accept: '.pdf',
    multiple: false,
    popular: true
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    shortDescription: 'Rotate your PDFs the way you need. You can even rotate multiple PDFs at once!',
    fullDescription: 'Turn your PDF pages 90°, 180°, or 270° clockwise or counter-clockwise.',
    category: 'organize',
    iconName: 'RotateCw',
    accept: '.pdf',
    multiple: true
  },
  {
    id: 'watermark-pdf',
    name: 'Watermark PDF',
    shortDescription: 'Stamp an image or text over your PDF in seconds. Choose typography, position, & transparency.',
    fullDescription: 'Protect your document rights by embedding custom text or image logos onto every page.',
    category: 'edit-security',
    iconName: 'Stamp',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'page-numbers',
    name: 'Page Numbers',
    shortDescription: 'Add page numbers into your PDFs with ease. Choose position, dimensions, & format.',
    fullDescription: 'Format your PDF with professional header or footer page numbers with custom font styling.',
    category: 'edit-security',
    iconName: 'Binary',
    accept: '.pdf',
    multiple: false
  },

  // Security & Sign
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    shortDescription: 'Encrypt your PDF file with a strong password to prevent unauthorized access.',
    fullDescription: 'Secure sensitive PDF files with password protection and strong stream encryption.',
    category: 'edit-security',
    iconName: 'Lock',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    shortDescription: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.',
    fullDescription: 'Decrypt password-protected PDFs so you can view, print, and edit them freely.',
    category: 'edit-security',
    iconName: 'Unlock',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'sign-pdf',
    name: 'Sign PDF',
    shortDescription: 'Sign yourself or request electronic signatures from others.',
    fullDescription: 'Draw your signature, type it out, or upload a signature image to place onto any PDF page.',
    category: 'edit-security',
    iconName: 'FileSignature',
    popular: true,
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'redact-pdf',
    name: 'Redact PDF',
    shortDescription: 'Permanently remove or black out sensitive text and graphics from your PDF.',
    fullDescription: 'Erase confidential information permanently before sharing your document.',
    category: 'edit-security',
    iconName: 'EyeOff',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'compare-pdf',
    name: 'Compare PDF',
    shortDescription: 'Compare two PDF documents side by side to visually inspect modifications.',
    fullDescription: 'Diff two PDF files side by side or overlaid to spot text and graphic differences.',
    category: 'advanced',
    iconName: 'Columns',
    accept: '.pdf',
    multiple: true
  },

  // Convert FROM PDF
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    shortDescription: 'Extract all images that are in a PDF file or convert each page to a JPG image.',
    fullDescription: 'High resolution conversion of PDF pages into clean JPEG/PNG graphic files.',
    category: 'convert-from',
    iconName: 'FileImage',
    accept: '.pdf',
    multiple: false,
    popular: true
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to WORD',
    shortDescription: 'Easily convert your PDF file into editable DOCX document format.',
    fullDescription: 'Convert PDF files into Microsoft Word documents with editable layout structure.',
    category: 'convert-from',
    iconName: 'FileText',
    accept: '.pdf',
    multiple: false,
    popular: true
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to EXCEL',
    shortDescription: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.',
    fullDescription: 'Extract tables and numerical data from PDF pages into Microsoft Excel spreadsheets.',
    category: 'convert-from',
    iconName: 'FileSpreadsheet',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to POWERPOINT',
    shortDescription: 'Turn your PDF files into easy-to-edit PPT and PPTX slide presentations.',
    fullDescription: 'Transform PDF pages into editable PowerPoint slide decks.',
    category: 'convert-from',
    iconName: 'Presentation',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'pdf-to-pdfa',
    name: 'PDF to PDF/A',
    shortDescription: 'Transform your PDF into PDF/A for long-term archiving and standard compliance.',
    fullDescription: 'Convert standard PDF files to ISO standardized PDF/A format for legal long-term archiving.',
    category: 'convert-from',
    iconName: 'Archive',
    accept: '.pdf',
    multiple: false
  },

  // Convert TO PDF
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    shortDescription: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
    fullDescription: 'Combine JPG, PNG, and WebP photos into a clean single PDF file.',
    category: 'convert-to',
    iconName: 'ImagePlus',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: true,
    popular: true
  },
  {
    id: 'word-to-pdf',
    name: 'WORD to PDF',
    shortDescription: 'Make DOC and DOCX files easy to read by converting them to PDF.',
    fullDescription: 'Convert Microsoft Word files into exact print-ready PDF files.',
    category: 'convert-to',
    iconName: 'FileCheck2',
    accept: '.doc,.docx',
    multiple: false,
    popular: true
  },
  {
    id: 'excel-to-pdf',
    name: 'EXCEL to PDF',
    shortDescription: 'Make EXCEL spreadsheets easy to read by converting them to PDF.',
    fullDescription: 'Convert Microsoft Excel spreadsheets into clean PDF documents.',
    category: 'convert-to',
    iconName: 'Table',
    accept: '.xls,.xlsx',
    multiple: false
  },
  {
    id: 'ppt-to-pdf',
    name: 'POWERPOINT to PDF',
    shortDescription: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.',
    fullDescription: 'Convert PowerPoint slide presentations into seamless PDF documents.',
    category: 'convert-to',
    iconName: 'MonitorPlay',
    accept: '.ppt,.pptx',
    multiple: false
  },
  {
    id: 'html-to-pdf',
    name: 'HTML to PDF',
    shortDescription: 'Convert web pages or HTML code directly into a downloadable PDF document.',
    fullDescription: 'Paste raw HTML content or website links to render and capture PDF files.',
    category: 'convert-to',
    iconName: 'Code',
    accept: '*',
    multiple: false
  },

  // Advanced Tools
  {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    shortDescription: 'Convert scanned PDF documents with non-selectable text into searchable PDFs.',
    fullDescription: 'Optical Character Recognition engine to scan image text and produce searchable text PDFs.',
    category: 'advanced',
    iconName: 'ScanText',
    badge: 'AI Powered',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'repair-pdf',
    name: 'Repair PDF',
    shortDescription: 'Repair damaged or corrupted PDFs and recover data from broken files.',
    fullDescription: 'Scan and repair corrupted PDF objects and rebuild broken document headers.',
    category: 'advanced',
    iconName: 'Wrench',
    accept: '.pdf',
    multiple: false
  },

  // Network & Security Tools
  {
    id: 'speed-test',
    name: 'Internet Speed Test',
    shortDescription: 'Test internet Download, Upload speed, Ping, & Jitter latency in real-time.',
    fullDescription: 'Comprehensive browser speed test to measure latency, download bitrate, and upload bandwidth.',
    category: 'network-security',
    iconName: 'Zap',
    accept: '*',
    multiple: false,
    popular: true
  },
  {
    id: 'ip-lookup',
    name: 'IP Address Lookup',
    shortDescription: 'Lookup IP address details including ISP, Country, City, Region, & ASN.',
    fullDescription: 'Geolocation and Autonomous System Number (ASN) lookup for IPv4 and IPv6 addresses.',
    category: 'network-security',
    iconName: 'Globe',
    accept: '*',
    multiple: false,
    popular: true
  },
  {
    id: 'dns-lookup',
    name: 'DNS Lookup',
    shortDescription: 'Query A, AAAA, MX, TXT, CNAME, & NS records via Cloudflare DoH.',
    fullDescription: 'Perform instant DNS record queries for any domain using secure DNS-over-HTTPS.',
    category: 'network-security',
    iconName: 'Search',
    accept: '*',
    multiple: false
  },
  {
    id: 'reverse-dns',
    name: 'Reverse DNS Lookup',
    shortDescription: 'Find hostnames associated with any target IP address or PTR record.',
    fullDescription: 'Query PTR records to resolve IP addresses back to domain names.',
    category: 'network-security',
    iconName: 'Server',
    accept: '*',
    multiple: false
  },
  {
    id: 'dns-propagation',
    name: 'DNS Propagation Checker',
    shortDescription: 'Check global DNS record propagation across worldwide resolution nodes.',
    fullDescription: 'Monitor DNS record propagation status across multiple global DNS servers.',
    category: 'network-security',
    iconName: 'Activity',
    accept: '*',
    multiple: false
  },
  {
    id: 'subnet-calculator',
    name: 'Subnet & IP Calculator',
    shortDescription: 'Calculate IPv4 Subnet mask, Network IP, Broadcast IP, & Usable host range.',
    fullDescription: 'CIDR subnet calculator to determine network bounds, netmask, and usable IP counts.',
    category: 'network-security',
    iconName: 'Cpu',
    accept: '*',
    multiple: false
  },
  {
    id: 'hash-generator',
    name: 'File & Hash Generator',
    shortDescription: 'Generate MD5, SHA-1, SHA-256, & SHA-512 hashes for text or files.',
    fullDescription: 'Compute cryptographic hashes for strings and document files instantly via Web Crypto.',
    category: 'network-security',
    iconName: 'Hash',
    accept: '*',
    multiple: false,
    popular: true
  },
  {
    id: 'password-generator',
    name: 'Password Generator & Checker',
    shortDescription: 'Generate high-entropy secure passwords & analyze crack strength.',
    fullDescription: 'Customizable random password generator and entropy strength evaluator.',
    category: 'network-security',
    iconName: 'Key',
    accept: '*',
    multiple: false,
    popular: true
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    shortDescription: 'Decode JSON Web Tokens (JWT) to inspect Header, Payload, & Expiration.',
    fullDescription: 'Parse and validate JWT tokens, displaying decoded JSON claims and signature info.',
    category: 'network-security',
    iconName: 'FileCode',
    accept: '*',
    multiple: false
  },
  {
    id: 'base64-tool',
    name: 'Base64 Encoder / Decoder',
    shortDescription: 'Encode text strings to Base64 format or decode Base64 back to plain text.',
    fullDescription: 'Safe client-side Base64 string encoding and decoding utility.',
    category: 'network-security',
    iconName: 'Lock',
    accept: '*',
    multiple: false
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder / Decoder',
    shortDescription: 'Encode special characters into percent-encoded URL strings.',
    fullDescription: 'Convert strings to URL-safe percent-encoding or decode URL parameters.',
    category: 'network-security',
    iconName: 'Globe',
    accept: '*',
    multiple: false
  },
  {
    id: 'website-status',
    name: 'Website & Security Scanner',
    shortDescription: 'Check HTTP response status, response time, SSL, & security headers.',
    fullDescription: 'Audit domain status, HTTPS availability, and security headers (HSTS, CSP, X-Frame).',
    category: 'network-security',
    iconName: 'ShieldCheck',
    accept: '*',
    multiple: false,
    popular: true
  },

  // Media Tools
  {
    id: 'instagram-downloader',
    name: 'Instagram Downloader',
    shortDescription: 'Download Reels, videos, and posts from Instagram.',
    fullDescription: 'Save your favorite Instagram Reels and video posts locally.',
    category: 'media-tools',
    iconName: 'Smartphone',
    accept: '*',
    multiple: false
  },
  {
    id: 'facebook-downloader',
    name: 'Facebook Downloader',
    shortDescription: 'Download public videos and clips from Facebook.',
    fullDescription: 'Easily save Facebook videos in available qualities.',
    category: 'media-tools',
    iconName: 'Globe',
    accept: '*',
    multiple: false
  },
  {
    id: 'tiktok-downloader',
    name: 'TikTok Downloader',
    shortDescription: 'Download TikTok videos without watermarks.',
    fullDescription: 'Quickly fetch and download TikTok videos.',
    category: 'media-tools',
    iconName: 'Tv',
    accept: '*',
    multiple: false,
    popular: true
  },
  {
    id: 'image-background-remover',
    name: 'Background Remover',
    shortDescription: 'Remove image backgrounds instantly in high quality using AI.',
    fullDescription: 'Instantly strip the background from any photo in your browser with high quality Edge detection and privacy.',
    category: 'media-tools',
    iconName: 'Image',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: false,
    popular: true
  },
  {
    id: 'image-resizer',
    name: 'Bulk Image Resizer',
    shortDescription: 'Resize, crop, and compress images in bulk.',
    fullDescription: 'Quickly resize single or multiple images simultaneously. Adjust dimensions, enforce aspect ratios, and compress image files completely client-side.',
    category: 'media-tools',
    iconName: 'Maximize',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: true,
    popular: true
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    shortDescription: 'Convert between JPG, PNG, WEBP, and ICO (Favicon).',
    fullDescription: 'Easily convert images between formats completely offline. Create website Favicons instantly.',
    category: 'media-tools',
    iconName: 'RefreshCcw',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: true,
    popular: true
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    shortDescription: 'Visually crop images into custom ratios or circles.',
    fullDescription: 'An interactive canvas tool to crop your photos manually. Supports free-form, square, and circular crops.',
    category: 'media-tools',
    iconName: 'Crop',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: false
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    shortDescription: 'Convert RGB to HEX and pick colors from images.',
    fullDescription: 'Translate RGB values to HEX codes effortlessly. Useful for web designers and front-end developers.',
    category: 'media-tools',
    iconName: 'Palette',
    accept: '*',
    multiple: false
  },
  
  // Text Tools
  {
    id: 'word-counter',
    name: 'Word Counter',
    shortDescription: 'Count words, characters, sentences, and paragraphs.',
    fullDescription: 'A comprehensive text analysis tool that counts words, characters, sentences, paragraphs, and reading time instantly.',
    category: 'text-tools',
    iconName: 'WholeWord',
    accept: '*',
    multiple: false,
    popular: true
  },
  {
    id: 'character-counter',
    name: 'Character Counter',
    shortDescription: 'Count total characters with or without spaces.',
    fullDescription: 'Quickly analyze the length of your text, useful for tweets, meta descriptions, and strict character limits.',
    category: 'text-tools',
    iconName: 'Type',
    accept: '*',
    multiple: false
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    shortDescription: 'Convert text to UPPERCASE, lowercase, Title Case, etc.',
    fullDescription: 'Easily transform the capitalization of your text into sentence case, lower case, upper case, or capitalized case.',
    category: 'text-tools',
    iconName: 'CaseUpper',
    accept: '*',
    multiple: false
  },
  {
    id: 'small-text-generator',
    name: 'Small Text Generator',
    shortDescription: 'Generate tiny superscript and subscript text.',
    fullDescription: 'Convert normal text into tiny superscript or subscript characters for social media profiles and aesthetic posts.',
    category: 'text-tools',
    iconName: 'Superscript',
    accept: '*',
    multiple: false
  },
  {
    id: 'invisible-character',
    name: 'Invisible Character',
    shortDescription: 'Copy empty/invisible spaces for social media.',
    fullDescription: 'Generate zero-width spaces, empty characters, and invisible text blocks for use in games, social media, and formatting.',
    category: 'text-tools',
    iconName: 'ScanFace',
    accept: '*',
    multiple: false
  },
  {
    id: 'text-to-binary',
    name: 'Text to Binary',
    shortDescription: 'Convert regular text into binary code.',
    fullDescription: 'Translate standard text characters into binary code (0s and 1s) instantly.',
    category: 'text-tools',
    iconName: 'Binary',
    accept: '*',
    multiple: false
  },
  {
    id: 'binary-to-text',
    name: 'Binary to Text',
    shortDescription: 'Decode binary code back into human-readable text.',
    fullDescription: 'Translate strings of 0s and 1s back into standard alphanumeric characters.',
    category: 'text-tools',
    iconName: 'FileDigit',
    accept: '*',
    multiple: false
  },
  {
    id: 'morse-code-translator',
    name: 'Morse Code Translator',
    shortDescription: 'Translate text to morse code and vice versa.',
    fullDescription: 'Easily encode your text into standard morse code dots and dashes, or decode morse back to English.',
    category: 'text-tools',
    iconName: 'Radio',
    accept: '*',
    multiple: false
  },
  {
    id: 'citation-generator',
    name: 'Citation Generator',
    shortDescription: 'Generate basic APA/MLA citations.',
    fullDescription: 'Quickly format sources into standard APA, MLA, or Chicago citation styles for academic writing.',
    category: 'text-tools',
    iconName: 'Quote',
    accept: '*',
    multiple: false
  },

  // SEO & Dev Tools
  {
    id: 'xml-sitemap-generator',
    name: 'XML Sitemap Generator',
    shortDescription: 'Generate basic XML sitemaps for SEO.',
    fullDescription: 'Quickly format a list of URLs into a Google-compliant XML Sitemap file.',
    category: 'seo-tools',
    iconName: 'Sitemap',
    accept: '*',
    multiple: false,
    popular: true
  },
  {
    id: 'robots-txt-generator',
    name: 'Robots.txt Generator',
    shortDescription: 'Create a robots.txt file for your website.',
    fullDescription: 'Easily generate a robots.txt file to control which search engine spiders are allowed to crawl your site.',
    category: 'seo-tools',
    iconName: 'Bot',
    accept: '*',
    multiple: false
  },
  {
    id: 'open-graph-generator',
    name: 'Open Graph Generator',
    shortDescription: 'Generate Open Graph meta tags.',
    fullDescription: 'Create perfect OG tags to ensure your links look beautiful when shared on Facebook, Twitter, and LinkedIn.',
    category: 'seo-tools',
    iconName: 'Share2',
    accept: '*',
    multiple: false
  },
  {
    id: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    shortDescription: 'Generate HTML meta tags for SEO.',
    fullDescription: 'Instantly create title, description, and keyword meta tags to paste into your website header.',
    category: 'seo-tools',
    iconName: 'Code',
    accept: '*',
    multiple: false,
    popular: true
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    shortDescription: 'Format and validate JSON data.',
    fullDescription: 'Beautify ugly, minified JSON code into readable, structured, and validated text.',
    category: 'seo-tools',
    iconName: 'Braces',
    accept: '*',
    multiple: false
  },
  {
    id: 'html-formatter',
    name: 'HTML Formatter',
    shortDescription: 'Format and beautify HTML code.',
    fullDescription: 'Clean up minified or messy HTML into perfectly indented, readable code.',
    category: 'seo-tools',
    iconName: 'FileCode2',
    accept: '*',
    multiple: false
  },
  {
    id: 'keyword-density-checker',
    name: 'Keyword Density Checker',
    shortDescription: 'Analyze text for keyword repetition.',
    fullDescription: 'Extract the most frequently used words from any text to optimize for SEO and avoid keyword stuffing.',
    category: 'seo-tools',
    iconName: 'BarChart2',
    accept: '*',
    multiple: false,
    popular: true
  },
  {
    id: 'seo-score-checker',
    name: 'Website SEO Checker',
    shortDescription: 'Analyze basic HTML for SEO best practices.',
    fullDescription: 'Paste your HTML code to run a local SEO check for missing tags, headings, and structure.',
    category: 'seo-tools',
    iconName: 'Search',
    accept: '*',
    multiple: false
  },

  // Media Tools
  {
    id: 'qr-generator',
    name: '3D QR Code Generator',
    shortDescription: 'Generate beautiful 3D-styled QR codes for WiFi, Links, & Social Media.',
    fullDescription: 'Create highly customizable, stunning QR codes with gradients, custom shapes, and center logos. Supports URLs, Text, WiFi networks, and Social Media templates.',
    category: 'media-tools',
    iconName: 'QrCode',
    accept: '*',
    multiple: false,
    popular: true
  },

  // Calculators
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    shortDescription: 'Calculate exact age in years, months, days.',
    fullDescription: 'Enter your date of birth to instantly see your exact age down to the second.',
    category: 'calculators',
    iconName: 'CalendarDays',
    accept: '*',
    multiple: false
  },
  {
    id: 'bmi-calculator',
    name: 'BMI Calculator',
    shortDescription: 'Calculate your Body Mass Index.',
    fullDescription: 'Enter your height and weight to calculate your BMI and see which category you fall into.',
    category: 'calculators',
    iconName: 'Activity',
    accept: '*',
    multiple: false
  },
  {
    id: 'loan-calculator',
    name: 'Loan Calculator',
    shortDescription: 'Calculate loan payments and interest.',
    fullDescription: 'Calculate your monthly mortgage or loan payments, including total interest over the life of the loan.',
    category: 'calculators',
    iconName: 'Landmark',
    accept: '*',
    multiple: false,
    popular: true
  },
  {
    id: 'discount-calculator',
    name: 'Discount Calculator',
    shortDescription: 'Calculate final price after discount.',
    fullDescription: 'Quickly find out the final price and how much you save after applying a percentage discount.',
    category: 'calculators',
    iconName: 'Percent',
    accept: '*',
    multiple: false
  },
  {
    id: 'margin-calculator',
    name: 'Margin Calculator',
    shortDescription: 'Calculate profit margin & markup.',
    fullDescription: 'Calculate your gross profit margin, markup percentage, and total profit based on cost and revenue.',
    category: 'calculators',
    iconName: 'TrendingUp',
    accept: '*',
    multiple: false
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'All Tools' },
  { id: 'organize', name: 'Organize PDF' },
  { id: 'convert-from', name: 'Convert from PDF' },
  { id: 'convert-to', name: 'Convert to PDF' },
  { id: 'edit-security', name: 'Edit & Security' },
  { id: 'advanced', name: 'Optimize & OCR' },
  { id: 'text-tools', name: 'Text Tools' },
  { id: 'seo-tools', name: 'SEO & Dev Tools' },
  { id: 'media-tools', name: 'Media Tools' },
  { id: 'network-security', name: 'Network & Security' },
  { id: 'calculators', name: 'Smart Calculators' }
];
