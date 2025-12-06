import { initEnvironment, autoDetectPhotos } from './loader.js';
import { initScene } from './scene.js';
import { initHandTracking, initMusic } from './interaction.js';

async function startApp() {
    try {
        // 1. Load configuration and libraries (Three.js, MediaPipe)
        await initEnvironment();

        // 2. Initialize Three.js Scene
        initScene();

        // 3. Detect and load photos
        await autoDetectPhotos();

        // 4. Initialize MediaPipe Hand Tracking
        await initHandTracking();

        // 5. Initialize Music
        initMusic();

    } catch (e) {
        console.error("Application failed to start:", e);
    }
}

// Start the application
startApp();
