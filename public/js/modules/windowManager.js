// public/js/modules/windowManager.js (重构后的完整代码)

import { windowInitializers } from '../moduleRegistry.js';
import { playSound } from './soundManager.js';
// --- 模块内的全局状态 (不变) ---
let highestZIndex = 20;
let activeWindow = null;
const taskbarWindowsContainer = document.getElementById('taskbar-windows');

// --- 辅助函数 ---

/**
 * [重构] 将窗口的事件绑定逻辑提取成一个独立的、可重用的函数。
 * 这样我们就可以对任何时候加载进来的窗口进行初始化。
 * @param {HTMLElement} windowElement - 需要绑定事件的窗口元素。
 */
function initializeWindowEvents(windowElement) {
    const titleBar = windowElement.querySelector('.title-bar');
    const closeButton = windowElement.querySelector('.close-button');
    const minimizeButton = windowElement.querySelector('button[aria-label="Minimize"]');
    const maximizeButton = windowElement.querySelector('button[aria-label="Maximize"]');

    // 1. 点击窗口时，将其置顶
    windowElement.addEventListener('mousedown', () => bringToFront(windowElement));

    // 2. 关闭按钮
    if (closeButton) {
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            playSound('ding');
            windowElement.style.display = 'none';
            const tab = document.getElementById(`tab-${windowElement.id}`);
            if (tab) tab.remove();
            if (activeWindow === windowElement) activeWindow = null;
            updateTaskbar();
        });
    }

    // 3. 最小化按钮
    if (minimizeButton) {
        minimizeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            windowElement.style.display = 'none';
            if (activeWindow === windowElement) activeWindow = null;
            updateTaskbar();
        });
    }
    
    // 4. 最大化/还原按钮
    if (maximizeButton) {
        maximizeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMaximize(windowElement);
        });
    }

    // 5. 拖动和双击最大化逻辑
    if (titleBar) {
        // 双击标题栏最大化/还原
        titleBar.addEventListener('dblclick', (e) => {
            if (e.target.closest('button')) return;
            toggleMaximize(windowElement);
        });

        // 拖动逻辑 (保持不变)
        let isDragging = false, xOffset = 0, yOffset = 0, startX = 0, startY = 0;
        const existingTransform = window.getComputedStyle(windowElement).transform;
        if (existingTransform && existingTransform !== 'none') {
            const matrix = new DOMMatrixReadOnly(existingTransform);
            xOffset = matrix.m41;
            yOffset = matrix.m42;
        }
        
        titleBar.addEventListener('mousedown', dragStart);

        function dragStart(e) {
            if (windowElement.classList.contains('maximized') || e.target.tagName === 'BUTTON') return;
            e.preventDefault();
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd, { once: true });
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            const currentScale = parseFloat(document.body.style.zoom) || 1;
            const mouseDeltaX = e.clientX - startX;
            const mouseDeltaY = e.clientY - startY;
            const newX = xOffset + (mouseDeltaX / currentScale);
            const newY = yOffset + (mouseDeltaY / currentScale);
            windowElement.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
        }

        function dragEnd(e) {
            if (!isDragging) return;
            const currentScale = parseFloat(document.body.style.zoom) || 1;
            const mouseDeltaX = e.clientX - startX;
            const mouseDeltaY = e.clientY - startY;
            xOffset += mouseDeltaX / currentScale;
            yOffset += mouseDeltaY / currentScale;
            isDragging = false;
            document.removeEventListener('mousemove', drag);
        }
    }
}

/**
 * [新增] 动态加载窗口HTML的核心函数。
 * @param {string} windowId - 窗口的ID，也对应其HTML文件名。
 * @returns {Promise<HTMLElement|null>} - 返回加载并初始化后的窗口元素。
 */
async function loadWindowHTML(windowId, params = {}) {
    // 如果窗口已经存在于DOM中，直接返回它
    const existingWindow = document.getElementById(windowId);
    if (existingWindow) {
        // 如果窗口已存在，我们依然需要确保它的初始化函数被（可能带有新参数地）调用
        if (windowInitializers[windowId]) {
            windowInitializers[windowId](params);
        }
        return existingWindow;
    }

    try {
        // 使用 fetch API 从服务器加载 HTML 文件
        const response = await fetch(`components/${windowId}.html`);
        if (!response.ok) {
            throw new Error(`无法加载 ${windowId}.html, 状态: ${response.status}`);
        }
        const html = await response.text();

        // 将加载的HTML字符串注入到 <body> 的末尾
        document.body.insertAdjacentHTML('beforeend', html);
        
        const newWindowElement = document.getElementById(windowId);

        // **至关重要的一步**: 对新加载的窗口绑定所有交互事件！
        initializeWindowEvents(newWindowElement);

        // 从注册表中查找并执行该窗口的特定初始化脚本
        if (windowInitializers[windowId]) {
            windowInitializers[windowId](params);
        }

        return newWindowElement;
    } catch (error) {
        console.error("加载窗口失败:", error);
        alert(`加载应用 '${windowId}' 失败，请检查控制台获取更多信息。`);
        return null;
    }
}


// --- 核心函数 (部分被修改或保持不变) ---

function updateTaskbar() { /* ... 此函数内容不变 ... */ 
    const tabs = taskbarWindowsContainer.querySelectorAll('.taskbar-tab');
    tabs.forEach(tab => {
        const windowId = tab.dataset.windowId;
        if (activeWindow && activeWindow.id === windowId && activeWindow.style.display !== 'none') {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

function bringToFront(windowElement) { /* ... 此函数内容不变 ... */ 
    if (!windowElement) return;
    highestZIndex++;
    windowElement.style.zIndex = highestZIndex;
    activeWindow = windowElement;
    updateTaskbar();
}

function createTaskbarTab(windowElement) { /* ... 此函数内容不变 ... */ 
    const tab = document.createElement('button');
    tab.className = 'taskbar-tab';
    tab.id = `tab-${windowElement.id}`;
    tab.dataset.windowId = windowElement.id;
    
    const iconSrc = document.querySelector(`.desktop-icon[data-window-id="${windowElement.id}"] img`)?.src || 'assets/icons/default-icon.png';
    const title = windowElement.querySelector('.title-bar-text').textContent;
    
    tab.innerHTML = `<img src="${iconSrc}" alt=""><span>${title}</span>`;
    
    tab.addEventListener('click', () => {
        if (windowElement === activeWindow && windowElement.style.display !== 'none') {
            windowElement.style.display = 'none';
            activeWindow = null;
        } else {
            windowElement.style.display = 'flex';
            bringToFront(windowElement);
        }
        updateTaskbar();
    });
    taskbarWindowsContainer.appendChild(tab);
}

function toggleMaximize(windowElement) {
    const isMaximized = windowElement.classList.contains('maximized');

    if (isMaximized) {
        // ----- 从最大化状态还原 -----
        windowElement.classList.remove('maximized');
        // 直接应用之前保存的样式值
        windowElement.style.top = windowElement.dataset.originalTop;
        windowElement.style.left = windowElement.dataset.originalLeft;
        windowElement.style.width = windowElement.dataset.originalWidth;
        windowElement.style.height = windowElement.dataset.originalHeight;
        windowElement.style.transform = windowElement.dataset.originalTransform || '';
    } else {
        // ----- 进入最大化状态 -----
        
        // [核心修复] 使用 getComputedStyle 获取未被 zoom 缩放的尺寸
        const computedStyle = window.getComputedStyle(windowElement);

        // 保存当前的样式值，这些值是可靠的、未缩放的
        windowElement.dataset.originalTop = windowElement.style.top || computedStyle.top;
        windowElement.dataset.originalLeft = windowElement.style.left || computedStyle.left;
        windowElement.dataset.originalWidth = computedStyle.width;

        // 对于高度，我们需要特别处理，因为我们的 flexbox 布局可能导致 height 是 auto。
        // 在这种情况下，getBoundingClientRect 仍然是获取当前渲染高度的最佳方式，但我们需要把它“除回去”。
        const currentScale = parseFloat(document.body.style.zoom) || 1;
        const rect = windowElement.getBoundingClientRect();
        windowElement.dataset.originalHeight = (rect.height / currentScale) + 'px';

        windowElement.dataset.originalTransform = windowElement.style.transform;

        // 清空内联样式并添加 .maximized 类，让 CSS 来处理最大化
        windowElement.style.transform = '';
        windowElement.classList.add('maximized');
        windowElement.style.top = '';
        windowElement.style.left = '';
        windowElement.style.width = '';
        windowElement.style.height = '';
    }
}


// --- 导出的主函数 ---

/**
 * [修改] 这是现在唯一的入口函数，负责打开（并在需要时加载）一个窗口。
 * @param {string} windowId - 要打开的窗口ID。
 */
export async function openWindow(windowId, params = {}) {
    playSound('notify');
    // 1. 确保窗口的HTML已经被加载到DOM中
    const windowElement = await loadWindowHTML(windowId, params);

    // 如果加载失败，则中止操作
    if (!windowElement) return;

    // 2. 如果窗口已经打开，只需将其置顶
    if (windowElement.style.display === 'block') {
        bringToFront(windowElement);
        return;
    }

    // 3. 如果窗口是关闭的，则显示它、置顶并创建任务栏标签
    windowElement.style.display = 'flex';
    bringToFront(windowElement);
    
    if (!document.getElementById(`tab-${windowElement.id}`)) {
        createTaskbarTab(windowElement);
    }
    updateTaskbar();
}

/**
 * [修改] 这个函数现在是空的，因为所有初始化都是动态按需进行的。
 * 我们保留它，以防未来有需要在页面加载时就执行的全局逻辑。
 */
export function initializeWindowManager() {
    // 原有的 document.querySelectorAll('.window').forEach(...) 逻辑
    // 已经被提取到 initializeWindowEvents 中，并在窗口加载时动态调用。
    // 所以这里不再需要做任何事。
}