// public/js/modules/soundManager.js

// 1. 定义音效映射
const soundMap = {
    startup: '/assets/sound/startup.mp3',
    shutdown: '/assets/sound/shutdown.mp3',
    notify: '/assets/sound/notify.mp3',
    ding: '/assets/sound/ding.mp3',
    tada: '/assets/sound/tada.mp3',
    chord: '/assets/sound/chord.mp3',
    recycle: '/assets/sound/recycle.mp3',
};

// 2. 缓存 Audio 对象
const audioCache = {};

// 3. [新增] 全局音量变量
let currentVolume = 0.5; // 默认音量 50%

/**
 * 初始化声音管理器，预加载音效并设置初始音量。
 */
export function initializeSoundManager() {
    console.log("Sound Manager: Preloading sounds...");
    
    // [新增] 从本地存储读取已保存的音量，如果没有则使用默认值
    const savedVolume = localStorage.getItem('globalVolume');
    if (savedVolume !== null) {
        currentVolume = parseFloat(savedVolume);
    }

    for (const key in soundMap) {
        const audio = new Audio(soundMap[key]);
        audio.preload = 'auto';
        audio.volume = currentVolume; // [新增] 创建时即应用当前音量
        audioCache[key] = audio;
    }
    console.log(`Sound Manager: All sounds preloaded. Volume set to ${Math.round(currentVolume * 100)}%.`);
}

/**
 * 播放指定的音效。
 * @param {string} soundName - soundMap中的一个键
 */
export function playSound(soundName) {
    const audio = audioCache[soundName];
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(error => {});
    } else {
        console.warn(`Sound "${soundName}" not found.`);
    }
}

/**
 * [新增] 设置并保存全局音量。
 * @param {number} newVolume - 0.0 到 1.0 之间的新音量值
 */
export function setGlobalVolume(newVolume) {
    // 确保音量值在有效范围内
    currentVolume = Math.max(0, Math.min(1, newVolume));
    
    // 应用到所有已缓存的音效
    for (const key in audioCache) {
        audioCache[key].volume = currentVolume;
    }

    // 保存到本地存储以供下次访问时使用
    localStorage.setItem('globalVolume', currentVolume.toString());
}

/**
 * [新增] 获取当前全局音量。
 * @returns {number} 当前音量值
 */
export function getGlobalVolume() {
    return currentVolume;
}