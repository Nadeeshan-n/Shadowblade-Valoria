// tslint:disable
/* eslint-disable */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  RotateCw,
  Volume2,
  VolumeX,
  Shield,
  Zap,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  Trophy,
  ArrowLeft,
  Heart,
  Activity,
  Crosshair,
  Compass,
  Award,
  Clock,
  EyeOff,
  Flame,
  Moon,
  Sun,
} from 'lucide-react';
import { getConfig } from './constants';
import BackgroundMusic from './utils/BackgroundMusic';
import {
  createFixedStepper,
  drawAsset,
  drawBackground,
  formatTime,
  GameState,
  MenuOverlay,
  Overlay,
  prepareCanvas,
  useAssets,
  useAutoFocus,
  useInput,
  useIsMobile,
  gameAudio,
  clamp,
} from './utils/helper';
import {
  usePlayground,
  usePlaygroundGameLifecycle,
  useRpc,
} from './utils/usePlayground';
import {
  SpriteRenderer,
  SpriteActionConfig,
  SpriteAnimationState,
} from './SpriteRenderer';

// Asset manifest for preloading
const ASSETS_MANIFEST: Record<string, string> = {
  bg_sunset: 'assets/images/bg_valoria_sunset.png',
  bg_castle: 'assets/images/bg_interior_castle.png',
  rooftop_sandstone: 'assets/images/rooftop_sandstone_tiles.png',
  wooden_beam: 'assets/images/wooden_beam_platform.png',
  stealth_crates: 'assets/images/stealth_cover_crates.png',
  ivy_ladder: 'assets/images/climbable_ivy_wall.png',
  portcullis_gate: 'assets/images/exit_portcullis_gate.png',
  gold_relic: 'assets/images/ancient_gold_relic.png',
  health_potion: 'assets/images/health_potion_vial.png',
  icon_alert: 'assets/images/icon_stealth_alert.png',
  icon_heart: 'assets/images/icon_heart_health.png',

  // Player Kael Spritesheets
  kael_idle: 'assets/images/kael_assassin_idle.png',
  kael_walk: 'assets/images/kael_assassin_walk.png',
  kael_run: 'assets/images/kael_assassin_run.png',
  kael_jump: 'assets/images/kael_assassin_jump.png',
  kael_climb: 'assets/images/kael_assassin_climb_wall.png',
  kael_slide: 'assets/images/kael_assassin_ground_slide.png',
  kael_crawl: 'assets/images/kael_assassin_human_crawl.png',
  kael_sword: 'assets/images/kael_assassin_sword_attack.png',
  kael_hurt: 'assets/images/kael_assassin_hurt.png',
  kael_death: 'assets/images/kael_assassin_death.png',

  // Guard Spritesheets
  guard_idle: 'assets/images/patrol_guard_idle.png',
  guard_walk: 'assets/images/patrol_guard_walk.png',
  guard_run: 'assets/images/patrol_guard_run.png',
  guard_sword: 'assets/images/patrol_guard_sword_attack.png',
  guard_hurt: 'assets/images/patrol_guard_hurt.png',
  guard_death: 'assets/images/patrol_guard_death.png',

  // Guard Captain Boss Spritesheets
  captain_idle: 'assets/images/guard_captain_idle.png',
  captain_walk: 'assets/images/guard_captain_walk.png',
  captain_sword: 'assets/images/guard_captain_sword_attack.png',
  captain_hurt: 'assets/images/guard_captain_hurt.png',
  captain_death: 'assets/images/guard_captain_death.png',
};

// Spritesheet Action Configurations
const KAEL_ACTIONS: Record<string, SpriteActionConfig> = {
  IDLE: { imageUrl: 'kael_idle', frameWidth: 512, frameHeight: 512, totalFrames: 4, fps: 6, loop: true },
  WALK: { imageUrl: 'kael_walk', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 12, loop: true },
  RUN: { imageUrl: 'kael_run', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 16, loop: true },
  JUMP: { imageUrl: 'kael_jump', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 14, loop: false },
  CLIMB: { imageUrl: 'kael_climb', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 12, loop: true },
  SLIDE: { imageUrl: 'kael_slide', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 18, loop: false },
  CRAWL: { imageUrl: 'kael_crawl', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 8, loop: true },
  ATTACK: { imageUrl: 'kael_sword', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 22, loop: false },
  HURT: { imageUrl: 'kael_hurt', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 12, loop: false },
  DEATH: { imageUrl: 'kael_death', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 8, loop: false },
};

const GUARD_ACTIONS: Record<string, SpriteActionConfig> = {
  IDLE: { imageUrl: 'guard_idle', frameWidth: 512, frameHeight: 512, totalFrames: 4, fps: 6, loop: true },
  WALK: { imageUrl: 'guard_walk', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 10, loop: true },
  RUN: { imageUrl: 'guard_run', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 15, loop: true },
  ATTACK: { imageUrl: 'guard_sword', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 16, loop: false },
  HURT: { imageUrl: 'guard_hurt', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 10, loop: false },
  DEATH: { imageUrl: 'guard_death', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 8, loop: false },
};

const CAPTAIN_ACTIONS: Record<string, SpriteActionConfig> = {
  IDLE: { imageUrl: 'captain_idle', frameWidth: 512, frameHeight: 512, totalFrames: 4, fps: 6, loop: true },
  WALK: { imageUrl: 'captain_walk', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 9, loop: true },
  ATTACK: { imageUrl: 'captain_sword', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 14, loop: false },
  HURT: { imageUrl: 'captain_hurt', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 10, loop: false },
  DEATH: { imageUrl: 'captain_death', frameWidth: 512, frameHeight: 512, totalFrames: 16, fps: 7, loop: false },
};

// Interface structures
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'sandstone' | 'wood' | 'castle_floor' | 'fortress_battlement' | 'spire_roof';
  dropThrough?: boolean;
}

interface Ladder {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface StealthCover {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ShadowNiche {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GrappleAnchor {
  id: string;
  x: number;
  y: number;
  radius: number;
  active: boolean;
}

interface HangingLantern {
  id: string;
  x: number;
  y: number;
  radius: number;
  isLit: boolean;
}

interface CheckpointShrine {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  activated: boolean;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
  life: number;
  type: 'arrow' | 'moonwave' | 'shockwave';
  facing: 'left' | 'right';
}

interface Collectible {
  id: string;
  type: 'relic' | 'potion';
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity?: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  size: number;
}

interface SlashEffect {
  x: number;
  y: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  color: string;
  life: number;
  maxLife: number;
  facing: 'left' | 'right';
  comboStage: number;
}

type GuardType = 'STANDARD' | 'SHIELD_SENTINEL' | 'CROSSBOW' | 'CAPTAIN' | 'LORD_VANE';
type GuardState = 'PATROL' | 'SUSPICIOUS' | 'CHASE' | 'ATTACK' | 'STAGGERED' | 'DEAD' | 'CASTING' | 'LEAPING';

interface GuardEntity {
  id: string;
  guardType: GuardType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  patrolMinX: number;
  patrolMaxX: number;
  facing: 'left' | 'right';
  state: GuardState;
  awareness: number; // 0 to 100
  investigateX: number;
  suspiciousTimer: number;
  lostSightTimer: number;
  hp: number;
  maxHp: number;
  guardPosture: number; // For breakable guard gauge
  maxPosture: number;
  isBoss?: boolean;
  bossPhase?: number;
  attackCooldown: number;
  attackWindupTimer: number;
  isAttacking: boolean;
  attackTimer: number;
  attackType?: 'SLASH' | 'SHIELD_BASH' | 'MOONWAVE' | 'LEAP_SMASH' | 'CROSSBOW_BOLT';
  hasStruck: boolean;
  staggerTimer: number;
  isDead: boolean;
  deathTimer: number;
  animState: SpriteAnimationState;
  isHurt: boolean;
  hurtTimer: number;
  hitFlashTimer: number;
}

// Line-of-sight raycast against solid terrain
function checkLineOfSight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  platforms: Platform[]
): boolean {
  const steps = 12;
  for (const plat of platforms) {
    if (plat.dropThrough) continue;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    if (maxX < plat.x || minX > plat.x + plat.width || maxY < plat.y || minY > plat.y + plat.height) {
      continue;
    }

    for (let i = 1; i <= steps; i++) {
      const px = x1 + (x2 - x1) * (i / steps);
      const py = y1 + (y2 - y1) * (i / steps);
      if (px >= plat.x && px <= plat.x + plat.width && py >= plat.y && py <= plat.y + plat.height) {
        return false; // Obstructed by solid wall
      }
    }
  }
  return true; // Clear line of sight
}

// Raycast to find closest horizontal wall obstruction for vision cone
function getSolidWallObstructionX(
  startX: number,
  startY: number,
  dir: 1 | -1,
  maxDistance: number,
  platforms: Platform[]
): number {
  let closestX = startX + dir * maxDistance;
  for (const plat of platforms) {
    if (plat.dropThrough) continue;
    if (startY >= plat.y && startY <= plat.y + plat.height) {
      if (dir === 1) {
        if (plat.x >= startX && plat.x < closestX) {
          closestX = plat.x;
        }
      } else {
        const rightEdge = plat.x + plat.width;
        if (rightEdge <= startX && rightEdge > closestX) {
          closestX = rightEdge;
        }
      }
    }
  }
  return closestX;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepperRef = useRef<ReturnType<typeof createFixedStepper>>();
  const isMobile = useIsMobile();

  // SDK & Lifecycle
  const { sdk } = usePlayground();
  const [exitChat] = useRpc<Record<string, unknown>, void>('ExitChat');

  const { assets, isReady: assetsReady } = useAssets(ASSETS_MANIFEST);

  const canvasWidth = getConfig('baseCanvasWidth') as number;
  const canvasHeight = getConfig('baseCanvasHeight') as number;

  if (!stepperRef.current) {
    const stepMs = getConfig('stepMs');
    const maxSubSteps = getConfig('maxSubSteps');
    stepperRef.current = createFixedStepper(stepMs, maxSubSteps);
  }

  // Reactive UI State
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    score: 0,
    level: 1,
  });

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [playerHp, setPlayerHp] = useState<number>(getConfig('playerMaxHealth') as number);
  const [relicCount, setRelicCount] = useState<number>(0);
  const [totalRelics, setTotalRelics] = useState<number>(3);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  // Boss UI State
  const [bossInfo, setBossInfo] = useState<{
    name: string;
    hpPercent: number;
    guardPercent: number;
    phase: number;
  } | null>(null);

  const [objectiveText, setObjectiveText] = useState('Infiltrate the Valoria Rooftops');
  const [canStealthKill, setCanStealthKill] = useState(false);
  const [canGrapple, setCanGrapple] = useState(false);
  const [comboDisplay, setComboDisplay] = useState<number>(0);

  // Stats for end-game summary
  const [stats, setStats] = useState({
    timeSeconds: 0,
    stealthKills: 0,
    alarmsTriggered: 0,
    relicsFound: 0,
  });

  // High Frequency Simulation State in Refs
  const playerRef = useRef({
    x: 100,
    y: 450,
    width: 60,
    height: 90,
    vx: 0,
    vy: 0,
    facing: 'right' as 'left' | 'right',
    isGrounded: false,
    isClimbing: false,
    isCrouching: false,
    isSliding: false,
    slideTimer: 0,
    isLedgeGrabbing: false,
    isMantling: false,
    mantleTimer: 0,
    ledgeSide: 'left' as 'left' | 'right',
    ledgePlat: null as Platform | null,
    ledgeCooldown: 0,
    isWallSliding: false,
    wallDir: null as 'left' | 'right' | null,

    // Grapple / Rope Swing state
    isSwinging: false,
    swingAnchor: null as GrappleAnchor | null,
    swingAngle: 0,
    swingAngleVel: 0,
    swingLength: 140,

    // Environmental state
    inShadowNiche: false,

    // Combat states
    isAttacking: false,
    attackTimer: 0,
    attackDuration: 0.24,
    attackCombo: 1,
    comboResetTimer: 0,
    attackBufferTimer: 0,
    hasHitTarget: false,

    isBlocking: false,
    blockDuration: 0,
    parryWindowTimer: 0, // perfect parry if block pressed within 0.22s

    isHurt: false,
    hurtTimer: 0,
    hitFlashTimer: 0,
    isDead: false,
    invincibleTimer: 0,
    jumpCount: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,

    lastJumpPressed: false,
    lastAttackPressed: false,
    lastBlockPressed: false,
    lastStealthPressed: false,
    lastGrapplePressed: false,
    animState: { currentAction: 'IDLE', currentFrame: 0, timer: 0, facing: 'right' } as SpriteAnimationState,
  });

  const cameraRef = useRef({ x: 0, y: 0, targetX: 0 });
  const checkpointRef = useRef({ x: 100, y: 450 });
  const levelBoundsRef = useRef({ width: 5200, height: 900 });

  const platformsRef = useRef<Platform[]>([]);
  const laddersRef = useRef<Ladder[]>([]);
  const coversRef = useRef<StealthCover[]>([]);
  const shadowNichesRef = useRef<ShadowNiche[]>([]);
  const grappleAnchorsRef = useRef<GrappleAnchor[]>([]);
  const hangingLanternsRef = useRef<HangingLantern[]>([]);
  const checkpointShrinesRef = useRef<CheckpointShrine[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const guardsRef = useRef<GuardEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const slashEffectsRef = useRef<SlashEffect[]>([]);
  const hitStopRef = useRef<number>(0);
  const screenShakeRef = useRef<number>(0);
  const bgmTrackRef = useRef<'sunset' | 'boss'>('sunset');

  // Sprite Renderers
  const kaelRendererRef = useRef<SpriteRenderer>(new SpriteRenderer(KAEL_ACTIONS));
  const guardRendererRef = useRef<SpriteRenderer>(new SpriteRenderer(GUARD_ACTIONS));
  const captainRendererRef = useRef<SpriteRenderer>(new SpriteRenderer(CAPTAIN_ACTIONS));

  // Virtual Mobile Controls State
  const mobileInputRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    block: false,
    stealth: false,
    grapple: false,
  });

  // Dedicated keyboard tracking for combat keys
  const keysRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      keysRef.current[e.code.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.code.toLowerCase()] = false;
    };
    const handleBlur = () => {
      keysRef.current = {};
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Standard Keyboard / Pointer input
  const inputRef = useInput(canvasRef, true, {
    width: canvasWidth,
    height: canvasHeight,
  });

  // Helpers for combat feedback
  const spawnFloatingText = (x: number, y: number, text: string, color = '#fde047', size = 16) => {
    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
      life: 0.8,
      maxLife: 0.8,
      vy: -1.8,
      size,
    });
  };

  const spawnSlashEffect = (x: number, y: number, facing: 'left' | 'right', comboStage: number) => {
    const colors = ['#f59e0b', '#38bdf8', '#c084fc'];
    slashEffectsRef.current.push({
      x,
      y,
      radius: comboStage === 3 ? 65 : 50,
      startAngle: facing === 'right' ? -Math.PI * 0.4 : Math.PI * 0.6,
      endAngle: facing === 'right' ? Math.PI * 0.4 : Math.PI * 1.4,
      color: colors[comboStage - 1] || '#f59e0b',
      life: 0.2,
      maxLife: 0.2,
      facing,
      comboStage,
    });
  };

  // Particle Spawner Helper
  const spawnParticles = (x: number, y: number, color: string, count = 8, speed = 3, gravity = 0) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = (Math.random() * 0.7 + 0.3) * speed;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel - (gravity > 0 ? 0 : 1),
        life: 0.35 + Math.random() * 0.35,
        maxLife: 0.35 + Math.random() * 0.35,
        color,
        size: 3 + Math.random() * 3,
        gravity,
      });
    }
  };

  // ==========================================
  // LEVEL 1: VALORIA ROOFTOPS SETUP
  // ==========================================
  const setupLevel1 = useCallback(() => {
    const maxHp = getConfig('playerMaxHealth') as number;
    setPlayerHp(maxHp);
    setRelicCount(0);
    setBossInfo(null);
    setComboDisplay(0);
    setObjectiveText('Infiltrate the Valoria Rooftops & eliminate Captain Malakor');
    bgmTrackRef.current = 'sunset';
    levelBoundsRef.current = { width: 5200, height: 900 };

    shadowNichesRef.current = [];
    grappleAnchorsRef.current = [];
    hangingLanternsRef.current = [];
    checkpointShrinesRef.current = [];
    projectilesRef.current = [];

    // Platforms with audited gaps
    const plats: Platform[] = [
      // Section 1: Starting Rooftops (0 - 1220)
      { x: 50, y: 550, width: 350, height: 160, type: 'sandstone' },
      { x: 290, y: 390, width: 150, height: 24, type: 'wood', dropThrough: true },
      { x: 480, y: 500, width: 330, height: 210, type: 'sandstone' },
      { x: 680, y: 350, width: 170, height: 24, type: 'wood', dropThrough: true },
      { x: 890, y: 450, width: 330, height: 260, type: 'sandstone' },

      // Section 2: Alley Bridges & High Towers (1260 - 2400)
      { x: 1300, y: 560, width: 290, height: 150, type: 'sandstone' },
      { x: 1460, y: 390, width: 190, height: 24, type: 'wood', dropThrough: true },
      { x: 1680, y: 500, width: 290, height: 210, type: 'sandstone' },
      { x: 1720, y: 330, width: 210, height: 24, type: 'wood', dropThrough: true },
      { x: 2040, y: 460, width: 330, height: 250, type: 'sandstone' },

      // Section 3: Castle District Courtyard (2440 - 3600)
      { x: 2440, y: 560, width: 520, height: 160, type: 'castle_floor' },
      { x: 2620, y: 400, width: 180, height: 24, type: 'wood', dropThrough: true },
      { x: 2870, y: 340, width: 190, height: 24, type: 'wood', dropThrough: true },
      { x: 3030, y: 560, width: 520, height: 160, type: 'castle_floor' },
      { x: 3220, y: 410, width: 190, height: 24, type: 'wood', dropThrough: true },

      // Section 4: Castle Keep & Boss Chamber (3620 - 4700)
      { x: 3620, y: 560, width: 1060, height: 160, type: 'castle_floor' },
      { x: 3760, y: 400, width: 180, height: 24, type: 'wood', dropThrough: true },
      { x: 4380, y: 400, width: 180, height: 24, type: 'wood', dropThrough: true },

      // Section 5: Eastern Gate Exit (4720 - 5200)
      { x: 4720, y: 560, width: 450, height: 160, type: 'castle_floor' },
    ];
    platformsRef.current = plats;

    // Ladders (Climbable Ivy Walls)
    laddersRef.current = [
      { x: 1220, y: 280, width: 50, height: 280 },
      { x: 1980, y: 230, width: 50, height: 280 },
      { x: 2380, y: 320, width: 50, height: 250 },
      { x: 3560, y: 330, width: 50, height: 240 },
    ];

    // Stealth Cover Crates
    coversRef.current = [
      { x: 600, y: 435, width: 65, height: 65 },
      { x: 1480, y: 495, width: 65, height: 65 },
      { x: 2700, y: 495, width: 65, height: 65 },
      { x: 3250, y: 495, width: 65, height: 65 },
    ];

    // Collectibles (Relics & Potions)
    collectiblesRef.current = [
      { id: 'relic_1', type: 'relic', x: 740, y: 290, width: 45, height: 50, collected: false },
      { id: 'relic_2', type: 'relic', x: 1880, y: 270, width: 45, height: 50, collected: false },
      { id: 'relic_3', type: 'relic', x: 2930, y: 280, width: 45, height: 50, collected: false },
      { id: 'potion_1', type: 'potion', x: 1530, y: 335, width: 38, height: 48, collected: false },
      { id: 'potion_2', type: 'potion', x: 3310, y: 355, width: 38, height: 48, collected: false },
      { id: 'potion_3', type: 'potion', x: 3820, y: 345, width: 38, height: 48, collected: false },
    ];
    setTotalRelics(3);

    // Enemies (Patrol Guards & Captain Boss)
    const bossHealth = getConfig('bossHealth') as number;
    guardsRef.current = [
      {
        id: 'guard_1',
        guardType: 'STANDARD',
        x: 620,
        y: 410,
        width: 60,
        height: 90,
        vx: 1.2,
        vy: 0,
        patrolMinX: 520,
        patrolMaxX: 740,
        facing: 'right',
        state: 'PATROL',
        awareness: 0,
        investigateX: 620,
        suspiciousTimer: 0,
        lostSightTimer: 0,
        hp: 3,
        maxHp: 3,
        guardPosture: 2,
        maxPosture: 2,
        attackCooldown: 0,
        attackWindupTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        hasStruck: false,
        staggerTimer: 0,
        isDead: false,
        deathTimer: 0,
        animState: { currentAction: 'WALK', currentFrame: 0, timer: 0, facing: 'right' },
        isHurt: false,
        hurtTimer: 0,
        hitFlashTimer: 0,
      },
      {
        id: 'guard_2',
        guardType: 'STANDARD',
        x: 1720,
        y: 410,
        width: 60,
        height: 90,
        vx: -1.2,
        vy: 0,
        patrolMinX: 1690,
        patrolMaxX: 1920,
        facing: 'left',
        state: 'PATROL',
        awareness: 0,
        investigateX: 1720,
        suspiciousTimer: 0,
        lostSightTimer: 0,
        hp: 3,
        maxHp: 3,
        guardPosture: 2,
        maxPosture: 2,
        attackCooldown: 0,
        attackWindupTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        hasStruck: false,
        staggerTimer: 0,
        isDead: false,
        deathTimer: 0,
        animState: { currentAction: 'WALK', currentFrame: 0, timer: 0, facing: 'left' },
        isHurt: false,
        hurtTimer: 0,
        hitFlashTimer: 0,
      },
      {
        id: 'guard_3',
        guardType: 'STANDARD',
        x: 2550,
        y: 470,
        width: 60,
        height: 90,
        vx: 1.4,
        vy: 0,
        patrolMinX: 2480,
        patrolMaxX: 2880,
        facing: 'right',
        state: 'PATROL',
        awareness: 0,
        investigateX: 2550,
        suspiciousTimer: 0,
        lostSightTimer: 0,
        hp: 3,
        maxHp: 3,
        guardPosture: 2,
        maxPosture: 2,
        attackCooldown: 0,
        attackWindupTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        hasStruck: false,
        staggerTimer: 0,
        isDead: false,
        deathTimer: 0,
        animState: { currentAction: 'WALK', currentFrame: 0, timer: 0, facing: 'right' },
        isHurt: false,
        hurtTimer: 0,
        hitFlashTimer: 0,
      },
      {
        id: 'guard_4',
        guardType: 'STANDARD',
        x: 3120,
        y: 470,
        width: 60,
        height: 90,
        vx: -1.4,
        vy: 0,
        patrolMinX: 3060,
        patrolMaxX: 3480,
        facing: 'left',
        state: 'PATROL',
        awareness: 0,
        investigateX: 3120,
        suspiciousTimer: 0,
        lostSightTimer: 0,
        hp: 3,
        maxHp: 3,
        guardPosture: 2,
        maxPosture: 2,
        attackCooldown: 0,
        attackWindupTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        hasStruck: false,
        staggerTimer: 0,
        isDead: false,
        deathTimer: 0,
        animState: { currentAction: 'WALK', currentFrame: 0, timer: 0, facing: 'left' },
        isHurt: false,
        hurtTimer: 0,
        hitFlashTimer: 0,
      },
      // Guard Captain Malakor (BOSS 1)
      {
        id: 'boss_malakor',
        guardType: 'CAPTAIN',
        x: 4150,
        y: 460,
        width: 75,
        height: 100,
        vx: 1.6,
        vy: 0,
        patrolMinX: 3780,
        patrolMaxX: 4500,
        facing: 'left',
        state: 'PATROL',
        awareness: 0,
        investigateX: 4150,
        suspiciousTimer: 0,
        lostSightTimer: 0,
        hp: bossHealth,
        maxHp: bossHealth,
        guardPosture: 4,
        maxPosture: 4,
        isBoss: true,
        bossPhase: 1,
        attackCooldown: 0,
        attackWindupTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        hasStruck: false,
        staggerTimer: 0,
        isDead: false,
        deathTimer: 0,
        animState: { currentAction: 'WALK', currentFrame: 0, timer: 0, facing: 'left' },
        isHurt: false,
        hurtTimer: 0,
        hitFlashTimer: 0,
      },
    ];

    // Reset Player
    const p = playerRef.current;
    p.x = 100;
    p.y = 450;
    p.vx = 0;
    p.vy = 0;
    p.facing = 'right';
    p.isGrounded = false;
    p.isDead = false;
    p.isHurt = false;
    p.hitFlashTimer = 0;
    p.isBlocking = false;
    p.blockDuration = 0;
    p.parryWindowTimer = 0;
    p.isAttacking = false;
    p.attackCombo = 1;
    p.comboResetTimer = 0;
    p.attackBufferTimer = 0;
    p.hasHitTarget = false;
    p.isClimbing = false;
    p.isCrouching = false;
    p.isSliding = false;
    p.isLedgeGrabbing = false;
    p.isMantling = false;
    p.isSwinging = false;
    p.swingAnchor = null;
    p.inShadowNiche = false;
    p.ledgeCooldown = 0;
    p.isWallSliding = false;
    p.wallDir = null;
    p.invincibleTimer = 0;
    p.jumpCount = 0;
    p.coyoteTimer = 0;
    p.jumpBufferTimer = 0;
    p.animState = { currentAction: 'IDLE', currentFrame: 0, timer: 0, facing: 'right' };

    checkpointRef.current = { x: 100, y: 450 };
    cameraRef.current = { x: 0, y: 0, targetX: 0 };
    particlesRef.current = [];
    floatingTextsRef.current = [];
    slashEffectsRef.current = [];
  }, []);

  // ==========================================
  // LEVEL 2: THE MOONLIT FORTRESS SETUP
  // ==========================================
  const setupLevel2 = useCallback(() => {
    const maxHp = getConfig('playerMaxHealth') as number;
    setPlayerHp(maxHp);
    setRelicCount(0);
    setBossInfo(null);
    setComboDisplay(0);
    setObjectiveText('Infiltrate the Moonlit Fortress & vanquish Lord Vane, Commander of the Eclipse');
    bgmTrackRef.current = 'sunset';
    levelBoundsRef.current = { width: 6200, height: 950 };

    // Dual-route Vertical Fortress Layout:
    // Upper Rafters & Spire Towers (Y: 200 - 380) vs Lower Battlements & Outer Bastions (Y: 520 - 580)
    const plats: Platform[] = [
      // Section 1: Western Outer Bastion & Chasm
      { x: 40, y: 560, width: 380, height: 180, type: 'fortress_battlement' },
      { x: 260, y: 380, width: 160, height: 24, type: 'spire_roof', dropThrough: true },
      { x: 500, y: 560, width: 340, height: 180, type: 'fortress_battlement' },
      { x: 620, y: 340, width: 180, height: 24, type: 'spire_roof', dropThrough: true },
      { x: 920, y: 480, width: 320, height: 260, type: 'fortress_battlement' },
      { x: 980, y: 300, width: 220, height: 24, type: 'wood', dropThrough: true },

      // Section 2: High Gargoyle Spires & Rope Chasm (1320 - 2500)
      { x: 1340, y: 560, width: 320, height: 180, type: 'fortress_battlement' },
      { x: 1420, y: 360, width: 200, height: 24, type: 'wood', dropThrough: true },
      { x: 1540, y: 220, width: 160, height: 24, type: 'spire_roof', dropThrough: true },
      { x: 1820, y: 560, width: 360, height: 180, type: 'fortress_battlement' },
      { x: 1960, y: 380, width: 200, height: 24, type: 'spire_roof', dropThrough: true },
      { x: 2280, y: 490, width: 300, height: 250, type: 'fortress_battlement' },
      { x: 2360, y: 320, width: 200, height: 24, type: 'wood', dropThrough: true },

      // Section 3: The Grand Armoury & Vaulted Crypts (2680 - 4100)
      { x: 2680, y: 560, width: 560, height: 180, type: 'castle_floor' },
      { x: 2840, y: 390, width: 220, height: 24, type: 'wood', dropThrough: true },
      { x: 3100, y: 280, width: 200, height: 24, type: 'spire_roof', dropThrough: true },
      { x: 3340, y: 560, width: 580, height: 180, type: 'castle_floor' },
      { x: 3520, y: 390, width: 220, height: 24, type: 'wood', dropThrough: true },
      { x: 3820, y: 280, width: 190, height: 24, type: 'spire_roof', dropThrough: true },

      // Section 4: Eclipse Balcony & Boss Arena (4200 - 5600)
      { x: 4200, y: 560, width: 1380, height: 180, type: 'castle_floor' },
      { x: 4400, y: 400, width: 220, height: 24, type: 'wood', dropThrough: true },
      { x: 5080, y: 400, width: 220, height: 24, type: 'wood', dropThrough: true },

      // Section 5: Moonlit Citadel Apex Portal (5700 - 6200)
      { x: 5700, y: 560, width: 450, height: 180, type: 'fortress_battlement' },
    ];
    platformsRef.current = plats;

    // Ladders (Fortress Ivy & Chains)
    laddersRef.current = [
      { x: 1260, y: 260, width: 50, height: 300 },
      { x: 2200, y: 220, width: 50, height: 340 },
      { x: 2600, y: 290, width: 50, height: 270 },
      { x: 4120, y: 290, width: 50, height: 270 },
    ];

    // Stealth Covers (Crates & Stone Parapets)
    coversRef.current = [
      { x: 620, y: 495, width: 65, height: 65 },
      { x: 1460, y: 495, width: 65, height: 65 },
      { x: 2880, y: 495, width: 65, height: 65 },
      { x: 3580, y: 495, width: 65, height: 65 },
    ];

    // Shadow Niches (Dark Gothic Alcoves where standing makes player invisible)
    shadowNichesRef.current = [
      { x: 740, y: 470, width: 70, height: 90 },
      { x: 1980, y: 470, width: 80, height: 90 },
      { x: 3000, y: 470, width: 80, height: 90 },
      { x: 3740, y: 470, width: 80, height: 90 },
    ];

    // Grapple / Rope Swing Anchors (For acrobatic swinging over massive chasms)
    grappleAnchorsRef.current = [
      { id: 'anchor_1', x: 440, y: 260, radius: 24, active: true },
      { id: 'anchor_2', x: 1280, y: 220, radius: 24, active: true },
      { id: 'anchor_3', x: 1740, y: 230, radius: 24, active: true },
      { id: 'anchor_4', x: 2580, y: 210, radius: 24, active: true },
      { id: 'anchor_5', x: 4140, y: 240, radius: 24, active: true },
    ];

    // Hanging Iron Lanterns (Attack to extinguish and shroud zone in darkness)
    hangingLanternsRef.current = [
      { id: 'lantern_1', x: 680, y: 390, radius: 200, isLit: true },
      { id: 'lantern_2', x: 1600, y: 380, radius: 210, isLit: true },
      { id: 'lantern_3', x: 2980, y: 410, radius: 220, isLit: true },
      { id: 'lantern_4', x: 3660, y: 410, radius: 220, isLit: true },
    ];

    // Checkpoint Shrines (Ignite with holy blue flame upon passing)
    checkpointShrinesRef.current = [
      { id: 'shrine_1', x: 1380, y: 490, width: 50, height: 70, activated: false },
      { id: 'shrine_2', x: 2740, y: 490, width: 50, height: 70, activated: false },
      { id: 'shrine_3', x: 4260, y: 490, width: 50, height: 70, activated: false },
    ];

    // Collectibles (Eclipse Relics & Elixirs)
    collectiblesRef.current = [
      { id: 'l2_relic_1', type: 'relic', x: 1590, y: 160, width: 45, height: 50, collected: false },
      { id: 'l2_relic_2', type: 'relic', x: 3180, y: 220, width: 45, height: 50, collected: false },
      { id: 'l2_relic_3', type: 'relic', x: 3900, y: 220, width: 45, height: 50, collected: false },
      { id: 'l2_potion_1', type: 'potion', x: 1040, y: 245, width: 38, height: 48, collected: false },
      { id: 'l2_potion_2', type: 'potion', x: 2420, y: 265, width: 38, height: 48, collected: false },
      { id: 'l2_potion_3', type: 'potion', x: 4460, y: 345, width: 38, height: 48, collected: false },
    ];
    setTotalRelics(3);

    // Level 2 Enemies: Shielded Sentinels, Royal Crossbow Sentries, & Lord Vane (BOSS)
    const lordVaneHp = (getConfig('lordVaneHealth' as any) as number) || 14;
    guardsRef.current = [
      // 1. Royal Crossbowman on High Spire
      {
        id: 'sentry_crossbow_1',
        guardType: 'CROSSBOW',
        x: 690,
        y: 250,
        width: 60,
        height: 90,
        vx: 0,
        vy: 0,
        patrolMinX: 630,
        patrolMaxX: 790,
        facing: 'left',
        state: 'PATROL',
        awareness: 0,
        investigateX: 690,
        suspiciousTimer: 0,
        lostSightTimer: 0,
        hp: 2,
        maxHp: 2,
        guardPosture: 1,
        maxPosture: 1,
        attackCooldown: 0,
        attackWindupTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        attackType: 'CROSSBOW_BOLT',
        hasStruck: false,
        staggerTimer: 0,
        isDead: false,
        deathTimer: 0,
        animState: { currentAction: 'IDLE', currentFrame: 0, timer: 0, facing: 'left' },
        isHurt: false,
        hurtTimer: 0,
        hitFlashTimer: 0,
      },
      // 2. Heavy Shielded Sentinel on Western Rampart
      {
        id: 'sentinel_shield_1',
        guardType: 'SHIELD_SENTINEL',
        x: 1480,
        y: 470,
        width: 65,
        height: 90,
        vx: 1.1,
        vy: 0,
        patrolMinX: 1370,
        patrolMaxX: 1620,
        facing: 'right',
        state: 'PATROL',
        awareness: 0,
        investigateX: 1480,
        suspiciousTimer: 0,
        lostSightTimer: 0,
        hp: 4,
        maxHp: 4,
        guardPosture: 4,
        maxPosture: 4,
        attackCooldown: 0,
        attackWindupTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        attackType: 'SHIELD_BASH',
        hasStruck: false,
        staggerTimer: 0,
        isDead: false,
        deathTimer: 0,
        animState: { currentAction: 'WALK', currentFrame: 0, timer: 0, facing: 'right' },
        isHurt: false,
        hurtTimer: 0,
        hitFlashTimer: 0,
      },
      // 3. Royal Crossbowman on High Spire 2
      {
        id: 'sentry_crossbow_2',
        guardType: 'CROSSBOW',
        x: 2020,
        y: 290,
        width: 60,
        height: 90,
        vx: 0,
        vy: 0,
        patrolMinX: 1970,
        patrolMaxX: 2120,
        facing: 'left',
        state: 'PATROL',
        awareness: 0,
        investigateX: 2020,
        suspiciousTimer: 0,
        lostSightTimer: 0,
        hp: 2,
        maxHp: 2,
        guardPosture: 1,
        maxPosture: 1,
        attackCooldown: 0,
        attackWindupTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        attackType: 'CROSSBOW_BOLT',
        hasStruck: false,
        staggerTimer: 0,
        isDead: false,
        deathTimer: 0,
        animState: { currentAction: 'IDLE', currentFrame: 0, timer: 0, facing: 'left' },
        isHurt: false,
        hurtTimer: 0,
        hitFlashTimer: 0,
      },
      // 4. Heavy Shielded Sentinel in Grand Armoury
      {
        id: 'sentinel_shield_2',
        guardType: 'SHIELD_SENTINEL',
        x: 2950,
        y: 470,
        width: 65,
        height: 90,
        vx: 1.2,
        vy: 0,
        patrolMinX: 2750,
        patrolMaxX: 3200,
        facing: 'right',
        state: 'PATROL',
        awareness: 0,
        investigateX: 2950,
        suspiciousTimer: 0,
        lostSightTimer: 0,
        hp: 4,
        maxHp: 4,
        guardPosture: 4,
        maxPosture: 4,
        attackCooldown: 0,
        attackWindupTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        attackType: 'SHIELD_BASH',
        hasStruck: false,
        staggerTimer: 0,
        isDead: false,
        deathTimer: 0,
        animState: { currentAction: 'WALK', currentFrame: 0, timer: 0, facing: 'right' },
        isHurt: false,
        hurtTimer: 0,
        hitFlashTimer: 0,
      },
      // 5. Standard Patrol Guard in Armoury
      {
        id: 'guard_l2_1',
        guardType: 'STANDARD',
        x: 3500,
        y: 470,
        width: 60,
        height: 90,
        vx: -1.3,
        vy: 0,
        patrolMinX: 3380,
        patrolMaxX: 3880,
        facing: 'left',
        state: 'PATROL',
        awareness: 0,
        investigateX: 3500,
        suspiciousTimer: 0,
        lostSightTimer: 0,
        hp: 3,
        maxHp: 3,
        guardPosture: 2,
        maxPosture: 2,
        attackCooldown: 0,
        attackWindupTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        hasStruck: false,
        staggerTimer: 0,
        isDead: false,
        deathTimer: 0,
        animState: { currentAction: 'WALK', currentFrame: 0, timer: 0, facing: 'left' },
        isHurt: false,
        hurtTimer: 0,
        hitFlashTimer: 0,
      },
      // 6. FINAL BOSS: Lord Vane, Commander of the Eclipse
      {
        id: 'boss_lord_vane',
        guardType: 'LORD_VANE',
        x: 4850,
        y: 460,
        width: 85,
        height: 105,
        vx: 1.8,
        vy: 0,
        patrolMinX: 4320,
        patrolMaxX: 5400,
        facing: 'left',
        state: 'PATROL',
        awareness: 0,
        investigateX: 4850,
        suspiciousTimer: 0,
        lostSightTimer: 0,
        hp: lordVaneHp,
        maxHp: lordVaneHp,
        guardPosture: 6,
        maxPosture: 6,
        isBoss: true,
        bossPhase: 1,
        attackCooldown: 0,
        attackWindupTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        attackType: 'SLASH',
        hasStruck: false,
        staggerTimer: 0,
        isDead: false,
        deathTimer: 0,
        animState: { currentAction: 'WALK', currentFrame: 0, timer: 0, facing: 'left' },
        isHurt: false,
        hurtTimer: 0,
        hitFlashTimer: 0,
      },
    ];

    // Reset Player State for Level 2
    const p = playerRef.current;
    p.x = 80;
    p.y = 460;
    p.vx = 0;
    p.vy = 0;
    p.facing = 'right';
    p.isGrounded = false;
    p.isDead = false;
    p.isHurt = false;
    p.hitFlashTimer = 0;
    p.isBlocking = false;
    p.blockDuration = 0;
    p.parryWindowTimer = 0;
    p.isAttacking = false;
    p.attackCombo = 1;
    p.comboResetTimer = 0;
    p.attackBufferTimer = 0;
    p.hasHitTarget = false;
    p.isClimbing = false;
    p.isCrouching = false;
    p.isSliding = false;
    p.isLedgeGrabbing = false;
    p.isMantling = false;
    p.isSwinging = false;
    p.swingAnchor = null;
    p.inShadowNiche = false;
    p.ledgeCooldown = 0;
    p.isWallSliding = false;
    p.wallDir = null;
    p.invincibleTimer = 0;
    p.jumpCount = 0;
    p.coyoteTimer = 0;
    p.jumpBufferTimer = 0;
    p.animState = { currentAction: 'IDLE', currentFrame: 0, timer: 0, facing: 'right' };

    checkpointRef.current = { x: 80, y: 460 };
    cameraRef.current = { x: 0, y: 0, targetX: 0 };
    particlesRef.current = [];
    floatingTextsRef.current = [];
    slashEffectsRef.current = [];
    projectilesRef.current = [];
  }, []);

  // Main Level Switcher & Initializer
  const loadLevel = useCallback((lvl: number) => {
    setCurrentLevel(lvl);
    if (lvl === 1) {
      setupLevel1();
    } else {
      setupLevel2();
    }
  }, [setupLevel1, setupLevel2]);

  const initGame = useCallback((levelToStart = 1) => {
    loadLevel(levelToStart);
    setGameState((prev) => ({
      ...prev,
      status: 'PLAYING',
      score: levelToStart === 1 ? 0 : prev.score,
      level: levelToStart,
    }));
    setStats({
      timeSeconds: 0,
      stealthKills: 0,
      alarmsTriggered: 0,
      relicsFound: 0,
    });
    setIsGameMenuOpen(false);
    setIsLevelSelectOpen(false);
    setIsHowToPlayOpen(false);
    gameAudio.playConfirmSelect();

    if (sdk) {
      sdk.startGame();
    }
  }, [loadLevel, sdk]);

  // Autoplay handler
  const hasAutoplayed = useRef(false);
  useEffect(() => {
    if (
      !hasAutoplayed.current &&
      new URLSearchParams(window.location.search).has('autoplay')
    ) {
      hasAutoplayed.current = true;
      initGame(1);
    }
  }, [initGame]);

  // Lifecycle reporting
  usePlaygroundGameLifecycle(gameState, sdk);

  // Sound triggers for victory and defeat
  useEffect(() => {
    if (gameState.status === 'GAME_OVER') {
      gameAudio.playDefeatMotif();
    } else if (gameState.status === 'VICTORY') {
      gameAudio.playVictoryFanfare();
    }
  }, [gameState.status]);

  // --- Main Update Loop ---
  const update = (deltaTime: number) => {
    if (gameState.status !== 'PLAYING' || isGameMenuOpen || isHowToPlayOpen || isLevelSelectOpen) return;

    // Track mission time
    setStats((prev) => ({ ...prev, timeSeconds: prev.timeSeconds + deltaTime }));

    // Hit-stop effect (frame freeze for combat impact juice)
    if (hitStopRef.current > 0) {
      hitStopRef.current -= deltaTime;
      return;
    }

    const dt = Math.min(deltaTime, 0.05);
    const p = playerRef.current;
    const input = inputRef.current;
    const mInput = mobileInputRef.current;

    // Merge keyboard, mouse & mobile touch inputs
    const isLeft = input.actions.left || keysRef.current['a'] || keysRef.current['arrowleft'] || mInput.left;
    const isRight = input.actions.right || keysRef.current['d'] || keysRef.current['arrowright'] || mInput.right;
    const isUp = input.actions.up || keysRef.current['w'] || keysRef.current['arrowup'] || mInput.up;
    const isDown = input.actions.down || keysRef.current['s'] || keysRef.current['arrowdown'] || mInput.down;
    const isJump = input.actions.up || input.actions.confirm || keysRef.current[' '] || keysRef.current['w'] || keysRef.current['arrowup'] || mInput.jump;
    const isAttack = keysRef.current['j'] || keysRef.current['keyj'] || keysRef.current['z'] || mInput.attack;
    const isBlock = keysRef.current['k'] || keysRef.current['keyk'] || keysRef.current['x'] || mInput.block;
    const isStealth = keysRef.current['e'] || keysRef.current['keye'] || keysRef.current['c'] || mInput.stealth;
    const isGrapple = keysRef.current['f'] || keysRef.current['keyf'] || keysRef.current['q'] || mInput.grapple;

    const jumpEdge = isJump && !p.lastJumpPressed;
    if (jumpEdge) {
      p.jumpBufferTimer = 0.16;
    } else if (p.jumpBufferTimer > 0) {
      p.jumpBufferTimer -= dt;
    }

    // Update Player Timers
    if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
    if (p.ledgeCooldown > 0) p.ledgeCooldown -= dt;
    if (p.hitFlashTimer > 0) p.hitFlashTimer -= dt;
    if (p.hurtTimer > 0) {
      p.hurtTimer -= dt;
      if (p.hurtTimer <= 0) p.isHurt = false;
    }

    // Update Combo Reset Timer
    if (p.comboResetTimer > 0) {
      p.comboResetTimer -= dt;
      if (p.comboResetTimer <= 0) {
        p.attackCombo = 1;
        setComboDisplay(0);
      }
    }

    // Check Death
    if (p.isDead) {
      p.animState = kaelRendererRef.current.getNextState(p.animState, dt);
      return;
    }

    // Check falling into void
    if (p.y > levelBoundsRef.current.height - 100) {
      gameAudio.playGeneralDamage();
      setPlayerHp((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          p.isDead = true;
          p.animState = { currentAction: 'DEATH', currentFrame: 0, timer: 0, facing: p.facing };
          setTimeout(() => {
            setGameState((g) => ({ ...g, status: 'GAME_OVER' }));
          }, 1200);
        } else {
          // Respawn at last activated checkpoint
          p.x = checkpointRef.current.x;
          p.y = checkpointRef.current.y;
          p.vx = 0;
          p.vy = 0;
          p.isLedgeGrabbing = false;
          p.isMantling = false;
          p.isSwinging = false;
          p.swingAnchor = null;
          p.invincibleTimer = 1.5;
        }
        return Math.max(0, next);
      });
      return;
    }

    // Check Shadow Niches (Level 2 Dark Alcoves)
    p.inShadowNiche = false;
    for (const niche of shadowNichesRef.current) {
      if (
        p.x + p.width * 0.7 > niche.x &&
        p.x + p.width * 0.3 < niche.x + niche.width &&
        p.y + p.height > niche.y &&
        p.y < niche.y + niche.height
      ) {
        p.inShadowNiche = true;
        break;
      }
    }

    // Check Checkpoint Shrines (Level 2)
    for (const shrine of checkpointShrinesRef.current) {
      if (!shrine.activated && Math.abs(p.x - shrine.x) < 60 && Math.abs(p.y - shrine.y) < 80) {
        shrine.activated = true;
        checkpointRef.current = { x: shrine.x, y: shrine.y };
        setPlayerHp((hp) => Math.min(getConfig('playerMaxHealth') as number, hp + 1));
        gameAudio.playPowerupChime();
        spawnParticles(shrine.x + shrine.width / 2, shrine.y + 20, '#38bdf8', 25, 5);
        spawnFloatingText(shrine.x + shrine.width / 2, shrine.y - 30, 'MOONLIGHT SHRINE IGNITED! +1 HP', '#38bdf8', 18);
      }
    }

    // Check Rope / Grapple Anchors proximity
    let nearbyAnchor: GrappleAnchor | null = null;
    const grappleReach = 180;
    for (const anchor of grappleAnchorsRef.current) {
      const dist = Math.hypot(p.x + p.width / 2 - anchor.x, p.y + 10 - anchor.y);
      if (dist < grappleReach && p.y > anchor.y - 20) {
        nearbyAnchor = anchor;
        break;
      }
    }
    setCanGrapple(!!nearbyAnchor && !p.isSwinging);

    // --- ROPE SWINGING / GRAPPLE ACROBATICS MECHANIC ---
    const grappleEdge = (isGrapple && !p.lastGrapplePressed) || (jumpEdge && !p.isGrounded && !!nearbyAnchor && !p.isSwinging && p.vy > -2);

    if (grappleEdge && nearbyAnchor && !p.isSwinging) {
      // Attach Grapple Rope!
      p.isSwinging = true;
      p.swingAnchor = nearbyAnchor;
      const dx = (p.x + p.width / 2) - nearbyAnchor.x;
      const dy = (p.y + 10) - nearbyAnchor.y;
      p.swingLength = Math.hypot(dx, dy);
      p.swingAngle = Math.atan2(dx, dy); // 0 is straight down
      p.swingAngleVel = (p.vx / Math.max(1, p.swingLength)) * 1.5;
      p.isGrounded = false;
      p.isLedgeGrabbing = false;
      p.isClimbing = false;
      gameAudio.playRetroJump();
      spawnParticles(nearbyAnchor.x, nearbyAnchor.y, '#38bdf8', 10, 3);
    }
    p.lastGrapplePressed = !!isGrapple;

    if (p.isSwinging && p.swingAnchor) {
      // Pendulum Physics Simulation
      const gravityPendulum = 0.45;
      const swingAccel = (-gravityPendulum / p.swingLength) * Math.sin(p.swingAngle);

      // Player can pump swing with left/right keys
      let swingInput = 0;
      if (isLeft) swingInput = -0.012;
      if (isRight) swingInput = 0.012;

      p.swingAngleVel += swingAccel + swingInput;
      p.swingAngleVel *= 0.988; // Damping
      p.swingAngle += p.swingAngleVel;

      // Update player coordinates to pendulum bob
      p.x = p.swingAnchor.x + Math.sin(p.swingAngle) * p.swingLength - p.width / 2;
      p.y = p.swingAnchor.y + Math.cos(p.swingAngle) * p.swingLength - 10;
      p.facing = p.swingAngleVel >= 0 ? 'right' : 'left';

      // Spawn subtle rope wind particles
      if (Math.random() < 0.2) {
        spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#60a5fa', 2, 2);
      }

      // Detach / Launch off rope on Jump or Down
      if (jumpEdge || isDown) {
        p.isSwinging = false;
        const launchVx = Math.cos(p.swingAngle) * p.swingAngleVel * p.swingLength * 1.4;
        const launchVy = -Math.sin(p.swingAngle) * p.swingAngleVel * p.swingLength * 1.4 - 4.5;

        p.vx = clamp(launchVx, -12, 12);
        p.vy = clamp(launchVy, -14, 4);
        p.jumpCount = 1;
        p.swingAnchor = null;
        p.invincibleTimer = 0.3;
        gameAudio.playRetroJump();
        spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#38bdf8', 12, 4);
      }
      return; // Early return while swinging
    }

    // Check Ladder / Climbable Ivy Overlap
    let touchingLadder = false;
    for (const lad of laddersRef.current) {
      if (
        p.x + p.width * 0.7 > lad.x &&
        p.x + p.width * 0.3 < lad.x + lad.width &&
        p.y + p.height > lad.y &&
        p.y < lad.y + lad.height
      ) {
        touchingLadder = true;
        break;
      }
    }

    // Ladder climbing logic
    if (touchingLadder && (isUp || (p.isClimbing && isDown))) {
      p.isClimbing = true;
      p.isLedgeGrabbing = false;
      p.isMantling = false;
      p.isSwinging = false;
      p.vy = isUp ? -(getConfig('climbSpeed') as number) : (getConfig('climbSpeed') as number);
      p.vx = isLeft ? -2.2 : isRight ? 2.2 : 0;
      if (jumpEdge) {
        p.isClimbing = false;
        p.vy = (getConfig('playerJumpForce') as number) * 0.85;
        p.vx = (p.facing === 'left' ? -1 : 1) * 4.5;
        p.jumpCount = 1;
        gameAudio.playRetroJump();
      }
    } else if (!touchingLadder) {
      p.isClimbing = false;
    }

    // Check Stealth Cover (Crates)
    let inCover = false;
    for (const cov of coversRef.current) {
      if (
        p.x + p.width * 0.8 > cov.x &&
        p.x + p.width * 0.2 < cov.x + cov.width &&
        p.y + p.height >= cov.y + cov.height - 10 &&
        p.y + p.height <= cov.y + cov.height + 15
      ) {
        inCover = true;
        break;
      }
    }
    p.isCrouching = isDown && p.isGrounded && !p.isSliding;

    // Dodge Slide / Ground Roll Action
    if (isDown && (isLeft || isRight) && !p.isSliding && p.isGrounded && !p.isLedgeGrabbing) {
      p.isSliding = true;
      p.slideTimer = 0.45;
      p.invincibleTimer = 0.4;
      p.facing = isLeft ? 'left' : 'right';
      p.vx = (p.facing === 'left' ? -1 : 1) * (getConfig('slideSpeed') as number);
      gameAudio.playRetroJump();
      spawnParticles(p.x + p.width / 2, p.y + p.height, '#e2e8f0', 5, 2);
    }

    if (p.isSliding) {
      p.slideTimer -= dt;
      if (p.slideTimer <= 0) {
        p.isSliding = false;
      }
    }

    // --- Blocking & Perfect Parry Mechanics ---
    if (isBlock && p.isGrounded && !p.isSliding && !p.isAttacking && !p.isLedgeGrabbing) {
      if (!p.isBlocking) {
        p.isBlocking = true;
        p.blockDuration = 0;
        p.parryWindowTimer = 0.22; // 220ms active perfect parry window!
        spawnParticles(p.x + (p.facing === 'right' ? p.width : 0), p.y + p.height * 0.5, '#60a5fa', 4, 2);
      } else {
        p.blockDuration += dt;
        if (p.parryWindowTimer > 0) p.parryWindowTimer -= dt;
      }
      p.vx *= 0.5;
    } else {
      p.isBlocking = false;
      p.parryWindowTimer = 0;
      p.blockDuration = 0;
    }
    p.lastBlockPressed = !!isBlock;

    // Check Checkpoints (Level 1 Section Safe Points)
    if (currentLevel === 1 && p.x > 2400 && checkpointRef.current.x < 2400) {
      checkpointRef.current = { x: 2450, y: 460 };
      setObjectiveText('Infiltrate the Keep and duel Guard Captain Malakor');
      gameAudio.playPowerupChime();
      spawnParticles(2450, 480, '#f59e0b', 15, 4);
      spawnFloatingText(2450, 420, 'CHECKPOINT SAVED', '#10b981', 18);
    }

    // Boss area trigger & music transition
    const bossAreaThreshold = currentLevel === 1 ? 3600 : 4200;
    if (p.x > bossAreaThreshold && bgmTrackRef.current === 'sunset') {
      bgmTrackRef.current = 'boss';
      const bossTitle = currentLevel === 1 ? 'BOSS BATTLE: CAPTAIN MALAKOR' : 'BOSS BATTLE: LORD VANE, COMMANDER OF THE ECLIPSE';
      setObjectiveText(currentLevel === 1 ? 'DEFEAT Guard Captain Malakor & Escape the Eastern Gate!' : 'DEFEAT Lord Vane and claim the Moonlit Fortress!');
      gameAudio.playGunshotBlast();
      screenShakeRef.current = 6;
      spawnFloatingText(p.x, p.y - 40, bossTitle, '#ef4444', 20);
    }

    // Contextual Stealth Assassination Check
    let potentialStealthTarget: GuardEntity | null = null;
    const stealthRange = 85;

    for (const g of guardsRef.current) {
      if (!g.isDead && (g.state === 'PATROL' || g.state === 'SUSPICIOUS' || g.state === 'STAGGERED')) {
        const isBehind = (p.x < g.x && g.facing === 'right') || (p.x > g.x && g.facing === 'left');
        const isClose = Math.abs((p.x + p.width / 2) - (g.x + g.width / 2)) < stealthRange && Math.abs(p.y - g.y) < 55;
        const isAerialDrop = p.vy > 1.2 && p.y + p.height <= g.y + 45 && Math.abs((p.x + p.width / 2) - (g.x + g.width / 2)) < stealthRange;

        if ((isBehind && isClose) || isAerialDrop || g.state === 'STAGGERED') {
          if (checkLineOfSight(p.x + p.width / 2, p.y + p.height / 2, g.x + g.width / 2, g.y + g.height / 2, platformsRef.current)) {
            potentialStealthTarget = g;
            break;
          }
        }
      }
    }
    setCanStealthKill(!!potentialStealthTarget);

    // --- STEALTH TAKEDOWN EXECUTION ---
    const stealthEdge = (isStealth && !p.lastStealthPressed) || (isAttack && !p.lastAttackPressed && !!potentialStealthTarget);
    if (stealthEdge && potentialStealthTarget) {
      const g = potentialStealthTarget;
      p.facing = p.x < g.x ? 'right' : 'left';
      p.isAttacking = true;
      p.attackTimer = 0.36;
      p.invincibleTimer = 0.5;

      p.x = g.facing === 'right' ? g.x - 32 : g.x + g.width - 25;
      p.y = g.y;
      p.vx = 0;
      p.vy = 0;

      hitStopRef.current = 0.14;
      screenShakeRef.current = 8;
      gameAudio.playGunshotBlast();
      gameAudio.playSwordClash();
      gameAudio.playLevelUpStinger();

      spawnSlashEffect(g.x + g.width / 2, g.y + g.height * 0.45, p.facing, 3);
      spawnParticles(g.x + g.width / 2, g.y + g.height * 0.4, '#dc2626', 25, 6);
      spawnParticles(g.x + g.width / 2, g.y + g.height * 0.4, '#fbbf24', 15, 5);

      setStats((prev) => ({ ...prev, stealthKills: prev.stealthKills + 1 }));

      if (g.isBoss) {
        g.hp -= 4;
        g.isHurt = true;
        g.hurtTimer = 0.4;
        g.hitFlashTimer = 0.25;
        g.state = 'STAGGERED';
        g.staggerTimer = 2.0;
        setBossInfo({
          name: g.guardType === 'LORD_VANE' ? 'LORD VANE, COMMANDER OF THE ECLIPSE' : 'GUARD CAPTAIN MALAKOR',
          hpPercent: (g.hp / g.maxHp) * 100,
          guardPercent: (g.guardPosture / g.maxPosture) * 100,
          phase: g.bossPhase || 1,
        });
        spawnFloatingText(g.x + g.width / 2, g.y - 30, 'CRITICAL AMBUSH! -4', '#fde047', 22);

        if (g.hp <= 0) {
          g.isDead = true;
          g.animState = { currentAction: 'DEATH', currentFrame: 0, timer: 0, facing: g.facing };
          gameAudio.playChiptuneExplosion();
          setObjectiveText(currentLevel === 1 ? 'Captain Defeated! Escape through the Eastern Portcullis Gate!' : 'Lord Vane Defeated! Enter the Moonlit Citadel Apex Portal!');
          setGameState((prev) => ({ ...prev, score: prev.score + 3500 }));
        }
      } else {
        g.hp = 0;
        g.isDead = true;
        g.animState = { currentAction: 'DEATH', currentFrame: 0, timer: 0, facing: g.facing };
        const stealthBonus = getConfig('stealthBonusScore') as number;
        setGameState((prev) => ({ ...prev, score: prev.score + stealthBonus }));
        spawnFloatingText(g.x + g.width / 2, g.y - 30, `STEALTH KILL! +${stealthBonus}`, '#34d399', 20);
      }

      // Check if nearby guards witness takedown
      for (const otherGuard of guardsRef.current) {
        if (otherGuard.id !== g.id && !otherGuard.isDead) {
          const isFacingKill = (otherGuard.facing === 'right' && g.x > otherGuard.x) || (otherGuard.facing === 'left' && g.x < otherGuard.x);
          const distToKill = Math.hypot(otherGuard.x - g.x, otherGuard.y - g.y);
          if (isFacingKill && distToKill < (getConfig('guardSightRange') as number)) {
            if (checkLineOfSight(otherGuard.x + otherGuard.width / 2, otherGuard.y + 25, g.x + g.width / 2, g.y + 25, platformsRef.current)) {
              otherGuard.state = 'CHASE';
              otherGuard.awareness = 100;
              otherGuard.investigateX = p.x;
              setStats((prev) => ({ ...prev, alarmsTriggered: prev.alarmsTriggered + 1 }));
              spawnFloatingText(otherGuard.x + otherGuard.width / 2, otherGuard.y - 45, 'WITNESSED! !', '#ef4444', 24);
            }
          }
        }
      }
    }
    p.lastStealthPressed = !!isStealth;

    // --- 3-HIT SWORD COMBINATION ATTACK SYSTEM ---
    const attackEdge = isAttack && !p.lastAttackPressed;
    if (attackEdge && p.isAttacking && p.attackTimer < 0.16) {
      p.attackBufferTimer = 0.24;
    } else if (p.attackBufferTimer > 0) {
      p.attackBufferTimer -= dt;
    }

    const canInitiateAttack = (attackEdge || p.attackBufferTimer > 0) && !p.isAttacking && !p.isBlocking && !p.isSliding && !p.isClimbing && !p.isLedgeGrabbing && !p.isSwinging && !potentialStealthTarget;

    if (canInitiateAttack) {
      p.attackBufferTimer = 0;
      if (p.comboResetTimer > 0) {
        p.attackCombo = p.attackCombo >= 3 ? 1 : p.attackCombo + 1;
      } else {
        p.attackCombo = 1;
      }

      p.isAttacking = true;
      p.hasHitTarget = false;
      p.comboResetTimer = 0.65;
      setComboDisplay(p.attackCombo);

      let comboLunge = 2.0;
      let duration = 0.22;
      let damage = 1;
      let knockback = 3.5;

      if (p.attackCombo === 1) {
        comboLunge = 2.4;
        duration = 0.20;
        damage = 1;
        knockback = 3.0;
        gameAudio.playSwordClash();
      } else if (p.attackCombo === 2) {
        comboLunge = 3.4;
        duration = 0.22;
        damage = 1;
        knockback = 4.5;
        gameAudio.playSwordClash();
      } else if (p.attackCombo === 3) {
        comboLunge = 5.0;
        duration = 0.32;
        damage = 2;
        knockback = 8.0;
        gameAudio.playGunshotBlast();
        screenShakeRef.current = 5;
      }

      p.attackDuration = duration;
      p.attackTimer = duration;
      p.vx = (p.facing === 'left' ? -1 : 1) * comboLunge;

      const slashX = p.facing === 'left' ? p.x - 10 : p.x + p.width + 10;
      spawnSlashEffect(slashX, p.y + p.height * 0.45, p.facing, p.attackCombo);

      // Hitbox check on Hanging Lanterns (Extinguish light!)
      for (const lantern of hangingLanternsRef.current) {
        if (lantern.isLit && Math.hypot(slashX - lantern.x, (p.y + p.height * 0.45) - lantern.y) < 70) {
          lantern.isLit = false;
          gameAudio.playChiptuneExplosion();
          spawnParticles(lantern.x, lantern.y, '#f59e0b', 20, 4);
          spawnParticles(lantern.x, lantern.y, '#334155', 15, 3);
          spawnFloatingText(lantern.x, lantern.y - 20, 'LANTERN EXTINGUISHED! SHADOW CAST', '#94a3b8', 16);
        }
      }

      // Hitbox check on guards
      const attackRange = p.attackCombo === 3 ? 110 : 95;
      const attackBox = {
        x: p.facing === 'left' ? p.x - attackRange + 15 : p.x + p.width - 15,
        y: p.y - 15,
        width: attackRange,
        height: p.height + 25,
      };

      for (const g of guardsRef.current) {
        if (!g.isDead) {
          if (
            attackBox.x < g.x + g.width &&
            attackBox.x + attackBox.width > g.x &&
            attackBox.y < g.y + g.height &&
            attackBox.y + attackBox.height > g.y
          ) {
            if (checkLineOfSight(p.x + p.width / 2, p.y + p.height * 0.5, g.x + g.width / 2, g.y + g.height * 0.5, platformsRef.current)) {
              p.hasHitTarget = true;
              const isFrontal = (p.facing === 'right' && g.facing === 'left') || (p.facing === 'left' && g.facing === 'right');

              // Shield Sentinel or Boss blocking front attacks
              if (isFrontal && (g.guardType === 'SHIELD_SENTINEL' || g.guardType === 'LORD_VANE') && g.state !== 'STAGGERED' && p.attackCombo !== 3) {
                // Front attack deflected by heavy shield
                hitStopRef.current = 0.08;
                screenShakeRef.current = 2;
                gameAudio.playShieldBlock();
                g.guardPosture = Math.max(0, g.guardPosture - 1);
                spawnParticles(g.x + (g.facing === 'left' ? 0 : g.width), g.y + g.height * 0.4, '#38bdf8', 8, 3);
                spawnFloatingText(g.x + g.width / 2, g.y - 25, `SHIELD DEFLECT! Posture ${g.guardPosture}/${g.maxPosture}`, '#60a5fa', 14);

                if (g.guardPosture <= 0) {
                  // POSTURE BROKEN! Enter Staggered Stun state!
                  g.state = 'STAGGERED';
                  g.staggerTimer = 2.5;
                  g.guardPosture = g.maxPosture;
                  gameAudio.playGunshotBlast();
                  spawnFloatingText(g.x + g.width / 2, g.y - 45, 'GUARD BROKEN! STAGGERED!', '#fde047', 22);
                  spawnParticles(g.x + g.width / 2, g.y + g.height / 2, '#fde047', 20, 5);
                }
                continue;
              }

              // Normal or Crit Hit
              const isCrit = g.state === 'STAGGERED';
              const finalDamage = isCrit ? damage * 2 : damage;

              hitStopRef.current = p.attackCombo === 3 ? 0.12 : 0.08;
              screenShakeRef.current = p.attackCombo === 3 ? 6 : 3;

              g.hp -= finalDamage;
              g.isHurt = true;
              g.hurtTimer = 0.28;
              g.hitFlashTimer = 0.2;
              g.state = g.state === 'STAGGERED' ? 'STAGGERED' : 'CHASE';
              g.vx = (p.facing === 'left' ? -1 : 1) * knockback;
              if (p.attackCombo === 3) {
                g.vy = -2.5;
              }
              g.animState = { currentAction: 'HURT', currentFrame: 0, timer: 0, facing: g.facing };

              // Phase 2 Boss Transition for Lord Vane (Below 50% HP)
              if (g.guardType === 'LORD_VANE' && g.hp <= g.maxHp / 2 && g.bossPhase === 1) {
                g.bossPhase = 2;
                g.state = 'CASTING';
                g.staggerTimer = 1.0;
                gameAudio.playPowerupChime();
                screenShakeRef.current = 10;
                spawnFloatingText(g.x + g.width / 2, g.y - 55, 'PHASE 2: ECLIPSE AWAKENING!', '#c084fc', 24);
                spawnParticles(g.x + g.width / 2, g.y + g.height / 2, '#c084fc', 35, 7);
              }

              gameAudio.playMeleePunch();
              const hitColor = p.attackCombo === 3 ? '#f59e0b' : isCrit ? '#38bdf8' : '#ef4444';
              spawnParticles(g.x + g.width / 2, g.y + g.height / 2, hitColor, 16, 5);

              const dmgText = isCrit ? `CRIT! -${finalDamage}` : p.attackCombo === 3 ? `HEAVY FINISHER! -${finalDamage}` : `-${finalDamage}`;
              spawnFloatingText(g.x + g.width / 2, g.y - 25, dmgText, hitColor, isCrit || p.attackCombo === 3 ? 20 : 16);

              if (g.isBoss) {
                setBossInfo({
                  name: g.guardType === 'LORD_VANE' ? 'LORD VANE, COMMANDER OF THE ECLIPSE' : 'GUARD CAPTAIN MALAKOR',
                  hpPercent: (g.hp / g.maxHp) * 100,
                  guardPercent: (g.guardPosture / g.maxPosture) * 100,
                  phase: g.bossPhase || 1,
                });
              }

              if (g.hp <= 0) {
                g.isDead = true;
                g.animState = { currentAction: 'DEATH', currentFrame: 0, timer: 0, facing: g.facing };
                gameAudio.playChiptuneExplosion();
                const scoreBonus = g.isBoss ? (g.guardType === 'LORD_VANE' ? 5000 : 2000) : 250;
                setGameState((prev) => ({ ...prev, score: prev.score + scoreBonus }));
                spawnParticles(g.x + g.width / 2, g.y + g.height / 2, '#fbbf24', 28, 6);
                spawnFloatingText(g.x + g.width / 2, g.y - 40, `DEFEATED! +${scoreBonus}`, '#f59e0b', 22);

                if (g.isBoss) {
                  setObjectiveText(currentLevel === 1 ? 'Captain Defeated! Escape through the Eastern Portcullis Gate!' : 'Lord Vane Defeated! Enter the Moonlit Citadel Apex Portal!');
                  gameAudio.playLevelUpStinger();
                }
              }
            }
          }
        }
      }
    }
    p.lastAttackPressed = !!isAttack;

    if (p.isAttacking) {
      p.attackTimer -= dt;
      if (p.attackTimer <= 0) {
        p.isAttacking = false;
      }
    }

    // --- Ledge Grab & Mantle Handling ---
    if (p.isLedgeGrabbing && p.ledgePlat) {
      p.vx = 0;
      p.vy = 0;

      if (!p.isMantling) {
        if (isUp || jumpEdge || p.jumpBufferTimer > 0) {
          p.isMantling = true;
          p.mantleTimer = 0.22;
          p.jumpBufferTimer = 0;
          gameAudio.playRetroJump();
          spawnParticles(p.x + p.width / 2, p.y + 10, '#f8fafc', 5, 2);
        } else if (isDown || (p.ledgeSide === 'left' && isLeft) || (p.ledgeSide === 'right' && isRight)) {
          p.isLedgeGrabbing = false;
          p.isMantling = false;
          p.ledgePlat = null;
          p.ledgeCooldown = 0.3;
          p.vy = 2.5;
        }
      } else {
        p.mantleTimer -= dt;
        const targetX = p.ledgeSide === 'left' ? p.ledgePlat.x + 10 : p.ledgePlat.x + p.ledgePlat.width - p.width - 10;
        const targetY = p.ledgePlat.y - p.height;

        p.x += (targetX - p.x) * 0.28;
        p.y += (targetY - p.y) * 0.35;

        if (p.mantleTimer <= 0) {
          p.x = targetX;
          p.y = targetY;
          p.isGrounded = true;
          p.isLedgeGrabbing = false;
          p.isMantling = false;
          p.ledgePlat = null;
          p.jumpCount = 0;
          gameAudio.playFootstepStone();
          spawnParticles(p.x + p.width / 2, p.y + p.height, '#e2e8f0', 6, 2);
        }
      }
    }

    // --- Standard Movement & Steer ---
    if (!p.isClimbing && !p.isSliding && !p.isBlocking && !p.isAttacking && !p.isLedgeGrabbing && !p.isSwinging) {
      const accel = p.isGrounded ? (getConfig('groundAccel') as number) : (getConfig('airAccel') as number);
      const decel = p.isGrounded ? (getConfig('groundDecel') as number) : (getConfig('airDecel') as number);
      const maxSpeed = p.isCrouching ? 2.5 : (getConfig('playerRunSpeed') as number);

      if (isLeft) {
        p.vx -= accel;
        p.facing = 'left';
      } else if (isRight) {
        p.vx += accel;
        p.facing = 'right';
      } else {
        p.vx *= decel;
        if (Math.abs(p.vx) < 0.08) p.vx = 0;
      }
      p.vx = clamp(p.vx, -maxSpeed, maxSpeed);

      if (p.isGrounded) {
        p.coyoteTimer = 0;
        p.jumpCount = 0;
      } else {
        p.coyoteTimer += dt;
      }

      // Jump Execution
      if (p.jumpBufferTimer > 0) {
        const canJump = p.isGrounded || (p.coyoteTimer < 0.15 && p.jumpCount === 0);
        if (canJump) {
          p.vy = getConfig('playerJumpForce') as number;
          p.jumpCount = 1;
          p.isGrounded = false;
          p.coyoteTimer = 999;
          p.jumpBufferTimer = 0;
          gameAudio.playRetroJump();
          spawnParticles(p.x + p.width / 2, p.y + p.height, '#f8fafc', 6, 2.5);
        } else if (jumpEdge && p.jumpCount === 1) {
          p.vy = (getConfig('playerJumpForce') as number) * 0.88;
          p.jumpCount = 2;
          p.jumpBufferTimer = 0;
          gameAudio.playRetroJump();
          spawnParticles(p.x + p.width / 2, p.y + p.height, '#38bdf8', 8, 3.5);
        }
      }

      if (!isJump && p.lastJumpPressed && p.vy < -3.0) {
        p.vy *= 0.52;
      }

      let currentGravity = getConfig('gravityFalling') as number;
      if (p.vy < 0) {
        if (Math.abs(p.vy) < (getConfig('apexThreshold') as number)) {
          currentGravity = getConfig('gravityApex') as number;
        } else {
          currentGravity = getConfig('gravityRising') as number;
        }
      }
      p.vy += currentGravity;
      p.vy = Math.min(p.vy, 14.0);
    }
    p.lastJumpPressed = !!isJump;

    // --- Wall Slide & Kick ---
    p.isWallSliding = false;
    p.wallDir = null;
    if (!p.isGrounded && !p.isClimbing && !p.isLedgeGrabbing && !p.isSwinging && p.vy > 0) {
      for (const plat of platformsRef.current) {
        if (plat.dropThrough) continue;
        const inVertSpan = p.y + p.height > plat.y + 20 && p.y < plat.y + plat.height;
        if (inVertSpan) {
          if (isRight && Math.abs(p.x + p.width - plat.x) < 8) {
            p.isWallSliding = true;
            p.wallDir = 'right';
            p.vy = Math.min(p.vy, getConfig('wallSlideSpeed') as number);
          } else if (isLeft && Math.abs(p.x - (plat.x + plat.width)) < 8) {
            p.isWallSliding = true;
            p.wallDir = 'left';
            p.vy = Math.min(p.vy, getConfig('wallSlideSpeed') as number);
          }
        }
      }

      if (p.isWallSliding && jumpEdge) {
        p.vy = (getConfig('playerJumpForce') as number) * 0.95;
        p.vx = p.wallDir === 'left' ? 5.5 : -5.5;
        p.facing = p.wallDir === 'left' ? 'right' : 'left';
        p.jumpCount = 1;
        p.isWallSliding = false;
        gameAudio.playRetroJump();
        spawnParticles(p.x + p.width / 2, p.y + p.height * 0.5, '#f59e0b', 8, 3.5);
      }
    }

    // --- Automatic Ledge Grab Detection ---
    if (!p.isGrounded && !p.isClimbing && !p.isSliding && !p.isAttacking && !p.isLedgeGrabbing && !p.isSwinging && p.ledgeCooldown <= 0 && p.vy >= -4) {
      for (const plat of platformsRef.current) {
        const handY = p.y + 16;
        const isNearTop = handY >= plat.y - 12 && handY <= plat.y + 26;

        if (isNearTop) {
          if (p.facing === 'right' && p.x + p.width >= plat.x - 8 && p.x + p.width <= plat.x + 24) {
            p.isLedgeGrabbing = true;
            p.isMantling = false;
            p.ledgeSide = 'left';
            p.ledgePlat = plat;
            p.vx = 0;
            p.vy = 0;
            p.x = plat.x - p.width * 0.65;
            p.y = plat.y - 18;
            p.jumpCount = 0;
            gameAudio.playFootstepWood();
            break;
          } else if (p.facing === 'left' && p.x <= plat.x + plat.width + 8 && p.x >= plat.x + plat.width - 24) {
            p.isLedgeGrabbing = true;
            p.isMantling = false;
            p.ledgeSide = 'right';
            p.ledgePlat = plat;
            p.vx = 0;
            p.vy = 0;
            p.x = plat.x + plat.width - p.width * 0.35;
            p.y = plat.y - 18;
            p.jumpCount = 0;
            gameAudio.playFootstepWood();
            break;
          }
        }
      }
    }

    // --- Separate X & Y Platform Collision Resolution ---
    if (!p.isLedgeGrabbing && !p.isSwinging) {
      p.x += p.vx;
      for (const plat of platformsRef.current) {
        if (plat.dropThrough) continue;
        if (
          p.x + p.width > plat.x &&
          p.x < plat.x + plat.width &&
          p.y + p.height > plat.y + 10 &&
          p.y < plat.y + plat.height
        ) {
          if (p.vx > 0) p.x = plat.x - p.width;
          else if (p.vx < 0) p.x = plat.x + plat.width;
          p.vx = 0;
        }
      }

      if (!p.isClimbing) {
        const prevVy = p.vy;
        p.y += p.vy;
        p.isGrounded = false;

        for (const plat of platformsRef.current) {
          const isAbove = p.y + p.height - p.vy <= plat.y + 14;
          if (
            p.x + p.width * 0.8 > plat.x &&
            p.x + p.width * 0.2 < plat.x + plat.width &&
            p.y + p.height >= plat.y &&
            p.y + p.height <= plat.y + 24
          ) {
            if (plat.dropThrough && isDown && jumpEdge) {
              p.y += 14;
              continue;
            }
            if (p.vy >= 0 && isAbove) {
              p.y = plat.y - p.height;
              p.vy = 0;
              p.isGrounded = true;
              p.jumpCount = 0;

              if (prevVy > 7.5) {
                gameAudio.playJumpLandingThud();
                spawnParticles(p.x + p.width / 2, p.y + p.height, '#e2e8f0', 8, 2.5);
                screenShakeRef.current = Math.min(2, prevVy * 0.2);
              } else if (prevVy > 2.0) {
                gameAudio.playFootstepStone();
                spawnParticles(p.x + p.width / 2, p.y + p.height, '#94a3b8', 3, 1.2);
              }
            }
          } else if (!plat.dropThrough) {
            if (
              p.x + p.width > plat.x &&
              p.x < plat.x + plat.width &&
              p.y < plat.y + plat.height &&
              p.y > plat.y
            ) {
              if (p.vy < 0) {
                p.y = plat.y + plat.height;
                p.vy = 0;
              }
            }
          }
        }
      }
    }

    // Pickups (Relics & Potions)
    for (const col of collectiblesRef.current) {
      if (!col.collected) {
        if (
          p.x + p.width > col.x &&
          p.x < col.x + col.width &&
          p.y + p.height > col.y &&
          p.y < col.y + col.height
        ) {
          col.collected = true;
          if (col.type === 'relic') {
            gameAudio.playCoinPickup();
            setRelicCount((c) => c + 1);
            setStats((prev) => ({ ...prev, relicsFound: prev.relicsFound + 1 }));
            setGameState((prev) => ({ ...prev, score: prev.score + 1000 }));
            spawnParticles(col.x + col.width / 2, col.y + col.height / 2, '#fbbf24', 16, 4);
            spawnFloatingText(col.x + col.width / 2, col.y - 20, 'RELIC COLLECTED +1000', '#fbbf24', 18);
          } else if (col.type === 'potion') {
            gameAudio.playPotionGulp();
            const maxHp = getConfig('playerMaxHealth') as number;
            setPlayerHp((hp) => Math.min(maxHp, hp + 2));
            spawnParticles(col.x + col.width / 2, col.y + col.height / 2, '#ef4444', 16, 4);
            spawnFloatingText(col.x + col.width / 2, col.y - 20, '+2 HEALTH', '#ef4444', 18);
          }
        }
      }
    }

    // Check Victory / Portal Transitions
    const boss = guardsRef.current.find((g) => g.isBoss);
    if (boss && boss.isDead) {
      if (currentLevel === 1 && p.x > 4880) {
        // Level 1 Complete! Transition smoothly into Level 2!
        gameAudio.playVictoryFanfare();
        setGameState((prev) => ({ ...prev, score: prev.score + 3000 }));
        loadLevel(2);
        return;
      } else if (currentLevel === 2 && p.x > 5850) {
        // Full Game Victory!
        setGameState((prev) => ({
          ...prev,
          status: 'VICTORY',
          score: prev.score + 10000 + relicCount * 1500,
        }));
        return;
      }
    }

    // --- PROJECTILES (Crossbow Bolts, Moonlit Wave Slashes) ---
    for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
      const proj = projectilesRef.current[i];
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life -= dt;

      // Projectile collision with player
      const pDist = Math.hypot(p.x + p.width / 2 - proj.x, p.y + p.height / 2 - proj.y);
      if (pDist < proj.radius + 20 && p.invincibleTimer <= 0) {
        const isFrontal = (p.facing === 'right' && proj.vx < 0) || (p.facing === 'left' && proj.vx > 0);

        if (p.isBlocking && isFrontal && p.parryWindowTimer > 0) {
          // Parry projectile back or deflect!
          hitStopRef.current = 0.1;
          gameAudio.playSwordClash();
          spawnParticles(proj.x, proj.y, '#38bdf8', 16, 5);
          spawnFloatingText(proj.x, proj.y - 20, 'DEFLECTED!', '#38bdf8', 18);
          projectilesRef.current.splice(i, 1);
          continue;
        } else if (p.isBlocking && isFrontal) {
          gameAudio.playShieldBlock();
          spawnParticles(proj.x, proj.y, '#60a5fa', 10, 3);
          spawnFloatingText(proj.x, proj.y - 20, 'BLOCKED', '#93c5fd', 16);
          projectilesRef.current.splice(i, 1);
          continue;
        } else {
          // Direct hit on player
          hitStopRef.current = 0.12;
          screenShakeRef.current = 6;
          gameAudio.playGeneralDamage();
          p.isHurt = true;
          p.hurtTimer = 0.35;
          p.hitFlashTimer = 0.25;
          p.invincibleTimer = 1.1;
          p.vx = (proj.vx > 0 ? 1 : -1) * 4.5;
          p.vy = -3.0;

          setPlayerHp((hp) => {
            const next = hp - proj.damage;
            if (next <= 0) {
              p.isDead = true;
              p.animState = { currentAction: 'DEATH', currentFrame: 0, timer: 0, facing: p.facing };
              setTimeout(() => {
                setGameState((st) => ({ ...st, status: 'GAME_OVER' }));
              }, 1200);
            }
            return Math.max(0, next);
          });
          projectilesRef.current.splice(i, 1);
          continue;
        }
      }

      if (proj.life <= 0) {
        projectilesRef.current.splice(i, 1);
      }
    }

    // --- GUARD STEALTH AI STATE MACHINE ---
    const baseGuardSight = getConfig('guardSightRange') as number;

    for (const g of guardsRef.current) {
      if (g.isDead) {
        g.animState = (g.isBoss ? captainRendererRef.current : guardRendererRef.current).getNextState(g.animState, dt);
        continue;
      }

      if (g.attackCooldown > 0) g.attackCooldown -= dt;
      if (g.hurtTimer > 0) g.hurtTimer -= dt;
      if (g.hitFlashTimer > 0) g.hitFlashTimer -= dt;

      // Check if guard is within an unlit lantern zone (diminished vision)
      let inDarkZone = false;
      for (const lantern of hangingLanternsRef.current) {
        if (!lantern.isLit && Math.hypot(g.x - lantern.x, g.y - lantern.y) < lantern.radius) {
          inDarkZone = true;
          break;
        }
      }
      const effectiveSight = inDarkZone ? baseGuardSight * 0.55 : baseGuardSight;

      const distToPlayer = Math.hypot((p.x + p.width / 2) - (g.x + g.width / 2), (p.y + p.height / 2) - (g.y + g.height / 2));
      const heightDiff = Math.abs(p.y - g.y);
      const isPlayerInFront = (g.facing === 'right' && p.x > g.x) || (g.facing === 'left' && p.x < g.x);

      const hasDirectLOS = checkLineOfSight(
        g.x + g.width / 2,
        g.y + 25,
        p.x + p.width / 2,
        p.y + p.height / 2,
        platformsRef.current
      );

      const footstepHeard = !p.isCrouching && p.isGrounded && Math.abs(p.vx) > 3.0 && distToPlayer < 180 && hasDirectLOS;

      let isSeenDirectly = false;
      let isPeripheralDisturbance = false;

      // If player is concealed inside Shadow Niche or crouching behind cover
      const isConcealed = p.inShadowNiche || (inCover && p.isCrouching);

      if (hasDirectLOS && heightDiff < 90 && !isConcealed) {
        if (isPlayerInFront && distToPlayer < effectiveSight) {
          isSeenDirectly = true;
        } else if (distToPlayer < 110 && !p.isCrouching) {
          isPeripheralDisturbance = true;
        }
      }

      // Handle Staggered state from Perfect Parry or Guard Break
      if (g.state === 'STAGGERED') {
        g.staggerTimer -= dt;
        g.vx *= 0.8;
        if (g.staggerTimer <= 0) {
          g.state = 'CHASE';
        }
        g.animState = (g.isBoss ? captainRendererRef.current : guardRendererRef.current).getNextState(g.animState, dt);
        continue;
      }

      // State Transition Evaluation
      if (isSeenDirectly) {
        g.awareness = Math.min(100, g.awareness + dt * 180);
        g.investigateX = p.x;
        g.lostSightTimer = 0;

        if (g.awareness >= 70 && g.state !== 'CHASE' && g.state !== 'ATTACK' && g.state !== 'CASTING') {
          g.state = 'CHASE';
          setStats((prev) => ({ ...prev, alarmsTriggered: prev.alarmsTriggered + 1 }));
          gameAudio.playArcadeLaser();
          spawnFloatingText(g.x + g.width / 2, g.y - 45, '!', '#ef4444', 26);
          spawnParticles(g.x + g.width / 2, g.y - 30, '#ef4444', 8, 3);
        } else if (g.awareness < 70 && g.state === 'PATROL') {
          g.state = 'SUSPICIOUS';
          g.suspiciousTimer = 2.5;
          gameAudio.playHoverMicroTone();
          spawnFloatingText(g.x + g.width / 2, g.y - 45, '?', '#f59e0b', 24);
        }
      } else if (footstepHeard || isPeripheralDisturbance) {
        if (g.state === 'PATROL') {
          g.state = 'SUSPICIOUS';
          g.investigateX = p.x;
          g.suspiciousTimer = 3.0;
          gameAudio.playHoverMicroTone();
          spawnFloatingText(g.x + g.width / 2, g.y - 45, '?', '#f59e0b', 24);
        }
      } else {
        g.awareness = Math.max(0, g.awareness - dt * 25);
      }

      // --- Execute AI Behaviors by State ---
      if (g.state === 'PATROL') {
        if (g.guardType === 'CROSSBOW') {
          // Stationary sniper scans horizon
          g.suspiciousTimer -= dt;
          if (g.suspiciousTimer <= 0) {
            g.facing = g.facing === 'left' ? 'right' : 'left';
            g.suspiciousTimer = 3.5;
          }
        } else {
          g.x += g.vx;
          if (g.x > g.patrolMaxX) {
            g.x = g.patrolMaxX;
            g.vx = -Math.abs(g.vx);
            g.facing = 'left';
          } else if (g.x < g.patrolMinX) {
            g.x = g.patrolMinX;
            g.vx = Math.abs(g.vx);
            g.facing = 'right';
          }
        }
      } else if (g.state === 'SUSPICIOUS') {
        g.suspiciousTimer -= dt;
        const diffX = g.investigateX - g.x;
        g.facing = diffX > 0 ? 'right' : 'left';

        if (Math.abs(diffX) > 20 && g.guardType !== 'CROSSBOW') {
          g.vx = (diffX > 0 ? 1 : -1) * 1.0;
          g.x += g.vx;
        } else {
          g.vx = 0;
        }

        if (g.suspiciousTimer <= 0 || g.awareness <= 0) {
          g.state = 'PATROL';
          g.vx = (g.facing === 'left' ? -1 : 1) * (g.isBoss ? 1.6 : 1.2);
        }
      } else if (g.state === 'CHASE') {
        g.facing = p.x < g.x ? 'left' : 'right';

        if (g.guardType === 'CROSSBOW') {
          // Archer takes aim and fires bolt from range
          if (distToPlayer < 400 && g.attackCooldown <= 0) {
            g.state = 'ATTACK';
            g.isAttacking = true;
            g.hasStruck = false;
            g.attackWindupTimer = 0.55;
            g.attackTimer = 0.75;
            g.attackCooldown = 2.4;
            g.attackType = 'CROSSBOW_BOLT';
            spawnFloatingText(g.x + g.width / 2, g.y - 45, '🎯 SNIPER AIM', '#ef4444', 18);
          }
        } else {
          const chaseSpeed = g.isBoss ? 2.8 : 2.2;
          g.vx = (g.facing === 'left' ? -1 : 1) * chaseSpeed;
          g.x += g.vx;

          if (!hasDirectLOS || distToPlayer > 450) {
            g.lostSightTimer += dt;
            if (g.lostSightTimer > 3.0) {
              g.state = 'SUSPICIOUS';
              g.investigateX = p.x;
              g.suspiciousTimer = 2.0;
            }
          } else {
            g.lostSightTimer = 0;
          }

          // Trigger Attack Patterns
          const attackDist = g.isBoss ? 100 : 70;
          if (distToPlayer < attackDist && g.attackCooldown <= 0 && !g.isAttacking && Math.abs(p.y - g.y) < 55) {
            g.state = 'ATTACK';
            g.isAttacking = true;
            g.hasStruck = false;

            // Select Boss Attack Pattern
            if (g.guardType === 'LORD_VANE') {
              if (g.bossPhase === 2 && Math.random() < 0.45) {
                g.attackType = 'MOONWAVE';
                g.attackWindupTimer = 0.5;
                g.attackTimer = 0.8;
                g.attackCooldown = 2.0;
                spawnFloatingText(g.x + g.width / 2, g.y - 45, '🌙 MOONLIT WAVE!', '#c084fc', 22);
              } else if (g.bossPhase === 2 && Math.random() < 0.5) {
                g.attackType = 'LEAP_SMASH';
                g.attackWindupTimer = 0.6;
                g.attackTimer = 0.9;
                g.attackCooldown = 2.4;
                spawnFloatingText(g.x + g.width / 2, g.y - 45, '⚡ ECLIPSE SLAM!', '#f59e0b', 22);
              } else {
                g.attackType = 'SLASH';
                g.attackWindupTimer = 0.4;
                g.attackTimer = 0.65;
                g.attackCooldown = 1.5;
                spawnFloatingText(g.x + g.width / 2, g.y - 45, '⚠️ HEAVY CLEAVE!', '#ef4444', 20);
              }
            } else if (g.guardType === 'SHIELD_SENTINEL') {
              g.attackType = 'SHIELD_BASH';
              g.attackWindupTimer = 0.45;
              g.attackTimer = 0.7;
              g.attackCooldown = 2.2;
              spawnFloatingText(g.x + g.width / 2, g.y - 45, '🛡️ SHIELD BASH!', '#f59e0b', 20);
            } else {
              g.attackType = 'SLASH';
              g.attackWindupTimer = g.isBoss ? 0.45 : 0.35;
              g.attackTimer = 0.6;
              g.attackCooldown = 1.8;
              spawnFloatingText(g.x + g.width / 2, g.y - 45, '⚠️ ATTACK!', '#ef4444', 20);
            }

            g.animState = { currentAction: 'ATTACK', currentFrame: 0, timer: 0, facing: g.facing };
            spawnParticles(g.x + (g.facing === 'right' ? g.width : 0), g.y + 25, '#ef4444', 8, 3);
          }
        }
      } else if (g.state === 'ATTACK') {
        g.attackTimer -= dt;

        if (g.attackWindupTimer > 0) {
          g.attackWindupTimer -= dt;
          if (Math.random() < 0.4) {
            spawnParticles(g.x + (g.facing === 'right' ? g.width : 0), g.y + 20, '#ef4444', 2, 2);
          }
        } else if (!g.hasStruck) {
          g.hasStruck = true;

          if (g.attackType === 'CROSSBOW_BOLT') {
            // Spawn high-speed crossbow bolt projectile!
            gameAudio.playArcadeLaser();
            projectilesRef.current.push({
              id: `bolt_${Date.now()}`,
              x: g.facing === 'right' ? g.x + g.width : g.x,
              y: g.y + 35,
              vx: (g.facing === 'right' ? 1 : -1) * 8.5,
              vy: 0,
              radius: 6,
              color: '#f59e0b',
              damage: 1,
              life: 1.8,
              type: 'arrow',
              facing: g.facing,
            });
          } else if (g.attackType === 'MOONWAVE') {
            // Spawn crescent moonwave projectile!
            gameAudio.playGunshotBlast();
            screenShakeRef.current = 6;
            projectilesRef.current.push({
              id: `moonwave_${Date.now()}`,
              x: g.facing === 'right' ? g.x + g.width : g.x,
              y: g.y + 40,
              vx: (g.facing === 'right' ? 1 : -1) * 6.5,
              vy: 0,
              radius: 18,
              color: '#c084fc',
              damage: 1,
              life: 2.2,
              type: 'moonwave',
              facing: g.facing,
            });
          } else {
            // Melee Slash or Shield Bash Strike
            const strikeRange = g.guardType === 'LORD_VANE' ? 110 : g.isBoss ? 90 : 75;
            const strikeBox = {
              x: g.facing === 'left' ? g.x - strikeRange + 15 : g.x + g.width - 15,
              y: g.y - 10,
              width: strikeRange,
              height: g.height + 20,
            };

            if (
              strikeBox.x < p.x + p.width &&
              strikeBox.x + strikeBox.width > p.x &&
              strikeBox.y < p.y + p.height &&
              strikeBox.y + strikeBox.height > p.y &&
              p.invincibleTimer <= 0
            ) {
              const isFrontal = (p.facing === 'right' && g.x > p.x) || (p.facing === 'left' && g.x < p.x);

              if (p.isBlocking && isFrontal && p.parryWindowTimer > 0) {
                // PERFECT PARRY SUCCESS!
                hitStopRef.current = 0.15;
                screenShakeRef.current = 7;
                gameAudio.playSwordClash();
                gameAudio.playGunshotBlast();

                g.state = 'STAGGERED';
                g.staggerTimer = 2.0;
                g.isAttacking = false;
                g.vx = (p.facing === 'left' ? -1 : 1) * 5.0;
                g.animState = { currentAction: 'HURT', currentFrame: 0, timer: 0, facing: g.facing };

                spawnParticles(g.x + g.width / 2, g.y + g.height / 2, '#38bdf8', 25, 6);
                spawnParticles(g.x + g.width / 2, g.y + g.height / 2, '#fbbf24', 20, 5);
                spawnFloatingText(g.x + g.width / 2, g.y - 40, 'PERFECT PARRY!', '#38bdf8', 24);
                setGameState((prev) => ({ ...prev, score: prev.score + 150 }));
              } else if (p.isBlocking && isFrontal) {
                hitStopRef.current = 0.08;
                screenShakeRef.current = 3;
                gameAudio.playShieldBlock();

                p.vx = (g.facing === 'left' ? -1 : 1) * 2.5;
                g.vx = (p.facing === 'left' ? 1 : -1) * 2.0;
                spawnParticles(p.x + (p.facing === 'right' ? p.width : 0), p.y + p.height * 0.5, '#60a5fa', 12, 4);
                spawnFloatingText(p.x + p.width / 2, p.y - 25, 'BLOCKED', '#93c5fd', 18);
              } else {
                hitStopRef.current = 0.12;
                screenShakeRef.current = 6;
                gameAudio.playGeneralDamage();

                p.isHurt = true;
                p.hurtTimer = 0.35;
                p.hitFlashTimer = 0.25;
                p.invincibleTimer = 1.1;
                p.vx = (g.facing === 'left' ? -1 : 1) * (g.isBoss ? 6.5 : 4.5);
                p.vy = -3.5;

                spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#dc2626', 18, 5);
                spawnFloatingText(p.x + p.width / 2, p.y - 30, '-1 HP', '#ef4444', 20);

                setPlayerHp((hp) => {
                  const next = hp - 1;
                  if (next <= 0) {
                    p.isDead = true;
                    p.animState = { currentAction: 'DEATH', currentFrame: 0, timer: 0, facing: p.facing };
                    setTimeout(() => {
                      setGameState((st) => ({ ...st, status: 'GAME_OVER' }));
                    }, 1200);
                  }
                  return Math.max(0, next);
                });
              }
            }
          }
        }

        if (g.attackTimer <= 0) {
          g.isAttacking = false;
          g.state = 'CHASE';
        }
      }

      // Update Guard Animations
      let targetGuardAction = 'WALK';
      if (g.isHurt || g.state === 'STAGGERED') targetGuardAction = 'HURT';
      else if (g.isAttacking) targetGuardAction = 'ATTACK';
      else if (g.state === 'CHASE') targetGuardAction = g.isBoss ? 'WALK' : 'RUN';
      else if (g.state === 'SUSPICIOUS' && Math.abs(g.vx) < 0.2) targetGuardAction = 'IDLE';

      if (g.animState.currentAction !== targetGuardAction) {
        g.animState = { currentAction: targetGuardAction, currentFrame: 0, timer: 0, facing: g.facing };
      } else {
        g.animState.facing = g.facing;
      }
      g.animState = (g.isBoss ? captainRendererRef.current : guardRendererRef.current).getNextState(g.animState, dt);
    }

    // Determine Player Animation State
    let targetAction = 'IDLE';
    if (p.isDead) targetAction = 'DEATH';
    else if (p.isHurt) targetAction = 'HURT';
    else if (p.isAttacking) targetAction = 'ATTACK';
    else if (p.isLedgeGrabbing || p.isMantling || p.isWallSliding || p.isClimbing || p.isSwinging) targetAction = 'CLIMB';
    else if (p.isSliding) targetAction = 'SLIDE';
    else if (p.isCrouching && Math.abs(p.vx) > 0.5) targetAction = 'CRAWL';
    else if (!p.isGrounded) targetAction = 'JUMP';
    else if (Math.abs(p.vx) > 3.0) targetAction = 'RUN';
    else if (Math.abs(p.vx) > 0.2) targetAction = 'WALK';

    if (p.animState.currentAction !== targetAction) {
      p.animState = { currentAction: targetAction, currentFrame: 0, timer: 0, facing: p.facing };
    } else {
      p.animState.facing = p.facing;
    }
    p.animState = kaelRendererRef.current.getNextState(p.animState, dt);

    // Update Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const part = particlesRef.current[i];
      part.x += part.vx;
      part.y += part.vy;
      if (part.gravity) part.vy += part.gravity;
      part.life -= dt;
      if (part.life <= 0) {
        particlesRef.current.splice(i, 1);
      }
    }

    // Update Floating Damage Texts
    for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
      const ft = floatingTextsRef.current[i];
      ft.y += ft.vy;
      ft.life -= dt;
      if (ft.life <= 0) {
        floatingTextsRef.current.splice(i, 1);
      }
    }

    // Update Slash Trail Effects
    for (let i = slashEffectsRef.current.length - 1; i >= 0; i--) {
      const sl = slashEffectsRef.current[i];
      sl.life -= dt;
      if (sl.life <= 0) {
        slashEffectsRef.current.splice(i, 1);
      }
    }

    // Smooth Camera Tracking with Lookahead
    const targetCamX = clamp(
      p.x - canvasWidth * 0.35 + (p.facing === 'right' ? 80 : -80) + p.vx * 12,
      0,
      levelBoundsRef.current.width - canvasWidth
    );
    cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.12;
    if (screenShakeRef.current > 0) {
      screenShakeRef.current -= dt * 16;
    }
  };

  // --- Main Draw Loop ---
  const draw = (ctx: CanvasRenderingContext2D) => {
    prepareCanvas(ctx, canvasWidth, canvasHeight);

    const camX = Math.round(cameraRef.current.x + (screenShakeRef.current > 0 ? (Math.random() - 0.5) * screenShakeRef.current * 3 : 0));
    const camY = screenShakeRef.current > 0 ? (Math.random() - 0.5) * screenShakeRef.current * 2 : 0;

    // 1. Parallax Sky & Castle Background
    if (currentLevel === 1) {
      const bgImg = camX > 3200 ? assets['bg_castle'] : assets['bg_sunset'];
      drawBackground(ctx, bgImg, canvasWidth, canvasHeight, '#1c1917', camX * 0.3, camY);
    } else {
      // Level 2: Moonlit Night Fortress Backdrop with Luminous Moon & Stars
      ctx.save();
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      skyGrad.addColorStop(0, '#060714');
      skyGrad.addColorStop(0.5, '#0d1326');
      skyGrad.addColorStop(1, '#1b1233');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Parallax Distant Fortress Spires & Moon
      const moonX = canvasWidth * 0.75 - (camX * 0.05);
      const moonY = 130;
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#93c5fd';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Distant Spire Silhouettes
      ctx.fillStyle = '#080a18';
      for (let s = 0; s < 10; s++) {
        const sx = s * 300 - (camX * 0.15);
        ctx.beginPath();
        ctx.moveTo(sx, 480);
        ctx.lineTo(sx + 50, 180 + (s % 3) * 60);
        ctx.lineTo(sx + 100, 480);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.translate(-camX, -camY);

    // 2. Draw Shadow Niches (Level 2 Dark Alcoves)
    for (const niche of shadowNichesRef.current) {
      ctx.save();
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(niche.x, niche.y, niche.width, niche.height, [30, 30, 0, 0]) : ctx.fillRect(niche.x, niche.y, niche.width, niche.height);
      ctx.fill();
      ctx.stroke();

      // Shadow Niche subtle icon
      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('SHADOW', niche.x + 8, niche.y + 24);
      ctx.restore();
    }

    // 3. Draw Ladders / Ivy Walls
    for (const lad of laddersRef.current) {
      drawAsset(ctx, assets['ivy_ladder'], lad.x, lad.y, lad.width, lad.height, (c) => {
        c.fillStyle = currentLevel === 1 ? '#15803d' : '#1e3a8a';
        c.fillRect(lad.x, lad.y, lad.width, lad.height);
      });
    }

    // 4. Draw Platforms (Sandstone, Castle Floor, Fortress Battlements)
    for (const plat of platformsRef.current) {
      if (plat.type === 'wood' || plat.type === 'spire_roof') {
        drawAsset(ctx, assets['wooden_beam'], plat.x, plat.y, plat.width, plat.height, (c) => {
          c.fillStyle = currentLevel === 1 ? '#78350f' : '#334155';
          c.fillRect(plat.x, plat.y, plat.width, plat.height);
        });
      } else {
        drawAsset(ctx, assets['rooftop_sandstone'], plat.x, plat.y, plat.width, plat.height, (c) => {
          c.fillStyle = currentLevel === 1 ? '#b45309' : '#1e1b4b';
          c.fillRect(plat.x, plat.y, plat.width, plat.height);
        });

        // Fortress decorative battlements
        if (plat.type === 'fortress_battlement') {
          ctx.fillStyle = '#0f172a';
          for (let bx = plat.x; bx < plat.x + plat.width; bx += 40) {
            ctx.fillRect(bx, plat.y - 12, 20, 12);
          }
        }
      }
    }

    // 5. Draw Hanging Lanterns & Light Cones
    for (const lantern of hangingLanternsRef.current) {
      ctx.save();
      // Draw hanging chain & lantern body
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lantern.x, lantern.y - 40);
      ctx.lineTo(lantern.x, lantern.y);
      ctx.stroke();

      if (lantern.isLit) {
        // Glowing Light Radius
        const lightGrad = ctx.createRadialGradient(lantern.x, lantern.y, 10, lantern.x, lantern.y, lantern.radius);
        lightGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
        lightGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.12)');
        lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(lantern.x, lantern.y, lantern.radius, 0, Math.PI * 2);
        ctx.fill();

        // Lantern Core Flame
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(lantern.x, lantern.y, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Extinguished Metal Shell
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(lantern.x, lantern.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 6. Draw Grapple / Rope Swing Anchors
    for (const anchor of grappleAnchorsRef.current) {
      ctx.save();
      const isPlayerNear = Math.hypot(playerRef.current.x - anchor.x, playerRef.current.y - anchor.y) < 180;
      ctx.fillStyle = isPlayerNear ? '#38bdf8' : '#64748b';
      ctx.shadowColor = isPlayerNear ? '#38bdf8' : '#000000';
      ctx.shadowBlur = isPlayerNear ? 16 : 0;
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 9, 0, Math.PI * 2);
      ctx.fill();

      // Golden anchor ring
      ctx.strokeStyle = isPlayerNear ? '#fde047' : '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 7. Draw Checkpoint Shrines
    for (const shrine of checkpointShrinesRef.current) {
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(shrine.x, shrine.y, shrine.width, shrine.height);

      // Blue holy fire if activated
      if (shrine.activated) {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(shrine.x + shrine.width / 2, shrine.y + 15, 12, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(shrine.x + shrine.width / 2, shrine.y + 15, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 8. Draw Stealth Cover Crates
    for (const cov of coversRef.current) {
      drawAsset(ctx, assets['stealth_cover_crates'], cov.x, cov.y, cov.width, cov.height, (c) => {
        c.fillStyle = '#451a03';
        c.fillRect(cov.x, cov.y, cov.width, cov.height);
      });
    }

    // 9. Draw Collectibles (Ancient Relics & Potions)
    for (const col of collectiblesRef.current) {
      if (!col.collected) {
        const floatOffset = Math.sin(Date.now() * 0.005 + col.x) * 4;
        const assetImg = col.type === 'relic' ? assets['gold_relic'] : assets['health_potion'];
        drawAsset(ctx, assetImg, col.x, col.y + floatOffset, col.width, col.height, (c) => {
          c.fillStyle = col.type === 'relic' ? '#fbbf24' : '#ef4444';
          c.beginPath();
          c.arc(col.x + col.width / 2, col.y + col.height / 2 + floatOffset, col.width / 2, 0, Math.PI * 2);
          c.fill();
        });
      }
    }

    // 10. Draw Exit Portals / Gates
    const gateX = currentLevel === 1 ? 4850 : 5800;
    const gateY = 360;
    drawAsset(ctx, assets['portcullis_gate'], gateX, gateY, 200, 200, (c) => {
      c.fillStyle = currentLevel === 1 ? '#334155' : '#4338ca';
      c.fillRect(gateX, gateY, 200, 200);
    });

    // 11. Draw Projectiles (Crossbow bolts, Crescent moonwaves)
    for (const proj of projectilesRef.current) {
      ctx.save();
      if (proj.type === 'moonwave') {
        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, proj.facing === 'right' ? -Math.PI * 0.5 : Math.PI * 0.5, proj.facing === 'right' ? Math.PI * 0.5 : Math.PI * 1.5);
        ctx.fill();
      } else {
        ctx.fillStyle = proj.color;
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(proj.x - 8, proj.y - 3, 16, 6);
      }
      ctx.restore();
    }

    // 12. Draw Guards & Bosses
    for (const g of guardsRef.current) {
      if (!g.isDead) {
        const maxSight = getConfig('guardSightRange') as number;
        const eyeX = g.facing === 'right' ? g.x + g.width : g.x;
        const eyeY = g.y + 25;
        const dir = g.facing === 'right' ? 1 : -1;
        const obstructedX = getSolidWallObstructionX(eyeX, eyeY, dir as 1 | -1, maxSight, platformsRef.current);
        const actualSightDist = Math.abs(obstructedX - eyeX);

        // Vision Cone
        ctx.save();
        const coneAlpha = g.state === 'CHASE' ? 0.22 : g.state === 'SUSPICIOUS' ? 0.16 : 0.08;
        const coneColor = g.state === 'CHASE' ? `rgba(239, 68, 68, ${coneAlpha})` : g.state === 'SUSPICIOUS' ? `rgba(245, 158, 11, ${coneAlpha})` : `rgba(56, 189, 248, ${coneAlpha})`;

        ctx.fillStyle = coneColor;
        ctx.beginPath();
        ctx.moveTo(eyeX, eyeY);
        ctx.lineTo(obstructedX, eyeY - 35 * (actualSightDist / maxSight));
        ctx.lineTo(obstructedX, eyeY + 45 * (actualSightDist / maxSight));
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Alert Icon
        if (g.state !== 'PATROL') {
          const alertAsset = assets['icon_alert'];
          drawAsset(ctx, alertAsset, g.x + g.width / 2 - 16, g.y - 44, 32, 32, (c) => {
            c.fillStyle = g.state === 'CHASE' ? '#ef4444' : g.state === 'STAGGERED' ? '#38bdf8' : '#f59e0b';
            c.font = 'bold 22px sans-serif';
            c.fillText(g.state === 'CHASE' ? '!' : g.state === 'STAGGERED' ? '💫' : '?', g.x + g.width / 2 - 6, g.y - 18);
          });

          // Awareness meter
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(g.x + 5, g.y - 8, g.width - 10, 5);
          ctx.fillStyle = g.state === 'CHASE' ? '#ef4444' : '#f59e0b';
          ctx.fillRect(g.x + 5, g.y - 8, (g.width - 10) * (g.awareness / 100), 5);
        }

        // Guard Health Bar & Shield Guard Posture
        if (g.isBoss || g.hp < g.maxHp || g.guardType === 'SHIELD_SENTINEL') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(g.x - 5, g.y - 18, g.width + 10, 6);
          ctx.fillStyle = g.isBoss ? (g.bossPhase === 2 ? '#c084fc' : '#f59e0b') : '#ef4444';
          ctx.fillRect(g.x - 4, g.y - 17, (g.width + 8) * (g.hp / g.maxHp), 4);

          // Shield Posture Bar (for Shield Sentinel / Boss)
          if (g.maxPosture > 1) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(g.x - 5, g.y - 24, g.width + 10, 4);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(g.x - 4, g.y - 23, (g.width + 8) * (g.guardPosture / g.maxPosture), 2);
          }
        }

        // Attack Danger Telegraph Arc & Aura
        if (g.state === 'ATTACK' && g.attackWindupTimer > 0) {
          ctx.save();
          const totalWindup = g.guardType === 'LORD_VANE' ? 0.5 : g.isBoss ? 0.45 : 0.35;
          const windupProgress = 1 - (g.attackWindupTimer / totalWindup);
          const strikeRange = g.guardType === 'LORD_VANE' ? 110 : g.isBoss ? 90 : 75;

          ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + windupProgress * 0.25})`;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const startX = g.facing === 'right' ? g.x + g.width : g.x;
          const endX = g.facing === 'right' ? g.x + g.width + strikeRange * windupProgress : g.x - strikeRange * windupProgress;
          ctx.rect(Math.min(startX, endX), g.y - 10, Math.abs(endX - startX), g.height + 20);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 12px sans-serif';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.fillText('⚠️ PARRY!', g.x - 10, g.y - 52);
          ctx.restore();
        }

        // Stagger Dizzy Stars Effect
        if (g.state === 'STAGGERED') {
          ctx.save();
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 16px sans-serif';
          const starAngle = Date.now() * 0.008;
          const starX = g.x + g.width / 2 + Math.cos(starAngle) * 22;
          const starY = g.y - 15 + Math.sin(starAngle) * 6;
          ctx.fillText('⭐', starX, starY);
          const starX2 = g.x + g.width / 2 + Math.cos(starAngle + Math.PI) * 22;
          const starY2 = g.y - 15 + Math.sin(starAngle + Math.PI) * 6;
          ctx.fillText('⭐', starX2, starY2);
          ctx.restore();
        }
      }

      // Render Guard / Boss Sprite (with White Hit Flash)
      const renderer = g.isBoss ? captainRendererRef.current : guardRendererRef.current;
      if (g.hitFlashTimer > 0) {
        ctx.save();
        ctx.filter = 'brightness(2.5) contrast(1.5)';
        renderer.draw(ctx, g.animState, g.x, g.y, g.width, g.height, assets);
        ctx.restore();
      } else {
        renderer.draw(ctx, g.animState, g.x, g.y, g.width, g.height, assets);
      }
    }

    // 13. Draw Grapple Rope (if active)
    const p = playerRef.current;
    if (p.isSwinging && p.swingAnchor) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(p.swingAnchor.x, p.swingAnchor.y);
      ctx.lineTo(p.x + p.width / 2, p.y + 10);
      ctx.stroke();
      ctx.restore();
    }

    // 14. Draw Player Kael
    if (p.invincibleTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    if (p.isBlocking) {
      ctx.save();
      ctx.strokeStyle = p.parryWindowTimer > 0 ? '#38bdf8' : 'rgba(59, 130, 246, 0.7)';
      ctx.lineWidth = p.parryWindowTimer > 0 ? 4 : 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = p.parryWindowTimer > 0 ? 15 : 6;
      ctx.beginPath();
      const shieldArcX = p.facing === 'right' ? p.x + p.width + 5 : p.x - 5;
      ctx.arc(shieldArcX, p.y + p.height * 0.5, 36, p.facing === 'right' ? -Math.PI * 0.4 : Math.PI * 0.6, p.facing === 'right' ? Math.PI * 0.4 : Math.PI * 1.4);
      ctx.stroke();
      ctx.restore();
    }

    if (p.hitFlashTimer > 0) {
      ctx.save();
      ctx.filter = 'brightness(3)';
      kaelRendererRef.current.draw(ctx, p.animState, p.x, p.y, p.width, p.height, assets);
      ctx.restore();
    } else {
      kaelRendererRef.current.draw(ctx, p.animState, p.x, p.y, p.width, p.height, assets);
    }
    ctx.globalAlpha = 1.0;

    // Draw Slash Arc Trail Effects
    for (const sl of slashEffectsRef.current) {
      ctx.save();
      const progress = 1 - (sl.life / sl.maxLife);
      ctx.strokeStyle = sl.color;
      ctx.lineWidth = sl.comboStage === 3 ? 6 : 4;
      ctx.shadowColor = sl.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(sl.x, sl.y, sl.radius, sl.startAngle, sl.endAngle + progress * 0.5);
      ctx.stroke();
      ctx.restore();
    }

    // Stealth Kill Contextual Prompt
    if (canStealthKill && !p.isAttacking && !p.isDead) {
      ctx.save();
      ctx.fillStyle = 'rgba(220, 38, 38, 0.95)';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(p.x - 30, p.y - 56, 120, 28, 6) : ctx.fillRect(p.x - 30, p.y - 56, 120, 28);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(isMobile ? '⚔️ TAP KILL' : '⚔️ [E] ASSASSINATE', p.x - 22, p.y - 38);
      ctx.restore();
    }

    // Grapple Prompt
    if (canGrapple && !p.isSwinging && !p.isDead) {
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.95)';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(p.x - 25, p.y - 56, 110, 28, 6) : ctx.fillRect(p.x - 25, p.y - 56, 110, 28);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(isMobile ? '🪝 TAP ROPE' : '🪝 [F] GRAPPLE', p.x - 18, p.y - 38);
      ctx.restore();
    }

    // 15. Draw Particles
    for (const part of particlesRef.current) {
      ctx.save();
      ctx.fillStyle = part.color;
      ctx.globalAlpha = Math.max(0, part.life / part.maxLife);
      ctx.beginPath();
      ctx.arc(part.x, part.y, Math.max(0.5, part.size * (part.life / part.maxLife)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 16. Draw Floating Combat Texts
    for (const ft of floatingTextsRef.current) {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.font = `bold ${ft.size}px sans-serif`;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x - 20, ft.y);
      ctx.restore();
    }

    ctx.restore();
  };

  // --- Game Loop Management ---
  const updateRef = useRef(update);
  const drawRef = useRef(draw);
  updateRef.current = update;
  drawRef.current = draw;

  useEffect(() => {
    let raf = 0;
    const loop = (time: number) => {
      if (inputRef.current) {
        const cancelPressed = inputRef.current.actions.cancel;
        if (cancelPressed) {
          setIsGameMenuOpen((prev) => !prev);
        }
      }

      stepperRef.current?.(time, (dt) => updateRef.current(dt));

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawRef.current(ctx);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const bgmUrl = bgmTrackRef.current === 'boss' ? 'assets/audio/bgm_boss_confrontation.mp3' : 'assets/audio/bgm_valoria_sunset.mp3';
  const isMusicPlaying = gameState.status === 'PLAYING' && !isGameMenuOpen && !isHowToPlayOpen && !isLevelSelectOpen;

  const startButtonRef = useAutoFocus<HTMLButtonElement>(gameState.status === 'START');

  return (
    <div className="fixed inset-0 overflow-hidden touch-none flex flex-col items-center justify-between bg-stone-950 text-amber-100 select-none font-serif">
      <BackgroundMusic url={bgmUrl} isPlaying={isMusicPlaying} isMuted={isMusicMuted} />

      {!assetsReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-stone-950 text-amber-400">
          <Sparkles className="w-12 h-12 animate-spin mb-4" />
          <div className="text-xl font-bold tracking-widest">GATHERING SHADOWS...</div>
        </div>
      )}

      {/* TOP DIEGETIC MEDIEVAL HUD */}
      <div className="w-full bg-stone-900/90 border-b-2 border-amber-800/80 px-4 py-2 z-20 flex flex-wrap items-center justify-between shadow-xl backdrop-blur-sm gap-2">
        {/* Left: Health Gems, Relics & Level Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: getConfig('playerMaxHealth') as number }).map((_, i) => (
              <Heart
                key={i}
                size={20}
                className={i < playerHp ? 'text-red-500 fill-red-500 drop-shadow-md' : 'text-stone-700 fill-stone-900'}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-stone-800 px-2 py-1 rounded border border-amber-700/50">
            <Trophy size={14} className="text-yellow-400" />
            <span>RELICS: {relicCount}/{totalRelics}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black text-indigo-200 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-700/60">
            <Compass size={14} className="text-indigo-400" />
            <span>LVL {currentLevel}: {currentLevel === 1 ? 'VALORIA' : 'MOONLIT FORTRESS'}</span>
          </div>

          {/* Active Attack Combo Indicator */}
          {comboDisplay > 0 && (
            <div className="flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded border border-yellow-500/70 bg-stone-950 text-yellow-300 animate-pulse">
              <Zap size={12} className="text-amber-400 fill-amber-400" />
              <span>COMBO x{comboDisplay}</span>
            </div>
          )}
        </div>

        {/* Center: Objective Banner */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-amber-200 tracking-wide font-medium bg-stone-950/70 px-3 py-1 rounded-full border border-amber-900">
          <Activity size={14} className="text-amber-400" />
          <span>{objectiveText}</span>
        </div>

        {/* Right: Score & Menu Trigger */}
        <div className="flex items-center gap-3">
          <div className="text-xs sm:text-sm font-black text-amber-400 tracking-wider">
            SCORE: <span className="text-white">{gameState.score}</span>
          </div>

          <button
            onClick={() => setIsGameMenuOpen(true)}
            className="p-1.5 bg-stone-800 hover:bg-amber-700 text-amber-300 rounded border border-amber-600 transition-colors flex items-center gap-1 text-xs font-bold"
            title="Game Menu">
            <Menu size={16} />
            <span className="hidden sm:inline">MENU</span>
          </button>
        </div>
      </div>

      {/* BOSS HEALTH BAR & PHASE INDICATOR */}
      {bossInfo && (
        <div className="w-full max-w-lg px-4 pt-1 z-20 flex flex-col items-center">
          <div className="flex justify-between w-full text-[11px] font-bold text-amber-300 mb-1 px-1">
            <span>{bossInfo.name} {bossInfo.phase > 1 ? '(ECLIPSE FURY)' : ''}</span>
            <span>{Math.max(0, Math.ceil(bossInfo.hpPercent))}%</span>
          </div>
          <div className="w-full h-3 bg-stone-950 rounded-full border border-amber-600 overflow-hidden shadow-lg">
            <div
              className={`h-full transition-all duration-200 ${
                bossInfo.phase > 1
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400'
                  : 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400'
              }`}
              style={{ width: `${bossInfo.hpPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* GAMEPLAY CANVAS CONTAINER */}
      <div className="flex-1 w-full min-h-0 relative flex items-center justify-center bg-black">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            aspectRatio: `${canvasWidth} / ${canvasHeight}`,
            width: `min(100%, calc(100vh * ${canvasWidth} / ${canvasHeight}))`,
          }}
          className="h-auto max-w-full max-h-full drop-shadow-2xl shadow-2xl"
        />
      </div>

      {/* ON-SCREEN TOUCH CONTROLS FOR MOBILE */}
      {isMobile && gameState.status === 'PLAYING' && (
        <div className="w-full z-30 px-6 py-3 flex items-center justify-between pointer-events-none bg-stone-950/80 border-t border-amber-900/50">
          {/* Left D-Pad: Movement */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mobileInputRef.current.left = true; }}
              onPointerUp={() => { mobileInputRef.current.left = false; }}
              onPointerCancel={() => { mobileInputRef.current.left = false; }}
              className="w-14 h-14 bg-stone-800/90 active:bg-amber-600 text-amber-200 border-2 border-amber-700/60 rounded-xl font-black text-lg flex items-center justify-center shadow-lg active:scale-95">
              ◀
            </button>
            <button
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mobileInputRef.current.down = true; }}
              onPointerUp={() => { mobileInputRef.current.down = false; }}
              onPointerCancel={() => { mobileInputRef.current.down = false; }}
              className="w-14 h-14 bg-stone-800/90 active:bg-amber-600 text-amber-200 border-2 border-amber-700/60 rounded-xl font-black text-sm flex flex-col items-center justify-center shadow-lg active:scale-95">
              <span>▼</span>
              <span className="text-[9px]">SNEAK</span>
            </button>
            <button
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mobileInputRef.current.right = true; }}
              onPointerUp={() => { mobileInputRef.current.right = false; }}
              onPointerCancel={() => { mobileInputRef.current.right = false; }}
              className="w-14 h-14 bg-stone-800/90 active:bg-amber-600 text-amber-200 border-2 border-amber-700/60 rounded-xl font-black text-lg flex items-center justify-center shadow-lg active:scale-95">
              ▶
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Grapple / Rope Swing Button */}
            {canGrapple && (
              <button
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mobileInputRef.current.grapple = true; }}
                onPointerUp={() => { mobileInputRef.current.grapple = false; }}
                onPointerCancel={() => { mobileInputRef.current.grapple = false; }}
                className="w-14 h-14 bg-cyan-900 active:bg-cyan-700 text-cyan-200 border-2 border-cyan-400 rounded-xl font-black text-xs flex flex-col items-center justify-center shadow-lg animate-pulse">
                <span>🪝</span>
                <span className="text-[8px]">SWING</span>
              </button>
            )}

            {/* Stealth Kill Contextual Button */}
            {canStealthKill && (
              <button
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mobileInputRef.current.stealth = true; }}
                onPointerUp={() => { mobileInputRef.current.stealth = false; }}
                onPointerCancel={() => { mobileInputRef.current.stealth = false; }}
                className="w-14 h-14 bg-red-800 active:bg-red-600 text-yellow-300 border-2 border-yellow-400 rounded-xl font-black text-xs flex flex-col items-center justify-center shadow-lg animate-pulse">
                <span>⚔️</span>
                <span className="text-[8px]">KILL</span>
              </button>
            )}

            {/* Block / Parry Button */}
            <button
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mobileInputRef.current.block = true; }}
              onPointerUp={() => { mobileInputRef.current.block = false; }}
              onPointerCancel={() => { mobileInputRef.current.block = false; }}
              className="w-14 h-14 bg-blue-950/90 active:bg-blue-700 text-blue-200 border-2 border-blue-500 rounded-xl font-black text-xs flex flex-col items-center justify-center shadow-lg active:scale-95">
              <Shield size={16} />
              <span className="text-[9px]">PARRY</span>
            </button>

            {/* Attack Button */}
            <button
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mobileInputRef.current.attack = true; }}
              onPointerUp={() => { mobileInputRef.current.attack = false; }}
              onPointerCancel={() => { mobileInputRef.current.attack = false; }}
              className="w-14 h-14 bg-amber-800/90 active:bg-amber-500 text-amber-100 border-2 border-amber-500 rounded-xl font-black text-xs flex flex-col items-center justify-center shadow-lg active:scale-95">
              <Zap size={16} />
              <span className="text-[9px]">COMBO</span>
            </button>

            {/* Jump Button */}
            <button
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mobileInputRef.current.jump = true; }}
              onPointerUp={() => { mobileInputRef.current.jump = false; }}
              onPointerCancel={() => { mobileInputRef.current.jump = false; }}
              className="w-14 h-14 bg-emerald-900/90 active:bg-emerald-600 text-emerald-100 border-2 border-emerald-500 rounded-xl font-black text-xs flex flex-col items-center justify-center shadow-lg active:scale-95">
              <span>▲</span>
              <span className="text-[9px]">JUMP</span>
            </button>
          </div>
        </div>
      )}

      {/* START SCREEN OVERLAY */}
      {gameState.status === 'START' && (
        <MenuOverlay tone="neutral" zIndex={40}>
          <div className="w-full max-w-md bg-stone-900 border-2 border-amber-600/80 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center backdrop-blur-md">
            <div className="w-16 h-16 bg-amber-600/20 rounded-full border-2 border-amber-500 flex items-center justify-center mb-4 text-amber-400">
              <Shield size={32} />
            </div>

            <h1 className="text-3xl md:text-4xl font-black mb-2 text-amber-400 tracking-wider">
              SHADOWBLADE VALORIA
            </h1>

            <p className="text-stone-300 text-sm md:text-base mb-6 leading-relaxed">
              Master fluid parkour acrobatic grappling, 3-hit combo strikes, perfect parry staggers, silent stealth assassinations, and conquer Level 1 Rooftops & Level 2 Moonlit Fortress!
            </p>

            <div className="w-full space-y-3">
              <button
                ref={startButtonRef}
                autoFocus
                onClick={() => initGame(1)}
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 px-6 py-3.5 rounded-xl font-black text-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2">
                <Play size={22} className="fill-stone-950" />
                START CAMPAIGN
              </button>

              <button
                onClick={() => setIsLevelSelectOpen(true)}
                className="w-full bg-stone-800 hover:bg-stone-700 text-amber-300 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors border border-amber-700/50 flex items-center justify-center gap-2">
                <Compass size={18} />
                LEVEL SELECT
              </button>

              <button
                onClick={() => setIsHowToPlayOpen(true)}
                className="w-full bg-stone-800 hover:bg-stone-700 text-amber-300 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors border border-amber-700/50 flex items-center justify-center gap-2">
                <HelpCircle size={18} />
                HOW TO PLAY
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* LEVEL SELECT OVERLAY */}
      {isLevelSelectOpen && (
        <MenuOverlay tone="neutral" zIndex={55}>
          <div className="w-full max-w-lg bg-stone-900 border-2 border-amber-600 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="flex justify-between items-center w-full mb-6 pb-3 border-b border-amber-800">
              <h2 className="text-2xl font-black text-amber-400 tracking-wider">SELECT MISSION</h2>
              <button
                onClick={() => setIsLevelSelectOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="w-full space-y-4 mb-6">
              {/* Level 1 Card */}
              <button
                onClick={() => initGame(1)}
                className="w-full p-4 bg-gradient-to-r from-stone-950 to-amber-950/70 border-2 border-amber-700 hover:border-amber-400 rounded-xl text-left transition-all group flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-amber-400 tracking-widest uppercase mb-1 flex items-center gap-1.5">
                    <Sun size={14} /> LEVEL 1
                  </div>
                  <div className="text-lg font-black text-white group-hover:text-amber-200">The Valoria Rooftops</div>
                  <div className="text-xs text-stone-400 mt-1">Sunset rooftops, sentry patrols, Captain Malakor duel</div>
                </div>
                <Play size={24} className="text-amber-400 group-hover:scale-110 transition-transform" />
              </button>

              {/* Level 2 Card */}
              <button
                onClick={() => initGame(2)}
                className="w-full p-4 bg-gradient-to-r from-stone-950 to-indigo-950/80 border-2 border-indigo-700 hover:border-indigo-400 rounded-xl text-left transition-all group flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-indigo-400 tracking-widest uppercase mb-1 flex items-center gap-1.5">
                    <Moon size={14} /> LEVEL 2 (NEW)
                  </div>
                  <div className="text-lg font-black text-white group-hover:text-indigo-200">The Moonlit Fortress</div>
                  <div className="text-xs text-stone-400 mt-1">Rope acrobatics, dark shadow niches, Lord Vane boss</div>
                </div>
                <Play size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <button
              onClick={() => setIsLevelSelectOpen(false)}
              className="w-full bg-stone-800 hover:bg-stone-700 text-stone-300 py-2.5 rounded-xl font-bold text-sm">
              BACK
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* IN-GAME PAUSE / GAME MENU OVERLAY */}
      {isGameMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={50}>
          <div className="w-full max-w-md bg-stone-900 border-2 border-amber-600 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="flex justify-between items-center w-full mb-6 pb-3 border-b border-amber-800">
              <h2 className="text-2xl font-black text-amber-400 tracking-wider">GAME MENU</h2>
              <button
                onClick={() => setIsGameMenuOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded">
                <X size={20} />
              </button>
            </div>

            {/* Audio Controls */}
            <div className="w-full bg-stone-950/60 rounded-xl p-4 mb-6 border border-amber-900/60 flex justify-around">
              <button
                onClick={() => {
                  const muted = gameAudio.toggleMute();
                  setIsSfxMuted(muted);
                }}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border font-bold text-xs transition-colors ${
                  isSfxMuted ? 'bg-red-950/80 border-red-700 text-red-300' : 'bg-stone-800 border-amber-600 text-amber-300'
                }`}>
                {isSfxMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                <span>SFX: {isSfxMuted ? 'OFF' : 'ON'}</span>
              </button>

              <button
                onClick={() => setIsMusicMuted((prev) => !prev)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border font-bold text-xs transition-colors ${
                  isMusicMuted ? 'bg-red-950/80 border-red-700 text-red-300' : 'bg-stone-800 border-amber-600 text-amber-300'
                }`}>
                {isMusicMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                <span>MUSIC: {isMusicMuted ? 'OFF' : 'ON'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3">
              <button
                onClick={() => setIsGameMenuOpen(false)}
                className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 py-3 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2">
                <Play size={18} />
                RESUME MISSION
              </button>

              <button
                onClick={() => {
                  setIsGameMenuOpen(false);
                  setIsLevelSelectOpen(true);
                }}
                className="w-full bg-stone-800 hover:bg-stone-700 text-amber-300 py-2.5 rounded-xl font-bold text-sm border border-amber-700/60 flex items-center justify-center gap-2">
                <Compass size={16} />
                LEVEL SELECT
              </button>

              <button
                onClick={() => setIsHowToPlayOpen(true)}
                className="w-full bg-stone-800 hover:bg-stone-700 text-amber-300 py-2.5 rounded-xl font-bold text-sm border border-amber-700/60 flex items-center justify-center gap-2">
                <HelpCircle size={16} />
                HOW TO PLAY
              </button>

              <button
                onClick={() => initGame(currentLevel)}
                className="w-full bg-stone-800 hover:bg-stone-700 text-amber-300 py-2.5 rounded-xl font-bold text-sm border border-amber-700/60 flex items-center justify-center gap-2">
                <RotateCw size={16} />
                RETRY CURRENT LEVEL
              </button>

              <button
                onClick={() => {
                  setIsGameMenuOpen(false);
                  setGameState((st) => ({ ...st, status: 'START' }));
                }}
                className="w-full bg-red-950/80 hover:bg-red-900 text-red-200 py-2.5 rounded-xl font-bold text-sm border border-red-800">
                QUIT TO MAIN MENU
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* HOW TO PLAY OVERLAY GUIDE */}
      {isHowToPlayOpen && (
        <MenuOverlay tone="neutral" zIndex={60}>
          <div className="w-full max-w-lg bg-stone-900 border-2 border-amber-600 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col text-left">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-amber-800">
              <h2 className="text-2xl font-black text-amber-400">MISSION MANUAL</h2>
              <button
                onClick={() => setIsHowToPlayOpen(false)}
                className="p-1 text-stone-400 hover:text-white rounded">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-stone-300 leading-relaxed overflow-y-auto max-h-[60vh] pr-2">
              <div>
                <h3 className="font-bold text-amber-300 text-sm mb-1">🏰 LEVEL 2: THE MOONLIT FORTRESS</h3>
                <p>Navigate fortress parapets, high spire rafters, and vaulted chambers. Defeat the Shielded Sentinels and face <b className="text-purple-300">Lord Vane, Commander of the Eclipse</b>.</p>
              </div>

              <div>
                <h3 className="font-bold text-amber-300 text-sm mb-1">🪝 ROPE SWINGING & ACROBATICS</h3>
                <p>Jump near golden anchor points and press <b className="text-cyan-300">F / Q / Jump</b> to attach a grappling rope. Pump momentum with A/D and release with Jump to soar across chasms!</p>
              </div>

              <div>
                <h3 className="font-bold text-amber-300 text-sm mb-1">🌑 ENVIRONMENTAL STEALTH</h3>
                <ul className="list-disc list-inside space-y-1 text-stone-300">
                  <li><b className="text-indigo-300">Shadow Niches:</b> Gothic dark alcoves where you are completely concealed even while standing!</li>
                  <li><b className="text-yellow-400">Hanging Lanterns:</b> Strike hanging lanterns to extinguish them and plunge enemy sentries into darkness!</li>
                  <li><b className="text-cyan-300">Moonlight Shrines:</b> Walk past raven shrines to save your checkpoint and restore 1 HP.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-amber-300 text-sm mb-1">⚔️ COMBAT & COMBOS</h3>
                <ul className="list-disc list-inside space-y-1 text-stone-300">
                  <li><b className="text-amber-200">J / Z / Slash Button:</b> 3-Hit Sword Attack Combo (Quick Slash → Reverse Slash → Finishing Heavy Slash).</li>
                  <li><b className="text-amber-200">K / X / Block Button:</b> Guard / Deflection. Time block right as enemy strikes for a <b className="text-cyan-300">PERFECT PARRY</b>!</li>
                  <li><b className="text-amber-200">E / C / Kill Button:</b> Silent Stealth Assassination behind unaware guards (+500 score).</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setIsHowToPlayOpen(false)}
              className="mt-6 w-full bg-amber-600 hover:bg-amber-500 text-stone-950 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              BACK TO GAME
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* GAME OVER SCREEN */}
      {gameState.status === 'GAME_OVER' && (
        <Overlay
          title="FALLEN IN SHADOW"
          description={`Overwhelmed in Level ${currentLevel}. Final Score: ${gameState.score}`}
          actionLabel="TRY LEVEL AGAIN"
          onAction={() => initGame(currentLevel)}
          icon={<RotateCw size={22} />}
          tone="danger"
        />
      )}

      {/* VICTORY & SUMMARY SCREEN */}
      {gameState.status === 'VICTORY' && (
        <MenuOverlay tone="victory" zIndex={60}>
          <div className="w-full max-w-md bg-stone-900 border-2 border-emerald-500 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-600/20 rounded-full border-2 border-emerald-400 flex items-center justify-center mb-3 text-emerald-300">
              <Award size={36} />
            </div>

            <h1 className="text-3xl font-black text-emerald-400 tracking-wider mb-1">
              FORTRESS CONQUERED!
            </h1>
            <p className="text-xs text-stone-300 mb-5">
              Lord Vane and Captain Malakor have been vanquished. Valoria is liberated!
            </p>

            {/* Mission Stats Breakdown */}
            <div className="w-full bg-stone-950/80 rounded-xl p-4 mb-6 border border-emerald-900/60 space-y-2 text-xs">
              <div className="flex justify-between text-stone-300">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-amber-400" /> Mission Time:</span>
                <span className="font-bold text-white">{formatTime(stats.timeSeconds)}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span className="flex items-center gap-1.5"><EyeOff size={14} className="text-emerald-400" /> Stealth Assassinations:</span>
                <span className="font-bold text-white">{stats.stealthKills}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span className="flex items-center gap-1.5"><Flame size={14} className="text-red-400" /> Alarms Triggered:</span>
                <span className="font-bold text-white">{stats.alarmsTriggered}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span className="flex items-center gap-1.5"><Trophy size={14} className="text-yellow-400" /> Relics Recovered:</span>
                <span className="font-bold text-white">{stats.relicsFound}/{totalRelics}</span>
              </div>
              <div className="border-t border-emerald-900/60 pt-2 flex justify-between text-sm font-black text-yellow-400">
                <span>TOTAL SCORE:</span>
                <span>{gameState.score}</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={() => initGame(1)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-stone-950 py-3 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2">
                <RotateCw size={18} />
                PLAY CAMPAIGN AGAIN
              </button>

              <button
                onClick={() => {
                  setGameState((st) => ({ ...st, status: 'START' }));
                }}
                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-300 py-2.5 rounded-xl font-bold text-sm">
                MAIN MENU
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}
    </div>
  );
}
