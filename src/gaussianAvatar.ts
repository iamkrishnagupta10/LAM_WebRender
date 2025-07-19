
import * as GaussianSplats3D from "gaussian-splat-renderer-for-lam"
import bsData from "../asset/test_expression_1s.json"

export interface GaussianAvatarOptions {
  width?: number;
  height?: number;
  autoStart?: boolean;
  backgroundColor?: string;
  getChatState?: () => string;
  getExpressionData?: () => any;
}

export class GaussianAvatar {
  private _avatarDivEle: HTMLDivElement;
  private _assetsPath = "";
  public curState = "Idle";
  private _renderer: GaussianSplats3D.GaussianSplatRenderer;
  private options: GaussianAvatarOptions;
  private startTime = 0;
  private expressitionData: any;

  constructor(container: HTMLDivElement, assetsPath: string, options: GaussianAvatarOptions = {}) {
    this._avatarDivEle = container;
    this._assetsPath = assetsPath;
    this.options = {
      width: 400,
      height: 400,
      autoStart: false,
      backgroundColor: "0x000000",
      ...options
    };
    this._init();
    
    if (this.options.autoStart) {
      this.start();
    }
  }

  private _init() {
    if (!this._avatarDivEle || !this._assetsPath) {
      throw new Error("Lack of necessary initialization parameters");
    }
    
    // Set container dimensions if specified
    if (this.options.width) {
      this._avatarDivEle.style.width = `${this.options.width}px`;
    }
    if (this.options.height) {
      this._avatarDivEle.style.height = `${this.options.height}px`;
    }
  }

  public start() {
    this.render();
  }

  public async render() {
    try {
      this._renderer = await GaussianSplats3D.GaussianSplatRenderer.getInstance(
        this._avatarDivEle,
        this._assetsPath,
        {
          getChatState: this.options.getChatState || this.getChatState.bind(this),
          getExpressionData: this.options.getExpressionData || this.getArkitFaceFrame.bind(this),
          backgroundColor: this.options.backgroundColor || "0x000000"
        },
      );
      this.startTime = performance.now() / 1000;
      
      // Default state transitions for demo (can be overridden)
      if (!this.options.getChatState) {
        setTimeout(() => {
          this.curState = "Listening"
        }, 5000);
        setTimeout(() => {
          this.curState = "Thinking"
        }, 6000);
        setTimeout(() => {
          this.curState = "Responding"
        }, 10000);
      }
    } catch (error) {
      console.error('Failed to render avatar:', error);
      this._avatarDivEle.innerHTML = '<div class="avatar-error">Failed to load avatar</div>';
    }
  }

  public getChatState() {
    return this.curState;
  }

  public setState(state: string) {
    this.curState = state;
  }

  public getArkitFaceFrame() {
    const length = bsData["frames"].length

    const frameInfoInternal = 1.0 / 30.0;
    const currentTime = performance.now() / 1000;
    const calcDelta = (currentTime - this.startTime)%(length * frameInfoInternal);
    const frameIndex = Math.floor(calcDelta / frameInfoInternal)
    this.expressitionData ={};

    
    bsData["names"].forEach((name: string, index: number) => {
      this.expressitionData[name] = bsData["frames"][frameIndex]["weights"][index]
    })
    return this.expressitionData;
  }

  public destroy() {
    if (this._renderer) {
      // Clean up renderer resources
      try {
        this._renderer.dispose?.();
      } catch (error) {
        console.warn('Error disposing renderer:', error);
      }
    }
  }

  public updateExpressionData(expressionData: any) {
    this.expressitionData = expressionData;
  }

  public setAssetPath(newPath: string) {
    this._assetsPath = newPath;
  }

  public getState() {
    return this.curState;
  }
}
