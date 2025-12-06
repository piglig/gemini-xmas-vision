import { state, STATE_ENUM } from './state.js';
import { BLESSINGS } from './config.js';
import { camera, scene, spiralPhotoObjects } from './scene.js';

// DOM Elements
const statusEl = document.getElementById('status-text');
const instructionEl = document.getElementById('instruction-text');
const iconEl = document.getElementById('gesture-icon');
const overlayEl = document.getElementById('overlay-image-container');
const debugEl = document.getElementById('debug-log');
const loadingEl = document.getElementById('loading');
const handCursor = document.getElementById('hand-cursor');
const dotHand = document.getElementById('dot-hand');
const dotMove = document.getElementById('dot-move');
const dotClosed = document.getElementById('dot-closed');
const blessingContainer = document.getElementById('blessing-container');
const blessingTextEl = document.getElementById('blessing-text');
const musicBtn = document.getElementById('music-btn');
const musicHint = document.getElementById('music-hint');
const overlayImage = document.getElementById('overlay-image');

let blessingIndex = 0;
let bgMusic = null;
let isMusicPlaying = false;

function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function detectWave(currentX) {
    const now = Date.now();
    state.waveHistory.push({ x: currentX, time: now });

    // Keep last 500ms
    state.waveHistory = state.waveHistory.filter(p => now - p.time < 500);

    if (state.waveHistory.length >= 4) {
        let directionChanges = 0;
        let lastDirection = 0;

        for (let i = 1; i < state.waveHistory.length; i++) {
            const diff = state.waveHistory[i].x - state.waveHistory[i-1].x;
            const currentDirection = diff > 0.01 ? 1 : (diff < -0.01 ? -1 : 0);

            if (currentDirection !== 0 && currentDirection !== lastDirection && lastDirection !== 0) {
                directionChanges++;
            }
            if (currentDirection !== 0) lastDirection = currentDirection;
        }

        if (directionChanges >= 2 && now - state.lastWaveTime > 2000) {
            state.lastWaveTime = now;
            return true;
        }
    }
    return false;
}

function triggerBlessing() {
    blessingTextEl.textContent = BLESSINGS[blessingIndex];
    blessingIndex = (blessingIndex + 1) % BLESSINGS.length;

    blessingContainer.classList.add('active');
    blessingTextEl.style.animation = 'none';
    blessingTextEl.offsetHeight; 
    blessingTextEl.style.animation = 'blessingPulse 2s ease-in-out';

    setTimeout(() => {
        blessingContainer.classList.remove('active');
    }, 2000);
}

function updateGestureIndicators() {
    dotHand.classList.toggle('active', state.handVisible);
    dotMove.classList.toggle('active', state.handVisible && (Math.abs(state.swipeDeltaX) > 0.01 || Math.abs(state.swipeDeltaY) > 0.01));
    dotClosed.classList.toggle('active', state.isPinching);
}

function updateHandCursor(landmarks) {
    if (!landmarks) {
        handCursor.classList.remove('visible');
        return;
    }

    const palmCenter = landmarks[9]; 
    const screenX = (1 - palmCenter.x) * window.innerWidth;
    const screenY = palmCenter.y * window.innerHeight;

    handCursor.style.left = (screenX - 15) + 'px';
    handCursor.style.top = (screenY - 15) + 'px';
    handCursor.classList.add('visible');

    handCursor.classList.toggle('pinching', state.isPinching);
}

function updateAppLogic() {
    // Priority 1: Pinch
    if (state.isPinching) {
        if (!state.wasPinching) {
            // Raycasting to select photo
            const raycaster = new THREE.Raycaster();
            const pointer = new THREE.Vector2();
            
            pointer.x = (state.handX * 2) - 1;
            pointer.y = -(state.handY * 2) + 1;

            raycaster.setFromCamera(pointer, camera);
            
            const intersects = raycaster.intersectObjects(spiralPhotoObjects, true);
            let selectedIndex = -1;

            if (intersects.length > 0) {
                let target = intersects[0].object;
                while (target && target !== scene && target.userData.photoIndex === undefined) {
                    target = target.parent;
                }
                
                if (target && target.userData.photoIndex !== undefined) {
                    selectedIndex = target.userData.photoIndex;
                    statusEl.innerText = "选中照片 (" + (selectedIndex + 1) + "/" + state.photos.length + ")";
                }
            }

            if (selectedIndex !== -1) {
                state.currentPhotoIndex = selectedIndex;
            } else {
                // Fallback: closest photo
                let minDistance = Infinity;
                let closestIndex = 0;
                const cameraPos = camera.position;
                const worldPos = new THREE.Vector3();

                spiralPhotoObjects.forEach(group => {
                    group.getWorldPosition(worldPos);
                    const dist = worldPos.distanceTo(cameraPos);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestIndex = group.userData.photoIndex;
                    }
                });

                state.currentPhotoIndex = closestIndex;
                statusEl.innerText = "最近照片 (" + (state.currentPhotoIndex + 1) + "/" + state.photos.length + ")";
            }
            
            // Adjust overlay aspect ratio
            const targetObj = spiralPhotoObjects.find(o => o.userData.photoIndex === state.currentPhotoIndex);
            if (targetObj && targetObj.userData.aspectRatio) {
                const aspect = targetObj.userData.aspectRatio;
                overlayEl.style.aspectRatio = aspect;
                if (aspect >= 1) {
                    overlayEl.style.width = '80%';
                    overlayEl.style.height = 'auto';
                    overlayEl.style.maxWidth = '600px';
                } else {
                    overlayEl.style.width = 'auto';
                    overlayEl.style.height = '70%';
                    overlayEl.style.maxWidth = 'none';
                }
            } else {
                overlayEl.style.aspectRatio = '16/9';
                overlayEl.style.width = '80%';
                overlayEl.style.height = 'auto';
            }

            overlayImage.src = state.photos[state.currentPhotoIndex];
        }
        state.current = STATE_ENUM.CLOSED;
        instructionEl.innerText = "松开后旋转选择其他图片";
        iconEl.innerText = "👌";
        overlayEl.classList.add('active');
        state.targetSnowSpeed = 0.3; 
    }
    // Priority 2: Hand Visible
    else if (state.handVisible) {
        state.current = STATE_ENUM.INTERACTIVE;
        statusEl.innerText = "交互模式";
        instructionEl.innerText = "移动控制视角 | 捏合展示图片 | 挥手送祝福";
        iconEl.innerText = "🖐️";
        overlayEl.classList.remove('active');
        state.targetSnowSpeed = 1;
    }

    state.wasPinching = state.isPinching;

    // Hand movement controls
    if (state.current === STATE_ENUM.INTERACTIVE) {
        if (Math.abs(state.swipeDeltaX) > 0.008) {
            state.targetGroupRotation += state.swipeDeltaX * 2.5;
        }
        if (Math.abs(state.swipeDeltaY) > 0.008) {
            state.targetCameraZ += state.swipeDeltaY * 15;
            state.targetCameraZ = Math.max(15, Math.min(50, state.targetCameraZ));

            state.targetCameraY -= state.swipeDeltaY * 5;
            state.targetCameraY = Math.max(5, Math.min(15, state.targetCameraY));
        }
    }
}

function onResults(results) {
    loadingEl.style.display = 'none';

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        state.handVisible = true;
        const landmarks = results.multiHandLandmarks[0];

        updateHandCursor(landmarks);

        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

        // Pinch detection
        const thumbIndexDist = calculateDistance(thumbTip, indexTip);
        state.isPinching = thumbIndexDist < 0.06;

        // Open Hand detection
        const avgTipToWrist = (
            calculateDistance(indexTip, wrist) +
            calculateDistance(middleTip, wrist) +
            calculateDistance(ringTip, wrist) +
            calculateDistance(pinkyTip, wrist)
        ) / 4;
        state.isHandOpen = avgTipToWrist > 0.2 && !state.isPinching;

        // Movement detection
        const palmCenter = landmarks[9];
        const currentX = 1 - palmCenter.x;
        const currentY = palmCenter.y;

        state.swipeDeltaX = (currentX - state.prevHandX) * 5;
        state.swipeDeltaY = (currentY - state.prevHandY) * 5;

        // Wave detection
        if (state.isHandOpen && detectWave(currentX)) {
            state.isWaving = true;
            triggerBlessing();
        }

        state.prevHandX = currentX;
        state.prevHandY = currentY;
        state.handX = currentX;
        state.handY = currentY;

        updateAppLogic();
        updateGestureIndicators();
        
        if(debugEl) debugEl.innerText = `捏合: ${state.isPinching ? '是' : '否'} | 张开: ${state.isHandOpen ? '是' : '否'}`;
    } else {
        state.handVisible = false;
        state.swipeDeltaX = 0;
        state.swipeDeltaY = 0;

        handCursor.classList.remove('visible');
        updateGestureIndicators();

        if (state.current !== STATE_ENUM.IDLE) {
            state.current = STATE_ENUM.IDLE;
            statusEl.innerText = "状态: 等待手势";
            instructionEl.innerText = "举起手开始交互";
            iconEl.innerText = "✋";
            overlayEl.classList.remove('active');
            state.targetSnowSpeed = 1;
        }
        if(debugEl) debugEl.innerText = "未检测到手部";
    }
}

export async function initHandTracking() {
    const videoElement = document.getElementById('input-video');
    
    const hands = new Hands({locateFile: (file) => {
        return `${state.mpAssetBase}${file}`;
    }});

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    const cameraUtils = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({image: videoElement});
        },
        width: 640,
        height: 480
    });

    try {
        await cameraUtils.start();
        console.log("Camera started");
    } catch (e) {
        console.error(e);
        loadingEl.innerHTML = "摄像头启动失败<br>请检查权限或使用 HTTPS";
        throw e;
    }
}

// Music Logic
export function initMusic() {
    function initAudio() {
        if (bgMusic) return;

        bgMusic = new Audio('Christmas_eve.mp3');
        bgMusic.volume = 0.5;
        bgMusic.loop = true;

        bgMusic.addEventListener('error', (e) => {
            console.error('音乐加载失败:', e);
            musicHint.textContent = '音乐加载失败';
            musicHint.classList.add('show');
        });

        bgMusic.addEventListener('canplay', () => {
            if (isMusicPlaying) {
                musicHint.textContent = '正在播放: Christmas Eve';
                musicHint.classList.add('show');
                setTimeout(() => musicHint.classList.remove('show'), 3000);
            }
        });
    }

    function startMusic() {
        if (isMusicPlaying) return;
        initAudio();

        bgMusic.play().then(() => {
            isMusicPlaying = true;
            musicBtn.textContent = '🔊';
            musicBtn.classList.add('playing');
            musicHint.textContent = '正在播放: Christmas Eve';
            musicHint.classList.add('show');
            setTimeout(() => musicHint.classList.remove('show'), 3000);
        }).catch(e => {
            console.log('需要用户交互才能播放:', e);
            musicHint.textContent = '点击按钮播放音乐';
            musicHint.classList.add('show');
        });
    }

    function stopMusic() {
        if (!bgMusic) return;
        bgMusic.pause();
        isMusicPlaying = false;
        musicBtn.textContent = '🔇';
        musicBtn.classList.remove('playing');
        musicHint.textContent = '点击播放圣诞音乐';
    }

    musicBtn.addEventListener('click', () => {
        if (isMusicPlaying) stopMusic();
        else startMusic();
    });

    // Auto-play attempt
    let hasAutoPlayed = false;
    function tryAutoPlayMusic() {
        if (hasAutoPlayed) return;
        hasAutoPlayed = true;
        startMusic();
        document.removeEventListener('click', tryAutoPlayMusic);
        document.removeEventListener('touchstart', tryAutoPlayMusic);
    }

    document.addEventListener('click', tryAutoPlayMusic);
    document.addEventListener('touchstart', tryAutoPlayMusic);
}
