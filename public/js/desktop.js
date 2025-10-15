// public/js/desktop.js

import { openWindow } from './modules/windowManager.js'; // 我们需要 openWindow 函数
import { setGlobalVolume, getGlobalVolume, playSound } from './modules/soundManager.js';

export function initializeDesktop() {
    // --- 元素获取 ---
    const desktop = document.body;
    const startButton = document.querySelector('.start-button');
    const startMenu = document.getElementById('start-menu');
    const clockElement = document.getElementById('clock');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeControlPanel = document.getElementById('volume-control-panel');
    const volumeSlider = document.getElementById('volume-slider');
    
    // --- 开始菜单和时钟逻辑 ---
    startButton.addEventListener('click', e => { e.stopPropagation(); startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block'; });
    desktop.addEventListener('click', () => { startMenu.style.display = 'none'; });
    startMenu.addEventListener('click', e => e.stopPropagation());
    function updateClock() { 
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;
     }
    updateClock();
    setInterval(updateClock, 1000);
    
    // --- [新增] 音量控制逻辑 ---
    if (volumeIcon && volumeControlPanel && volumeSlider) {
        // 1. 初始化滑块的值
        volumeSlider.value = getGlobalVolume();

        // 2. 点击图标显示/隐藏面板
        volumeIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止触发body的点击事件
            const isVisible = volumeControlPanel.style.display === 'flex';
            volumeControlPanel.style.display = isVisible ? 'none' : 'flex';
        });

        // 3. 拖动滑块时实时改变音量
        volumeSlider.addEventListener('input', (e) => {
            const newVolume = parseFloat(e.target.value);
            setGlobalVolume(newVolume);
        });

        // 4. 释放滑块后播放提示音，让用户听到效果
        volumeSlider.addEventListener('change', () => {
            playSound('ding');
        });
        
        // 5. 点击其他地方关闭面板
        desktop.addEventListener('click', (e) => {
            // 点击的不是音量面板，也不是音量图标
            if (!volumeControlPanel.contains(e.target) && e.target !== volumeIcon) {
                volumeControlPanel.style.display = 'none';
            }
        });
        volumeControlPanel.addEventListener('click', e => e.stopPropagation());
    }

    // --- 桌面图标和开始菜单项的点击事件 ---
    document.querySelectorAll('.desktop-icon[data-window-id], .start-menu-item[data-window-id]').forEach(item => {
        // 图标用双击，菜单用单击
        const eventType = item.classList.contains('desktop-icon') ? 'dblclick' : 'click';
        
        item.addEventListener(eventType, () => {
            const windowId = item.dataset.windowId;
            if (windowId) {
                openWindow(windowId);
                // 如果是开始菜单项，点击后隐藏菜单
                if (item.classList.contains('start-menu-item')) {
                    startMenu.style.display = 'none';
                }
            }
        });
    });

    // --- "我的电脑"中快捷方式的点击事件 (使用事件委托) ---
    document.addEventListener('click', (e) => {
        const shortcut = e.target.closest('a.file-item[data-window-id]');
        if (shortcut) {
            e.preventDefault();
            openWindow(shortcut.dataset.windowId);
        }
    });

    // --- 桌面图标拖放逻辑 ---
    const GRID_SIZE_X = 90;
    const GRID_SIZE_Y = 100;
    const DRAG_THRESHOLD = 5;
    const icons = document.querySelectorAll('.desktop-icon');

    function arrangeIcons() {
        const desktopHeight = document.body.clientHeight - 40;
        const iconsPerColumn = Math.floor(desktopHeight / GRID_SIZE_Y);
        icons.forEach((icon, index) => {
            if (icon.classList.contains('dragging')) return;
            const col = Math.floor(index / iconsPerColumn);
            const row = index % iconsPerColumn;
            icon.style.top = `${row * GRID_SIZE_Y}px`;
            icon.style.left = `${col * GRID_SIZE_X}px`;
        });
    }
    arrangeIcons();

    icons.forEach(icon => {
        let isDragging = false, hasMovedEnough = false;
        let startX, startY, offsetX, offsetY;

        icon.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            isDragging = true;
            hasMovedEnough = false;
            icon.classList.add('dragging');
            startX = e.clientX;
            startY = e.clientY;
            const rect = icon.getBoundingClientRect();
            const currentScale = parseFloat(document.body.style.zoom) || 1;
            offsetX = (e.clientX / currentScale) - (rect.left / currentScale);
            offsetY = (e.clientY / currentScale) - (rect.top / currentScale);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp, { once: true });
        });

        icon.addEventListener('click', (e) => {
            if (hasMovedEnough) { e.preventDefault(); e.stopPropagation(); }
        });

        function onMouseMove(e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (!hasMovedEnough && Math.sqrt(dx*dx + dy*dy) > DRAG_THRESHOLD) {
                hasMovedEnough = true;
            }
            const currentScale = parseFloat(document.body.style.zoom) || 1;
            icon.style.left = `${(e.clientX / currentScale) - offsetX}px`;
            icon.style.top = `${(e.clientY / currentScale) - offsetY}px`;
        }

        function onMouseUp() {
            if (!isDragging) return;
            const finalX = parseFloat(icon.style.left);
            const finalY = parseFloat(icon.style.top);
            icon.style.left = `${Math.round(finalX / GRID_SIZE_X) * GRID_SIZE_X}px`;
            icon.style.top = `${Math.round(finalY / GRID_SIZE_Y) * GRID_SIZE_Y}px`;
            isDragging = false;
            icon.classList.remove('dragging');
            document.removeEventListener('mousemove', onMouseMove);
        }
    });
}