declare module 'dom-to-image-more' {
  export interface Options {
    quality?: number;
    width?: number;
    height?: number;
    style?: Record<string, string>;
    bgcolor?: string;
    filter?: (node: any) => boolean;
  }

  const domtoimage: {
    toPng: (node: HTMLElement, options?: Options) => Promise<string>;
    toJpeg: (node: HTMLElement, options?: Options) => Promise<string>;
    toBlob: (node: HTMLElement, options?: Options) => Promise<Blob>;
    toPixelData: (node: HTMLElement, options?: Options) => Promise<Uint8ClampedArray>;
    toSvg: (node: HTMLElement, options?: Options) => Promise<string>;
  };
  
  export default domtoimage;
}

