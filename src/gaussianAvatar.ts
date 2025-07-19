
// Simplified avatar implementation for better build compatibility
export interface GaussianAvatarOptions {
  width?: number;
  height?: number;
  autoStart?: boolean;
  backgroundColor?: string;
  getChatState?: () => string;
  getExpressionData?: () => any;
}

export class GaussianAvatar {
  private container: HTMLDivElement;
  private assetPath: string;
  public curState = "Idle";
  private options: GaussianAvatarOptions;
  private startTime = 0;
  private expressionData: any = {};

  constructor(container: HTMLDivElement, assetPath: string, options: GaussianAvatarOptions = {}) {
    this.container = container;
    this.assetPath = assetPath;
    this.options = {
      width: 400,
      height: 400,
      autoStart: false,
      backgroundColor: "#000000",
      ...options
    };
    
    this.init();
    
    if (this.options.autoStart) {
      this.start();
    }
  }

  private init() {
    if (!this.container) {
      throw new Error("Container element is required");
    }
    
    // Set container dimensions
    if (this.options.width) {
      this.container.style.width = `${this.options.width}px`;
    }
    if (this.options.height) {
      this.container.style.height = `${this.options.height}px`;
    }
    
    // Add basic styling
    this.container.style.position = 'relative';
    this.container.style.background = this.options.backgroundColor || '#000';
    this.container.style.borderRadius = '8px';
    this.container.style.overflow = 'hidden';
  }

  public start() {
    this.render();
  }

  public render() {
    try {
      this.startTime = performance.now() / 1000;
      
      // Create a placeholder avatar display
      this.container.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; flex-direction: column;">
          <div style="width: 60px; height: 60px; border: 3px solid #00ff88; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite; margin-bottom: 10px;"></div>
          <div style="text-align: center; font-size: 12px; opacity: 0.8;">
            <div>AI Avatar</div>
            <div style="margin-top: 4px; font-size: 10px;">${this.curState}</div>
          </div>
        </div>
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      `;

      // Try to load the actual Gaussian Splat renderer if available
      this.loadGaussianRenderer().catch(() => {
        // Fallback to placeholder if loading fails
        console.log('Using fallback avatar display');
      });

    } catch (error) {
      console.error('Failed to render avatar:', error);
      this.showError();
    }
  }

  private async loadGaussianRenderer() {
    try {
      // Dynamic import to avoid build issues
      const GaussianModule = await import("gaussian-splat-renderer-for-lam");
      
      if (GaussianModule && GaussianModule.GaussianSplatRenderer) {
        const renderer = await GaussianModule.GaussianSplatRenderer.getInstance(
          this.container,
          this.assetPath,
          {
            getChatState: this.options.getChatState || this.getChatState.bind(this),
            getExpressionData: this.options.getExpressionData || this.getExpressionData.bind(this),
            backgroundColor: this.options.backgroundColor || "#000000"
          }
        );
        
        console.log('Gaussian renderer loaded successfully');
      }
    } catch (error) {
      console.warn('Gaussian renderer not available, using fallback');
      throw error;
    }
  }

  private showError() {
    this.container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #ff6b6b; text-align: center; font-size: 12px;">
        <div>
          <div>⚠️</div>
          <div style="margin-top: 8px;">Avatar Error</div>
        </div>
      </div>
    `;
  }

  public getChatState() {
    return this.curState;
  }

  public setState(state: string) {
    this.curState = state;
    
    // Update the status display
    const statusElement = this.container.querySelector('[data-status]');
    if (statusElement) {
      statusElement.textContent = state;
    }
    
    // Update visual state
    this.updateVisualState(state);
  }

  private updateVisualState(state: string) {
    const colors = {
      'Idle': '#666',
      'Listening': '#00ff88',
      'Thinking': '#ffa500',
      'Responding': '#ff4757'
    };
    
    const color = colors[state as keyof typeof colors] || '#666';
    const borderElement = this.container.querySelector('[style*="border"]') as HTMLElement;
    
    if (borderElement) {
      borderElement.style.borderColor = color;
    }
  }

  public getExpressionData() {
    // Simple expression data fallback
    const time = (performance.now() / 1000 - this.startTime) * 2;
    
    return {
      eyeBlinkLeft: Math.sin(time * 0.1) * 0.1 + 0.1,
      eyeBlinkRight: Math.sin(time * 0.1) * 0.1 + 0.1,
      jawOpen: Math.sin(time * 0.05) * 0.05 + 0.05,
      mouthSmileLeft: Math.sin(time * 0.02) * 0.3 + 0.3,
      mouthSmileRight: Math.sin(time * 0.02) * 0.3 + 0.3
    };
  }

  public destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  public updateExpressionData(expressionData: any) {
    this.expressionData = expressionData;
  }

  public setAssetPath(newPath: string) {
    this.assetPath = newPath;
  }

  public getState() {
    return this.curState;
  }
}
