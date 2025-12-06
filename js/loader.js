import { CDN_SOURCES } from './config.js';
import { state } from './state.js';

export async function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = "anonymous";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export async function initEnvironment() {
    const loadingEl = document.getElementById('loading');
    loadingEl.innerHTML = "正在读取配置...";
    
    let config = CDN_SOURCES.LOCAL; // Default to LOCAL
    
    try {
        const res = await fetch('config.json?t=' + new Date().getTime());
        if (res.ok) {
            const data = await res.json();
            console.log("Config loaded:", data);
            if (data.cdn_region === 'CN') {
                config = CDN_SOURCES.CN;
            } else if (data.cdn_region === 'GLOBAL') {
                config = CDN_SOURCES.GLOBAL;
            }
        } else {
            console.warn("Config load failed, using LOCAL default.");
        }
    } catch (e) {
        console.warn("Config load error, using LOCAL default.", e);
    }

    let sourceName = 'Local Cache';
    if (config === CDN_SOURCES.CN) sourceName = 'China Mirror';
    if (config === CDN_SOURCES.GLOBAL) sourceName = 'Global CDN';

    loadingEl.innerHTML = `正在加载核心库...<br><span style="font-size:12px;color:#aaa">Source: ${sourceName}</span>`;
    
    state.mpAssetBase = config.mediapipe.assets;

    try {
        await Promise.all([
            loadScript(config.three),
            loadScript(config.mediapipe.camera),
            loadScript(config.mediapipe.control),
            loadScript(config.mediapipe.drawing),
            loadScript(config.mediapipe.hands)
        ]);
        console.log("All scripts loaded.");
    } catch (e) {
        loadingEl.innerHTML = "核心库加载失败<br>请检查网络连接";
        console.error("Script load error:", e);
        throw e;
    }
}

export async function autoDetectPhotos() {
    const loadingEl = document.getElementById('loading');
    loadingEl.innerHTML = "正在检测图片资源...";
    let index = 1;
    const maxPhotos = 100;

    while (index <= maxPhotos) {
        const path = `assets/${index}.jpg`;
        try {
            const res = await fetch(path, { method: 'HEAD' });
            if (res.ok) {
                state.photos.push(path);
                index++;
            } else {
                break;
            }
        } catch (e) {
            console.log("图片检测结束:", e);
            break;
        }
    }

    console.log(`检测到 ${state.photos.length} 张照片`);
    if (state.photos.length === 0) {
        loadingEl.innerHTML = "未检测到 assets/X.jpg 图片<br>请确保图片命名为 1.jpg, 2.jpg...";
    }
}
