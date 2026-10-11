export const CONFIG = {
  // Game & Display
  title: {
    value: 'Shadowblade Valoria',
    type: 'string',
    label: 'Game Title',
    group: 'GAME',
  },
  baseCanvasWidth: {
    value: 1280,
    type: 'number',
    label: 'Base Canvas Width',
    group: 'GAME',
  },
  baseCanvasHeight: {
    value: 720,
    type: 'number',
    label: 'Base Canvas Height',
    group: 'GAME',
  },

  // System
  targetFPS: {
    value: 60,
    type: 'number',
    label: 'Target FPS',
    group: 'SYSTEM',
  },
  stepMs: {
    value: 1000 / 60,
    type: 'number',
    label: 'Step MS',
    group: 'SYSTEM',
  },
  maxSubSteps: {
    value: 5,
    type: 'number',
    label: 'Max Sub Steps',
    group: 'SYSTEM',
  },

  // Thematic Styling
  backgroundColor: {
    value: '#1e1022',
    type: 'color',
    label: 'Background Color',
    group: 'THEME',
  },
  primaryColor: {
    value: '#f59e0b',
    type: 'color',
    label: 'Primary Accent Color',
    group: 'THEME',
  },
  fontFamily: {
    value: '"Cinzel", "Trajan Pro", "MedievalSharp", Georgia, serif',
    type: 'string',
    label: 'Font Family',
    group: 'THEME',
  },

  // Audio Levels
  defaultMusicVolume: {
    value: 0.5,
    type: 'number',
    label: 'Default Music Volume',
    group: 'AUDIO',
  },
  defaultSfxVolume: {
    value: 0.6,
    type: 'number',
    label: 'Default SFX Volume',
    group: 'AUDIO',
  },

  // Gameplay & Physics Rules (Exposed in Playground)
  playerMaxHealth: {
    value: 5,
    type: 'number',
    label: 'Player Max Health',
    group: 'Rules',
  },
  playerRunSpeed: {
    value: 5.8,
    type: 'number',
    label: 'Player Run Speed',
    group: 'Physics',
  },
  playerJumpForce: {
    value: -14.2,
    type: 'number',
    label: 'Player Jump Force',
    group: 'Physics',
  },
  gravityRising: {
    value: 0.62,
    type: 'number',
    label: 'Gravity Rising',
    group: 'Physics',
  },
  gravityFalling: {
    value: 1.05,
    type: 'number',
    label: 'Gravity Falling',
    group: 'Physics',
  },
  guardSightRange: {
    value: 280,
    type: 'number',
    label: 'Guard Sight Range',
    group: 'Rules',
  },
  bossHealth: {
    value: 8,
    type: 'number',
    label: 'Boss Max Health',
    group: 'Rules',
  },
  lordVaneHealth: {
    value: 14,
    type: 'number',
    label: 'Lord Vane Max Health',
    group: 'Rules',
  },
  stealthBonusScore: {
    value: 500,
    type: 'number',
    label: 'Stealth Takedown Score',
    group: 'Rules',
  },

  // Additional physics parameters
  groundAccel: {
    value: 1.1,
    type: 'number',
    label: 'Ground Acceleration',
    group: 'Physics',
  },
  groundDecel: {
    value: 0.78,
    type: 'number',
    label: 'Ground Friction',
    group: 'Physics',
  },
  airAccel: {
    value: 0.65,
    type: 'number',
    label: 'Air Acceleration',
    group: 'Physics',
  },
  airDecel: {
    value: 0.94,
    type: 'number',
    label: 'Air Friction',
    group: 'Physics',
  },
  apexThreshold: {
    value: 2.2,
    type: 'number',
    label: 'Apex Float Threshold',
    group: 'Physics',
  },
  gravityApex: {
    value: 0.28,
    type: 'number',
    label: 'Apex Gravity',
    group: 'Physics',
  },
  climbSpeed: {
    value: 4.2,
    type: 'number',
    label: 'Ladder Climb Speed',
    group: 'Physics',
  },
  slideSpeed: {
    value: 8.5,
    type: 'number',
    label: 'Dodge Slide Speed',
    group: 'Physics',
  },
  wallSlideSpeed: {
    value: 2.6,
    type: 'number',
    label: 'Wall Slide Speed',
    group: 'Physics',
  },

  // Asset Aspect Ratios & Standard Display Dimensions (Derived from read_assets_metadata)
  assetBgSunsetAspectRatio: {
    value: 1376 / 768, // 1.7916
    type: 'number',
    label: 'Sunset Background Aspect Ratio',
    group: 'ASSETS',
  },
  assetBgCastleAspectRatio: {
    value: 1376 / 768, // 1.7916
    type: 'number',
    label: 'Castle Background Aspect Ratio',
    group: 'ASSETS',
  },
  assetSandstoneTilesAspectRatio: {
    value: 638 / 618, // 1.032
    type: 'number',
    label: 'Sandstone Tiles Aspect Ratio',
    group: 'ASSETS',
  },
  assetWoodenBeamAspectRatio: {
    value: 978 / 230, // 4.252
    type: 'number',
    label: 'Wooden Beam Aspect Ratio',
    group: 'ASSETS',
  },
  assetStealthCratesAspectRatio: {
    value: 700 / 619, // 1.1308
    type: 'number',
    label: 'Stealth Crates Aspect Ratio',
    group: 'ASSETS',
  },
  assetIvyLadderAspectRatio: {
    value: 282 / 884, // 0.3190
    type: 'number',
    label: 'Ivy Ladder Aspect Ratio',
    group: 'ASSETS',
  },
  assetPortcullisAspectRatio: {
    value: 742 / 758, // 0.9788
    type: 'number',
    label: 'Portcullis Gate Aspect Ratio',
    group: 'ASSETS',
  },
  assetRelicAspectRatio: {
    value: 558 / 683, // 0.8169
    type: 'number',
    label: 'Ancient Relic Aspect Ratio',
    group: 'ASSETS',
  },
  assetPotionAspectRatio: {
    value: 535 / 700, // 0.7642
    type: 'number',
    label: 'Health Potion Aspect Ratio',
    group: 'ASSETS',
  },
  assetHeartIconAspectRatio: {
    value: 556 / 545, // 1.0201
    type: 'number',
    label: 'Heart Icon Aspect Ratio',
    group: 'ASSETS',
  },
  assetAlertIconAspectRatio: {
    value: 567 / 618, // 0.9174
    type: 'number',
    label: 'Alert Icon Aspect Ratio',
    group: 'ASSETS',
  },
};

// Merge customized config values if present (injected by Playground)
const { playgroundConfig } = globalThis as {
  playgroundConfig?: Record<string, unknown>;
};
if (playgroundConfig) {
  for (const [key, value] of Object.entries(playgroundConfig)) {
    if (key in CONFIG) {
      Object.assign(CONFIG[key as keyof typeof CONFIG], { value });
    }
  }
}

/** Type helper for reading values in game code */
export type ConfigKey = keyof typeof CONFIG;

/**
 * Gets a configuration value by key.
 * @param key The configuration key.
 * @return The configuration value.
 */
export function getConfig<K extends ConfigKey>(
  key: K,
): (typeof CONFIG)[K]['value'] {
  return CONFIG[key].value;
}
