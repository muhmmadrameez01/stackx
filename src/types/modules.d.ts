declare module 'mammoth' {
  interface MammothOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: any;
    path?: string;
  }
  interface MammothResult {
    value: string;
    messages: any[];
  }
  export function extractRawText(options: MammothOptions): Promise<MammothResult>;
  export function convertToHtml(options: MammothOptions): Promise<MammothResult>;
}

