// public/js/main.js

// 导入核心模块的初始化函数
import { initializeWindowManager } from './modules/windowManager.js';
import { initializeDesktop } from './desktop.js';
import { initializeStartMenu } from './modules/startMenu.js';
import { initializeSoundManager, playSound } from './modules/soundManager.js'; // [新增] 导入声音模块

/** 一个专门在页面加载时应用UI缩放的函数 */
function applyInitialUIScale() {
    const savedScale = localStorage.getItem('uiScale') || '1';
    document.body.style.zoom = savedScale;
}

// 等待整个 HTML 文档加载完成后，再执行所有脚本
document.addEventListener('DOMContentLoaded', () => {
    // **第一步：立刻应用已保存的缩放设置**
    applyInitialUIScale();

    // 第二步：初始化声音系统
    initializeSoundManager(); // [新增]

    // 第三步：再初始化其他核心功能
    initializeWindowManager();
    initializeDesktop();
    initializeStartMenu();

    // 第四步：播放启动音效！
    playSound('startup'); // [新增]

    console.log("WIN98R 加载完毕. 系统已准备就绪。");
});