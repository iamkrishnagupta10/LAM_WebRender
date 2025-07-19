// Try to import the gaussian splat renderer, but handle gracefully if not available
let GaussianSplatRenderer: any = null;

try {
  GaussianSplatRenderer = require('gaussian-splat-renderer-for-lam');
} catch (e) {
  try {
    // Try dynamic import as fallback
    import('gaussian-splat-renderer-for-lam').then(module => {
      GaussianSplatRenderer = module;
    }).catch(() => {
      console.warn('⚠️ gaussian-splat-renderer-for-lam not available, using fallback renderer');
    });
  } catch (e2) {
    console.warn('⚠️ gaussian-splat-renderer-for-lam not available, using fallback renderer');
  }
}

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
  private renderer: any = null;
  private scene: any = null;
  private viewer: any = null;

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

  public async start() {
    try {
      await this.initializeGaussianRenderer();
    } catch (error) {
      console.error('Failed to initialize Gaussian renderer:', error);
      this.showSimpleRenderer();
    }
  }

  private async initializeGaussianRenderer() {
    try {
      console.log('🚀 Initializing LAM Gaussian Splat Renderer...');
      
      // Create loading indicator
      this.showLoading();
      
      // Check if Gaussian renderer is available
      if (!GaussianSplatRenderer) {
        throw new Error('Gaussian Splat Renderer not available');
      }
      
      // Try to find the right viewer class
      const ViewerClass = GaussianSplatRenderer.DropboxViewer || 
                         GaussianSplatRenderer.Viewer || 
                         GaussianSplatRenderer.GaussianSplatViewer || 
                         GaussianSplatRenderer.default || 
                         GaussianSplatRenderer;
      
      if (typeof ViewerClass === 'function') {
        this.viewer = new ViewerClass({
          container: this.container,
          width: this.options.width || 120,
          height: this.options.height || 120,
          backgroundColor: this.options.backgroundColor || "#000000",
        });
        
        // Load default avatar asset or use provided path
        const avatarAsset = this.assetPath || './asset/test_expression_1s.json';
        
        if (this.viewer.loadGaussianSplat) {
          await this.viewer.loadGaussianSplat(avatarAsset);
        } else if (this.viewer.loadAsset) {
          await this.viewer.loadAsset(avatarAsset);
        }
        
        console.log('✅ LAM Gaussian Splat Renderer initialized successfully');
        this.hideLoading();
        
        // Start render loop
        this.startRenderLoop();
        
      } else {
        throw new Error('No suitable viewer class found in Gaussian Splat Renderer');
      }
      
    } catch (error) {
      console.error('Failed to initialize Gaussian renderer:', error);
      this.showSimpleRenderer();
    }
  }

  private showSimpleRenderer() {
    console.log('🎭 Using simple 3D avatar renderer...');
    
    this.container.innerHTML = `
      <div class="avatar-container" style="width: 100%; height: 100%; position: relative; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; overflow: hidden;">
        <canvas id="avatar-canvas-${Math.random().toString(36).substr(2, 9)}" width="${this.options.width}" height="${this.options.height}" style="width: 100%; height: 100%; display: block;"></canvas>
        <div class="avatar-info" style="position: absolute; bottom: 10px; left: 10px; color: white; font-size: 12px; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 15px;">
          <div>AI Avatar #${Math.floor(Math.random() * 100) + 1}</div>
          <div style="font-size: 10px; margin-top: 2px; opacity: 0.8;">${this.curState}</div>
        </div>
      </div>
    `;
    
    // Initialize simple 3D rendering
    this.initSimple3D();
  }

  private initSimple3D() {
    const canvas = this.container.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Simple animated avatar representation
    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw animated avatar silhouette
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const time = frame * 0.05;
      
      // Head
      ctx.beginPath();
      ctx.arc(centerX, centerY - 40 + Math.sin(time) * 2, 30, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(time * 2) * 0.1})`;
      ctx.fill();
      
      // Body
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 20, 25, 40, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, 0.6)`;
      ctx.fill();
      
      // Arms
      ctx.beginPath();
      ctx.arc(centerX - 35, centerY + Math.sin(time * 1.5) * 5, 8, 0, Math.PI * 2);
      ctx.arc(centerX + 35, centerY + Math.sin(time * 1.5 + Math.PI) * 5, 8, 0, Math.PI * 2);
      ctx.fill();
      
      frame++;
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  private startRenderLoop() {
    if (!this.viewer) return;
    
    const render = () => {
      if (this.viewer && this.viewer.render) {
        this.viewer.render();
      }
      requestAnimationFrame(render);
    };
    
    render();
  }

  private showLoading() {
    this.container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; flex-direction: column; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px;"></div>
        <div style="text-align: center; font-size: 12px;">
          <div>Loading LAM Avatar...</div>
          <div style="margin-top: 5px; font-size: 10px; opacity: 0.8;">Initializing Renderer</div>
        </div>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  private hideLoading() {
    // Loading will be replaced by the renderer
    console.log('Loading complete');
  }

  public getChatState() {
    return this.curState;
  }

  public setState(state: string) {
    this.curState = state;
    
    // Update the status display
    const statusElement = this.container.querySelector('.avatar-info');
    if (statusElement) {
      const stateDiv = statusElement.querySelector('div:last-child') as HTMLElement;
      if (stateDiv) {
        stateDiv.textContent = state;
      }
    }
    
    // Update visual state
    this.updateVisualState(state);
  }

  private updateVisualState(state: string) {
    const colors = {
      'Idle': '#667eea',
      'Listening': '#00ff88',
      'Thinking': '#ffa500',
      'Responding': '#ff6b6b'
    };
    
    const color = colors[state as keyof typeof colors] || '#667eea';
    
    // Update container background if using fallback
    if (this.container.style.background.includes('linear-gradient')) {
      this.container.style.background = `linear-gradient(135deg, ${color} 0%, #764ba2 100%)`;
    }
  }

  public getExpressionData() {
    return this.expressionData;
  }

  public setExpressionData(data: any) {
    this.expressionData = data;
    
    // Update the avatar expression if renderer supports it
    if (this.viewer && this.viewer.setExpression) {
      this.viewer.setExpression(data);
    }
  }

  public destroy() {
    if (this.viewer && this.viewer.destroy) {
      this.viewer.destroy();
    }
    this.container.innerHTML = '';
  }
}
