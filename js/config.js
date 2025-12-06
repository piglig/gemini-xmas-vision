export const CDN_SOURCES = {
    CN: {
        three: "https://cdn.bootcdn.net/ajax/libs/three.js/r128/three.min.js",
        mediapipe: {
            camera: "https://npm.elemecdn.com/@mediapipe/camera_utils/camera_utils.js",
            control: "https://npm.elemecdn.com/@mediapipe/control_utils/control_utils.js",
            drawing: "https://npm.elemecdn.com/@mediapipe/drawing_utils/drawing_utils.js",
            hands: "https://npm.elemecdn.com/@mediapipe/hands/hands.js",
            assets: "https://npm.elemecdn.com/@mediapipe/hands/"
        }
    },
    GLOBAL: {
        three: "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
        mediapipe: {
            camera: "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
            control: "https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js",
            drawing: "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
            hands: "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
            assets: "https://cdn.jsdelivr.net/npm/@mediapipe/hands/"
        }
    },
    LOCAL: {
        three: "libs/three/three.min.js",
        mediapipe: {
            camera: "libs/mediapipe/camera_utils.js",
            control: "libs/mediapipe/control_utils.js",
            drawing: "libs/mediapipe/drawing_utils.js",
            hands: "libs/mediapipe/hands.js",
            assets: "libs/mediapipe/"
        }
    }
};

export const CONFIG = {
    colors: {
        darkGreen: 0x0D5C0D,
        green: 0x228B22,
        lightGreen: 0x32CD32,
        gold: 0xFFD700,
        warmWhite: 0xFFFDD0,
        red: 0xFF4444,
        blue: 0x4488FF,
        silver: 0xC0C0C0,
        darkGold: 0xB8860B,
        brown: 0x8B4513,
        starYellow: 0xFFFF00
    },
    treeHeight: 20,
    treeRadius: 8,
    particleCount: 5500,
    ornamentCount: 18,
    lightCount: 60,
    snowflakeCount: 800
};

export const BLESSINGS = [
    "Merry Christmas!",
    "圣诞快乐!",
    "Happy Holidays!",
    "新年快乐!",
    "Peace & Joy"
];
