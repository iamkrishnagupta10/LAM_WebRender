
import * as GaussianSplats3D from "gaussian-splat-renderer-for-lam"

export class GaussianAvatar {
  private _avatarDivEle: HTMLDivElement;
  private _assetsPath = "";
  public curState = "Idle";
  private _renderer!: GaussianSplats3D.GaussianSplatRenderer;
  private bsData: any = null;
  
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

  private async loadExpressionData() {
    try {
      console.log('Loading expression data...');
      const response = await fetch('/asset/test_expression_1s.json');
      if (!response.ok) {
        throw new Error(`Failed to load expression data: ${response.status}`);
      }
      this.bsData = await response.json();
      console.log('Expression data loaded successfully:', this.bsData ? 'Yes' : 'No');
    } catch (error) {
      console.error('Error loading expression data:', error);
      throw error;
    }
  }

  public start() {
    console.log('Starting avatar render...');
    this.render();
  }

  public setState(newState: string) {
    console.log(`Avatar state changed from ${this.curState} to ${newState}`);
    this.curState = newState;
    
    // Add visual feedback for state changes
    this.triggerStateExpression(newState);
  }

  private triggerStateExpression(state: string) {
    // Trigger different expressions based on state
    switch(state) {
      case "Listening":
        console.log('Triggering listening expression - attentive look');
        break;
      case "Thinking":
        console.log('Triggering thinking expression - contemplative look');
        break;
      case "Responding":
        console.log('Triggering speaking expression - animated mouth');
        break;
      case "Idle":
        console.log('Triggering idle expression - relaxed look');
        break;
    }
  }

  public async render() {
    try {
      console.log('Starting Gaussian Splat renderer...');
      console.log('Container element:', this._avatarDivEle);
      console.log('Asset path:', this._assetsPath);
      
      // Load expression data first
      await this.loadExpressionData();
      
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
      
      // Remove the automatic state changes - now controlled by voice interaction
      console.log('Avatar ready for voice interaction!');

    } catch (error) {
      console.error('Error in render method:', error);
      throw error;
    }
  }
  
  expressitionData: any;
  startTime = 0
  
  public getChatState() {
    // Log state changes for debugging
    if (Math.random() < 0.01) { // Log occasionally to avoid spam
      console.log('getChatState called, returning:', this.curState);
    }
    return this.curState;
  }
  
  public getArkitFaceFrame() {
    if (!this.bsData) {
      console.warn('Expression data not loaded yet');
      return {};
    }

    const length = this.bsData["frames"].length
    const frameInfoInternal = 1.0 / 30.0;
    const currentTime = performance.now() / 1000;
    const calcDelta = (currentTime - this.startTime)%(length * frameInfoInternal);
    const frameIndex = Math.floor(calcDelta / frameInfoInternal)
    this.expressitionData ={};

    this.bsData["names"].forEach((name: string, index: number) => {
      this.expressitionData[name] = this.bsData["frames"][frameIndex]["weights"][index]
    })
    
    // Log occasionally to see if this is being called
    if (frameIndex % 30 === 0 && Math.random() < 0.1) {
      console.log('getArkitFaceFrame called, frame:', frameIndex, 'expressions:', Object.keys(this.expressitionData).length);
    }
    
    return this.expressitionData;
  }
}
