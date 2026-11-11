declare module "pdfkit" {
  interface PDFDocumentOptions {
    size?: string | number[];
    margin?: number;
    margins?: { top: number; bottom: number; left: number; right: number };
    info?: Record<string, string>;
    [key: string]: unknown;
  }

  interface TextOptions {
    width?: number;
    height?: number;
    align?: "left" | "center" | "right" | "justify";
    lineBreak?: boolean;
    [key: string]: unknown;
  }

  class PDFDocument {
    constructor(options?: PDFDocumentOptions);
    fontSize(size: number): this;
    font(name: string): this;
    fillColor(color: string): this;
    text(text: string, x?: number, y?: number, options?: TextOptions): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    strokeColor(color: string): this;
    lineWidth(width: number): this;
    stroke(): this;
    rect(x: number, y: number, w: number, h: number): this;
    fill(color?: string): this;
    fillAndStroke(fillColor?: string, strokeColor?: string): this;
    roundedRect(x: number, y: number, w: number, h: number, r: number): this;
    end(): void;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export default PDFDocument;
}

