import { CONFIG } from './config.js';
import { state, STATE_ENUM } from './state.js';

// Exported Three.js objects for interaction
export let scene, camera, renderer;
export let spiralPhotoObjects = [];

// Internal variables
let treeParticles, starParticles, spiralGroup, particleSystem;
let ornamentParticles, lightString, giftBoxes = [];
let rotatingLight, clock;
let snowSpeedMultiplier = 1;

// Textures (helpers)
function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    const center = 16;
    const radius = 14;
    
    const gradient = context.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,215,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    const center = 32;
    const radius = 30;

    const gradient = context.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,200,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,200,100,0.4)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createSnowflakeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    const center = 16;
    const radius = 14;

    const gradient = context.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(230,240,255,0.8)');
    gradient.addColorStop(0.6, 'rgba(200,220,255,0.4)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Creation Functions
function createParticleTree() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const colorObj = new THREE.Color();

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const heightRatio = Math.pow(Math.random(), 1.5);
        const y = heightRatio * CONFIG.treeHeight;
        const baseRadius = CONFIG.treeRadius * (1 - heightRatio * 0.95);
        const layerEffect = Math.sin(heightRatio * Math.PI * 8) * 0.3 + 1;
        const radius = baseRadius * layerEffect * (0.3 + Math.random() * 0.7);
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        positions.push(x, y, z);

        const rand = Math.random();
        if (rand > 0.90) {
            const lightColors = [CONFIG.colors.gold, CONFIG.colors.warmWhite, CONFIG.colors.red, CONFIG.colors.blue];
            colorObj.setHex(lightColors[Math.floor(Math.random() * lightColors.length)]);
            sizes.push(0.5 + Math.random() * 0.3);
        } else {
            const greenColors = [CONFIG.colors.darkGreen, CONFIG.colors.green, CONFIG.colors.lightGreen];
            const greenIndex = Math.floor(Math.random() * greenColors.length);
            colorObj.setHex(greenColors[greenIndex]);
            sizes.push(0.2 + Math.random() * 0.15);
        }

        colors.push(colorObj.r, colorObj.g, colorObj.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.35,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        map: createCircleTexture()
    });

    treeParticles = new THREE.Points(geometry, material);
    const treeGroup = new THREE.Group();
    treeGroup.add(treeParticles);
    scene.add(treeGroup);
    scene.userData.treeGroup = treeGroup;
}

function createTreeTrunk() {
    const treeGroup = scene.userData.treeGroup;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const colorObj = new THREE.Color();
    const trunkCount = 2000;

    for (let i = 0; i < trunkCount; i++) {
        const h = Math.random() * 6; 
        const y = -h * 0.8; 
        const spread = Math.pow(h / 6, 2) * 4; 
        const radius = 0.8 + spread + Math.random() * 0.4;
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        positions.push(x, y, z);

        if (Math.random() > 0.85) {
            colorObj.setHex(CONFIG.colors.gold);
            sizes.push(0.4 + Math.random() * 0.2);
        } else {
            colorObj.setHex(0x5C4033);
            colorObj.r *= (0.8 + Math.random() * 0.4);
            colorObj.g *= (0.8 + Math.random() * 0.4);
            colorObj.b *= (0.8 + Math.random() * 0.4);
            sizes.push(0.25 + Math.random() * 0.15);
        }
        
        colors.push(colorObj.r, colorObj.g, colorObj.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.8,
        map: createCircleTexture()
    });

    const trunkParticles = new THREE.Points(geometry, material);
    treeGroup.add(trunkParticles);
}

function createStar() {
    const treeGroup = scene.userData.treeGroup;
    const starParticleCount = 400;
    const starBaseRadius = 2.0;
    const starCenterY = CONFIG.treeHeight + 0.5;

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const colorObj = new THREE.Color();

    for (let i = 0; i < starParticleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        let radius = Math.random() * starBaseRadius;
        
        const numPoints = 5;
        const innerRadiusRatio = 0.4; 
        const segmentAngle = Math.PI * 2 / numPoints;
        const halfSegmentAngle = segmentAngle / 2;
        const angleInSegment = (angle % segmentAngle + segmentAngle) % segmentAngle; 
        let distanceFromSegmentCenter = Math.abs(angleInSegment - halfSegmentAngle);
        distanceFromSegmentCenter = distanceFromSegmentCenter / halfSegmentAngle;
        const currentStarRadius = THREE.MathUtils.lerp(starBaseRadius * innerRadiusRatio, starBaseRadius, 1 - distanceFromSegmentCenter);
        radius = Math.random() * currentStarRadius;

        const x = Math.cos(angle) * radius;
        const y_offset = Math.sin(angle) * radius; 
        const z_depth = (Math.random() - 0.5) * 0.8; 

        positions.push(x, starCenterY + y_offset, z_depth);

        if (Math.random() > 0.7) {
            colorObj.setHex(CONFIG.colors.gold);
        } else {
            colorObj.setHex(CONFIG.colors.starYellow);
        }
        colors.push(colorObj.r, colorObj.g, colorObj.b);
        sizes.push(0.5 + Math.random() * 0.8);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.userData.initialPositions = positions.slice();
    geometry.userData.initialSizes = sizes.slice();

    const material = new THREE.PointsMaterial({
        size: 0.5, 
        vertexColors: true,
        blending: THREE.AdditiveBlending, 
        depthWrite: false, 
        transparent: true,
        opacity: 0.9,
        map: createCircleTexture()
    });

    starParticles = new THREE.Points(geometry, material);
    treeGroup.add(starParticles);
}

function createOrnaments() {
    const treeGroup = scene.userData.treeGroup;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const phases = [];
    
    const ornamentColors = [CONFIG.colors.red, CONFIG.colors.gold, CONFIG.colors.blue, CONFIG.colors.silver];
    const colorObj = new THREE.Color();

    for (let i = 0; i < CONFIG.ornamentCount; i++) {
        const heightRatio = 0.1 + Math.random() * 0.75;
        const y = heightRatio * CONFIG.treeHeight;
        const maxRadius = CONFIG.treeRadius * (1 - heightRatio * 0.9) * 0.85;
        const angle = (i / CONFIG.ornamentCount) * Math.PI * 2 + Math.random() * 0.5;
        const radius = maxRadius * (0.7 + Math.random() * 0.3);

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        positions.push(x, y, z);

        const color = ornamentColors[i % ornamentColors.length];
        colorObj.setHex(color);
        colors.push(colorObj.r, colorObj.g, colorObj.b);

        sizes.push(1.5 + Math.random() * 1.0);
        phases.push(Math.random() * Math.PI * 2);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1));
    geometry.userData.originalPositions = positions.slice();

    const material = new THREE.PointsMaterial({
        size: 1.0,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
        map: createGlowTexture()
    });

    ornamentParticles = new THREE.Points(geometry, material);
    treeGroup.add(ornamentParticles);
}

function createLightString() {
    const treeGroup = scene.userData.treeGroup;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const lightColors = [CONFIG.colors.red, CONFIG.colors.gold, CONFIG.colors.blue, CONFIG.colors.warmWhite, CONFIG.colors.lightGreen];
    const colorObj = new THREE.Color();

    for (let i = 0; i < CONFIG.lightCount; i++) {
        const t = i / CONFIG.lightCount;
        const y = t * CONFIG.treeHeight * 0.9 + 1;
        const spiralAngle = t * Math.PI * 6; 
        const radius = CONFIG.treeRadius * (1 - t * 0.85) * 1.05;

        const x = Math.cos(spiralAngle) * radius;
        const z = Math.sin(spiralAngle) * radius;

        positions.push(x, y, z);
        colorObj.setHex(lightColors[i % lightColors.length]);
        colors.push(colorObj.r, colorObj.g, colorObj.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        map: createGlowTexture()
    });

    lightString = new THREE.Points(geometry, material);
    treeGroup.add(lightString);
}

function createGiftBoxes() {
    const treeGroup = scene.userData.treeGroup;
    const giftColors = [
        { box: 0xCC0000, ribbon: 0xFFD700 },
        { box: 0x0066CC, ribbon: 0xFFFFFF },
        { box: 0x228B22, ribbon: 0xFF4444 },
        { box: 0x9932CC, ribbon: 0xFFD700 },
        { box: 0xFFD700, ribbon: 0xCC0000 }
    ];

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + 0.3;
        const distance = 4 + Math.random() * 2;
        const size = 0.8 + Math.random() * 0.6;

        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        const boxGeometry = new THREE.BoxGeometry(size, size * 0.8, size);
        const boxMaterial = new THREE.MeshBasicMaterial({
            color: giftColors[i].box,
            transparent: true,
            opacity: 0.9
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(x, -2.6 + size * 0.4, z);
        box.rotation.y = Math.random() * 0.5;
        box.userData.originalY = box.position.y;
        box.userData.phase = Math.random() * Math.PI * 2;

        const ribbonH = new THREE.Mesh(
            new THREE.BoxGeometry(size * 1.1, size * 0.1, size * 0.15),
            new THREE.MeshBasicMaterial({ color: giftColors[i].ribbon })
        );
        ribbonH.position.y = size * 0.4;
        box.add(ribbonH);

        const ribbonV = new THREE.Mesh(
            new THREE.BoxGeometry(size * 0.15, size * 0.1, size * 1.1),
            new THREE.MeshBasicMaterial({ color: giftColors[i].ribbon })
        );
        ribbonV.position.y = size * 0.4;
        box.add(ribbonV);

        treeGroup.add(box);
        giftBoxes.push(box);
    }
}

function createSpiralPhotos() {
    scene.add(spiralGroup);
    spiralPhotoObjects = []; 

    const textureLoader = new THREE.TextureLoader();
    const photoCount = state.photos.length;
    const debugLog = document.getElementById('debug-log');
    if(debugLog) debugLog.innerHTML += '<br>Loading photos...';

    for (let i = 0; i < photoCount; i++) {
        const photoGroup = new THREE.Group(); 

        const geometry = new THREE.PlaneGeometry(4, 3);
        const texture = textureLoader.load(
            state.photos[i],
            (tex) => { 
                console.log('Texture loaded:', state.photos[i]); 
                if (tex.image) {
                    photoGroup.userData.aspectRatio = tex.image.width / tex.image.height;
                }
            },
            undefined,
            (err) => {
                console.error('Error loading texture:', state.photos[i], err);
                if(debugLog) debugLog.innerHTML += `<br>Err: ${state.photos[i]}`;
            }
        );
        texture.minFilter = THREE.LinearFilter;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.FrontSide,
            transparent: true,
            opacity: 0.9,
            color: 0xffffff
        });
        const plane = new THREE.Mesh(geometry, material);
        photoGroup.add(plane);

        const backGeometry = new THREE.PlaneGeometry(4, 3);
        const backMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.FrontSide,
            transparent: true,
            opacity: 0.9,
            color: 0xffffff
        });
        const backPlane = new THREE.Mesh(backGeometry, backMaterial);
        backPlane.rotation.y = Math.PI; 
        backPlane.scale.x = -1;         
        backPlane.position.z = -0.03;   
        photoGroup.add(backPlane);

        const frameGeometry = new THREE.PlaneGeometry(4.2, 3.2);
        const frameMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.gold,
            side: THREE.DoubleSide
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = -0.01; 
        photoGroup.add(frame);

        const t = i / photoCount;
        const angle = t * Math.PI * 2.5; 
        const radius = CONFIG.treeRadius + 3 + (1-t) * 2;
        const y = t * CONFIG.treeHeight * 0.7 + 3;

        const pX = Math.cos(angle) * radius;
        const pZ = Math.sin(angle) * radius;

        photoGroup.position.set(pX, y, pZ);
        photoGroup.lookAt(pX * 2, y, pZ * 2);

        photoGroup.userData.photoIndex = i;
        spiralPhotoObjects.push(photoGroup);

        spiralGroup.add(photoGroup);
    }
}

function createBackgroundParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];
    const velocities = []; 

    for (let i = 0; i < CONFIG.snowflakeCount; i++) {
        positions.push(
            (Math.random() - 0.5) * 120,
            Math.random() * 80,
            (Math.random() - 0.5) * 120
        );
        sizes.push(0.3 + Math.random() * 0.5);
        velocities.push(
            (Math.random() - 0.5) * 0.02, 
            0.03 + Math.random() * 0.05,   
            Math.random() * Math.PI * 2    
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.userData.velocities = velocities;

    const material = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.5,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        map: createSnowflakeTexture()
    });

    particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData.velocities = velocities;
    scene.add(particleSystem);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Main Export
export function initScene() {
    const container = document.getElementById('canvas-container');

    clock = new THREE.Clock();
    spiralGroup = new THREE.Group();

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.015);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(CONFIG.colors.warmWhite, 1.2, 80);
    mainLight.position.set(0, 25, 15);
    scene.add(mainLight);

    rotatingLight = new THREE.PointLight(CONFIG.colors.gold, 0.8, 50);
    rotatingLight.position.set(15, 10, 0);
    scene.add(rotatingLight);

    const bottomLight = new THREE.PointLight(0x4466aa, 0.4, 40);
    bottomLight.position.set(0, -5, 20);
    scene.add(bottomLight);

    createParticleTree();
    createTreeTrunk();
    createStar();
    createOrnaments();
    createLightString();
    createGiftBoxes();
    createSpiralPhotos();
    createBackgroundParticles();

    window.addEventListener('resize', onWindowResize, false);

    startAnimationLoop();
}

function startAnimationLoop() {
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Sync snow speed
        snowSpeedMultiplier += (state.targetSnowSpeed - snowSpeedMultiplier) * 0.1;

        // Tree rotation
        if (scene.userData.treeGroup) {
            const currentRot = scene.userData.treeGroup.rotation.y;
            // Smoothly interpolate towards target rotation
            scene.userData.treeGroup.rotation.y += (state.targetGroupRotation - currentRot) * 0.05;
            
            if (!state.handVisible) {
                state.targetGroupRotation += 0.002; // Auto-rotate if no hand
            }
            spiralGroup.rotation.y = scene.userData.treeGroup.rotation.y;
        }

        // Rotating light
        if (rotatingLight) {
            const lightAngle = time * 0.3;
            rotatingLight.position.x = Math.cos(lightAngle) * 18;
            rotatingLight.position.z = Math.sin(lightAngle) * 18;
            rotatingLight.position.y = 10 + Math.sin(time * 0.5) * 3;
            rotatingLight.intensity = 0.8;
        }

        // Particles blinking
        if (treeParticles) {
            const sizes = treeParticles.geometry.attributes.size.array;
            for (let i = 0; i < sizes.length; i++) {
                const baseSize = 0.25 + (i % 10) * 0.02;
                sizes[i] = baseSize + Math.sin(time * 2 + i * 0.1) * 0.08;
            }
            treeParticles.geometry.attributes.size.needsUpdate = true;
        }

        if (lightString) {
            lightString.material.size = 0.5 + Math.sin(time * 4) * 0.2;
        }

        if (starParticles) {
            starParticles.rotation.y += 0.005;
            const sizes = starParticles.geometry.attributes.size.array;
            const initialSizes = starParticles.geometry.userData.initialSizes;
            for (let i = 0; i < sizes.length; i++) {
                sizes[i] = initialSizes[i] * (1 + Math.sin(time * 4 + i) * 0.1);
            }
            starParticles.geometry.attributes.size.needsUpdate = true;
        }

        if (ornamentParticles) {
            const positions = ornamentParticles.geometry.attributes.position.array;
            const phases = ornamentParticles.geometry.attributes.phase.array;
            const originalPositions = ornamentParticles.geometry.userData.originalPositions;

            for (let i = 0; i < positions.length / 3; i++) {
                const yIdx = i * 3 + 1;
                const phase = phases[i];
                positions[yIdx] = originalPositions[yIdx] + Math.sin(time * 1.5 + phase) * 0.08;
            }
            ornamentParticles.geometry.attributes.position.needsUpdate = true;
            
            const sizes = ornamentParticles.geometry.attributes.size.array;
            for(let i=0; i < sizes.length; i++) {
                 sizes[i] = (1.5 + Math.sin(time * 2 + i) * 0.3) * (1 + Math.random() * 0.1);
            }
            ornamentParticles.geometry.attributes.size.needsUpdate = true;
        }

        giftBoxes.forEach((box, idx) => {
            const phase = box.userData.phase;
            box.position.y = box.userData.originalY + Math.sin(time * 0.8 + phase) * 0.05;
        });

        // Camera control
        let targetPos;
        if (state.current === STATE_ENUM.CLOSED) {
            targetPos = camera.position.clone();
        } else if (state.current === STATE_ENUM.IDLE) {
            state.targetCameraZ += (35 - state.targetCameraZ) * 0.02;
            state.targetCameraY += (10 - state.targetCameraY) * 0.02;
            targetPos = new THREE.Vector3(0, state.targetCameraY, state.targetCameraZ);
        } else {
            targetPos = new THREE.Vector3(0, state.targetCameraY, state.targetCameraZ);
        }

        camera.position.lerp(targetPos, 0.06);
        camera.lookAt(0, 8, 0);

        // Snowflakes
        if (particleSystem) {
            const positions = particleSystem.geometry.attributes.position.array;
            const velocities = particleSystem.userData.velocities;

            for (let i = 0; i < positions.length / 3; i++) {
                const idx = i * 3;
                const velIdx = i * 3;
                positions[idx] += Math.sin(time + velocities[velIdx + 2]) * velocities[velIdx];
                positions[idx + 1] -= velocities[velIdx + 1] * snowSpeedMultiplier;

                if (positions[idx + 1] < -10) {
                    positions[idx + 1] = 70;
                    positions[idx] = (Math.random() - 0.5) * 120;
                    positions[idx + 2] = (Math.random() - 0.5) * 120;
                }
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
            particleSystem.material.size = 0.4 + snowSpeedMultiplier * 0.1;
            particleSystem.material.opacity = 0.7 + snowSpeedMultiplier * 0.08;
            particleSystem.rotation.y = -scene.userData.treeGroup.rotation.y * 0.1;
        }

        renderer.render(scene, camera);
    }
    animate();
}
