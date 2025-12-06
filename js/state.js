export const STATE_ENUM = {
    IDLE: 'IDLE',
    INTERACTIVE: 'INTERACTIVE',
    CLOSED: 'CLOSED'
};

// Shared mutable state
export const state = {
    current: STATE_ENUM.IDLE,
    
    // Hand tracking data
    handVisible: false,
    isHandOpen: false,
    isPinching: false,
    handX: 0.5,
    handY: 0.5,
    prevHandX: 0.5,
    prevHandY: 0.5,
    swipeDeltaX: 0,
    swipeDeltaY: 0,
    
    // Wave detection
    waveHistory: [],
    lastWaveTime: 0,
    isWaving: false,
    
    // App logic
    currentPhotoIndex: 0,
    wasPinching: false,
    
    // Animation targets (updated by interaction, consumed by scene)
    targetSnowSpeed: 1,
    targetCameraZ: 35,
    targetCameraY: 10,
    targetGroupRotation: 0,
    
    // Global resources
    mpAssetBase: "",
    photos: [] 
};
