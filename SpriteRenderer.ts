export interface SpriteActionConfig {
  imageUrl: string;
  totalFrames: number;
  frameWidth: number;
  frameHeight: number;
  fps: number;
  loop?: boolean;
}

export interface SpriteAnimationState {
  currentAction: string;
  currentFrame: number;
  timer: number;
  facing: 'left' | 'right';
}

export class SpriteRenderer {
  private configs: Record<string, SpriteActionConfig>;

  constructor(configs: Record<string, SpriteActionConfig>) {
    this.configs = configs;
  }

  /**
   * Advances the animation state based on delta time.
   */
  getNextState(
    currentState: SpriteAnimationState,
    deltaTime: number
  ): SpriteAnimationState {
    const config = this.configs[currentState.currentAction];
    if (!config) return currentState;

    const nextState = { ...currentState };
    nextState.timer += deltaTime;
    const frameDuration = 1 / Math.max(1, config.fps);

    if (nextState.timer >= frameDuration) {
      const framesToAdvance = Math.floor(nextState.timer / frameDuration);
      nextState.timer %= frameDuration;
      
      if (config.loop === false) {
        nextState.currentFrame = Math.min(
          config.totalFrames - 1,
          nextState.currentFrame + framesToAdvance
        );
      } else {
        nextState.currentFrame = (nextState.currentFrame + framesToAdvance) % config.totalFrames;
      }
    }
    return nextState;
  }

  /**
   * Draws the sprite to the canvas using preloaded images, handling facing direction.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    state: SpriteAnimationState,
    x: number,
    y: number,
    width: number,
    height: number,
    loadedImages: Record<string, HTMLImageElement | null>
  ) {
    const config = this.configs[state.currentAction];
    if (!config) return;

    const img = loadedImages[config.imageUrl];

    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback: Draw nothing or a subtle dark ninja silhouette if image hasn't finished decoding
      ctx.save();
      ctx.fillStyle = 'rgba(20, 15, 25, 0.4)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, width, height, 8) : ctx.fillRect(x, y, width, height);
      ctx.fill();
      ctx.restore();
      return;
    }

    const framesPerRow = Math.max(1, Math.floor(img.naturalWidth / config.frameWidth));
    const safeFrame = Math.max(0, Math.min(config.totalFrames - 1, state.currentFrame));
    const sourceX = (safeFrame % framesPerRow) * config.frameWidth;
    const sourceY = Math.floor(safeFrame / framesPerRow) * config.frameHeight;

    ctx.save();
    if (state.facing === 'left') {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        config.frameWidth,
        config.frameHeight,
        0,
        0,
        width,
        height
      );
    } else {
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        config.frameWidth,
        config.frameHeight,
        x,
        y,
        width,
        height
      );
    }
    ctx.restore();
  }
}
