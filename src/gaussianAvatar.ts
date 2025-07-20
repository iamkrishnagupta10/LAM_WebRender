
import * as GaussianSplats3D from "gaussian-splat-renderer-for-lam"
import bsData from "../asset/test_expression_1s.json"

export class GaussianAvatar {
  private _avatarDivEle: HTMLDivElement;
  private _assetsPath = "";
  public curState = "Idle";
  private _renderer!: GaussianSplats3D.GaussianSplatRenderer;
  
  constructor(container: HTMLDivElement, assetsPath: string) {
    console.log('GaussianAvatar constructor called with:', container, assetsPath);
    this._avatarDivEle = container;
    this._assetsPath = assetsPath;
    this._init();
  }
  
  private _init() {
    console.log('Initializing avatar with div:', this._avatarDivEle, 'path:', this._assetsPath);
    if (!this._avatarDivEle || !this._assetsPath) {
      throw new Error("Lack of necessary initialization parameters");
    }
    console.log('Avatar initialization completed');
  }

  public start() {
    console.log('Starting avatar render...');
    this.render();
  }

  public async render() {
    try {
      console.log('Starting Gaussian Splat renderer...');
      console.log('Container element:', this._avatarDivEle);
      console.log('Asset path:', this._assetsPath);
      console.log('Expression data loaded:', bsData ? 'Yes' : 'No');
      
      this._renderer = await GaussianSplats3D.GaussianSplatRenderer.getInstance(
        this._avatarDivEle,
        this._assetsPath,
        {
          getChatState: this.getChatState.bind(this),
          getExpressionData: this.getArkitFaceFrame.bind(this),
          backgroundColor: "0x000000"
        },
      );
      
      console.log('Renderer created successfully:', this._renderer);
      
      this.startTime = performance.now() / 1000;
      console.log('Animation cycle started at time:', this.startTime);
      
      setTimeout(() => {
        console.log('Changing state to Listening');
        this.curState = "Listening"
      }, 5000);
      setTimeout(() => {
        console.log('Changing state to Thinking');
        this.curState = "Thinking"
      }, 6000);
      setTimeout(() => {
        console.log('Changing state to Responding');
        this.curState = "Responding"
      }, 10000);

    } catch (error) {
      console.error('Error in render method:', error);
      throw error;
    }
  }
  
  expressitionData: any;
  startTime = 0
  
  public getChatState() {
    console.log('getChatState called, returning:', this.curState);
    return this.curState;
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
    
    // Log occasionally to see if this is being called
    if (frameIndex % 30 === 0) {
      console.log('getArkitFaceFrame called, frame:', frameIndex, 'expressions:', Object.keys(this.expressitionData).length);
    }
    
    return this.expressitionData;
  }
}
