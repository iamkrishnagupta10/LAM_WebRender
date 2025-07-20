declare module 'gaussian-splat-renderer-for-lam' {
  export interface GaussianSplatRendererOptions {
    getChatState?: () => string;
    getExpressionData?: () => any;
    backgroundColor?: string;
    [key: string]: any;
  }

  export class GaussianSplatRenderer {
    static getInstance(
      container: HTMLDivElement,
      assetsPath: string,
      options?: GaussianSplatRendererOptions
    ): Promise<GaussianSplatRenderer>;
    
    [key: string]: any;
  }

  export * from 'gaussian-splat-renderer-for-lam';
}