
import * as THREE from 'three';

export class GaussianAvatar {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private avatar: THREE.Object3D | null = null;
  private currentExpressions: number[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    
    this.setupScene();
  }

  private setupScene() {
    // Basic scene setup
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);
    
    // Position camera
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Start render loop
    this.animate();
  }

  async initialize() {
    try {
      console.log('Initializing avatar...');
      
      // Create a simple avatar placeholder (sphere with face-like features)
      await this.createSimpleAvatar();
      
      console.log('Avatar initialized successfully');
    } catch (error) {
      console.error('Avatar initialization error:', error);
      throw error;
    }
  }

  private async createSimpleAvatar() {
    // Create a simple 3D head representation
    const group = new THREE.Group();
    
    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(1, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    group.add(head);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.2, 0.8);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.2, 0.8);
    group.add(rightEye);
    
    // Mouth
    const mouthGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.3, 0.8);
    mouth.scale.set(1, 0.5, 0.5);
    group.add(mouth);
    
    this.avatar = group;
    this.scene.add(group);
  }

  applyLAMExpressions(expressions: number[][]) {
    if (!this.avatar || !expressions || expressions.length === 0) {
      return;
    }

    console.log(`Applying ${expressions.length} expression frames`);
    
    // Store expressions for animation
    this.currentExpressions = expressions[0] || [];
    
    // Animate the expressions over time
    this.animateExpressions(expressions);
  }

  private animateExpressions(expressions: number[][]) {
    const duration = expressions.length / 30.0; // 30 FPS
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = elapsed / duration;
      
      if (progress >= 1.0) {
        // Animation complete
        this.resetExpressions();
        return;
      }
      
      // Get current frame
      const frameIndex = Math.floor(progress * expressions.length);
      const frame = expressions[frameIndex] || [];
      
      this.applyExpressionFrame(frame);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  private applyExpressionFrame(expression: number[]) {
    if (!this.avatar || !expression) return;
    
    // Extract key expression values (simplified ARKit mapping)
    const jawOpen = expression[20] || 0; // Jaw open
    const mouthOpen = expression[21] || 0; // Mouth open
    const eyeBlinkLeft = expression[10] || 0; // Eye blink left
    const eyeBlinkRight = expression[11] || 0; // Eye blink right
    
    // Apply to avatar parts
    const mouth = this.avatar.children.find((child: THREE.Object3D) => 
      child.position.y < 0 && child.position.z > 0
    );
    
    if (mouth) {
      // Animate mouth based on expressions
      const openAmount = Math.max(jawOpen, mouthOpen);
      mouth.scale.y = 0.5 + openAmount * 0.5;
      mouth.scale.z = 0.5 + openAmount * 0.3;
    }
    
    // Animate eyes (blinks)
    const eyes = this.avatar.children.filter((child: THREE.Object3D) => 
      child.position.y > 0 && child.position.z > 0
    );
    
    eyes.forEach((eye: THREE.Object3D, index: number) => {
      const blinkAmount = index === 0 ? eyeBlinkLeft : eyeBlinkRight;
      eye.scale.y = 1.0 - blinkAmount * 0.8;
    });
  }

  private resetExpressions() {
    if (!this.avatar) return;
    
    // Reset all expressions to neutral
    const mouth = this.avatar.children.find((child: THREE.Object3D) => 
      child.position.y < 0 && child.position.z > 0
    );
    
    if (mouth) {
      mouth.scale.set(1, 0.5, 0.5);
    }
    
    const eyes = this.avatar.children.filter((child: THREE.Object3D) => 
      child.position.y > 0 && child.position.z > 0
    );
    
    eyes.forEach((eye: THREE.Object3D) => {
      eye.scale.set(1, 1, 1);
    });
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    
    // Subtle head movement
    if (this.avatar) {
      const time = Date.now() * 0.001;
      this.avatar.rotation.y = Math.sin(time * 0.5) * 0.1;
      this.avatar.rotation.x = Math.sin(time * 0.3) * 0.05;
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  setState(state: string) {
    console.log(`Avatar state: ${state}`);
    // Simple state management could be added here
  }
}
