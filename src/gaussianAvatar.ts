
import * as GaussianSplats3D from "gaussian-splat-renderer-for-lam"
import bsData from "../asset/test_expression_1s.json"

export class GaussianAvatar {
  private _avatarDivEle: HTMLDivElement;
  private _assetsPath = "";
  public curState = "Idle";
  private _renderer!: GaussianSplats3D.GaussianSplatRenderer;
  constructor(container: HTMLDivElement, assetsPath: string) {
    this._avatarDivEle = container;
    this._assetsPath = assetsPath;
    this._init();
  }
  private _init() {
    if (!this._avatarDivEle || !this._assetsPath) {
      throw new Error("Lack of necessary initialization parameters");
    }
  }

  public start() {
    this.render();
  }

  public async render() {
    this._renderer = await GaussianSplats3D.GaussianSplatRenderer.getInstance(
      this._avatarDivEle,
      this._assetsPath,
      {
        getChatState: this.getChatState.bind(this),
        getExpressionData: this.getArkitFaceFrame.bind(this),
        backgroundColor: "0x000000"
      },
    );
    this.startTime = performance.now() / 1000;
    
    // Make the avatar more alive with natural state transitions
    this.startIdleAnimations();
  }

  private startIdleAnimations() {
    // Natural breathing and blinking animations
    setInterval(() => {
      if (this.curState === "Idle") {
        // Add subtle breathing animation
        this.addBreathingExpression();
      }
    }, 3000);

    // Random blinking
    setInterval(() => {
      this.addBlinkExpression();
    }, 2000 + Math.random() * 3000);

    // Occasional head movements when idle
    setInterval(() => {
      if (this.curState === "Idle") {
        this.addSubtleHeadMovement();
      }
    }, 5000 + Math.random() * 5000);
  }

  private addBreathingExpression() {
    // Subtle breathing motion (simulated)
    console.log('Adding breathing animation for liveliness');
  }

  private addBlinkExpression() {
    // Natural blinking animation
    console.log('Avatar blinks naturally');
  }

  private addSubtleHeadMovement() {
    // Slight head movement for aliveness
    console.log('Subtle head movement to show avatar is alive');
  }

  public setState(newState: string) {
    this.curState = newState;
    console.log(`Avatar state changed to: ${newState}`);
    
    // Add state-specific animations
    switch(newState) {
      case "Listening":
        this.addListeningExpression();
        break;
      case "Thinking":
        this.addThinkingExpression();
        break;
      case "Responding":
        this.addRespondingExpression();
        break;
      case "Idle":
        this.addIdleExpression();
        break;
    }
  }

  private addListeningExpression() {
    // Attentive expression - slightly raised eyebrows, focused eyes
    console.log('Avatar shows listening expression');
  }

  private addThinkingExpression() {
    // Thoughtful expression - slight frown, looking up or to the side
    console.log('Avatar shows thinking expression');
  }

  private addRespondingExpression() {
    // Speaking expression - open mouth, animated face
    console.log('Avatar shows speaking expression');
  }

  private addIdleExpression() {
    // Relaxed, neutral expression
    console.log('Avatar returns to idle expression');
  }
  expressitionData: any;
  startTime = 0
  public getChatState() {
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
    return this.expressitionData;
  }
}
