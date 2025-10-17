// public/js/modules/paint.js
import { playSound } from './soundManager.js'; 

export function initializePaint() {
    const paintWindow = document.getElementById('paint-window');
    if (!paintWindow) return;

    const canvas = document.getElementById('paint-canvas');
    const ctx = canvas.getContext('2d');
    const canvasArea = document.querySelector('.paint-canvas-area');
    
    // --- 状态变量 ---
    let isDrawing = false;
    let currentColor = '#000000';
    let currentTool = 'pencil';
    let brushSize = 5;
    let lastX = 0;
    let lastY = 0;

    // --- 初始化画布 ---
    function resizeCanvas() {
        // 1. [核心修复] 保存当前画布内容 (如果画布有尺寸的话)
        let savedContent = null;
        if (canvas.width > 0 && canvas.height > 0) {
            savedContent = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        // 2. 调整画布的DOM尺寸以匹配其容器。这一步会隐式地清空画布。
        canvas.width = canvasArea.clientWidth;
        canvas.height = canvasArea.clientHeight;

        // 3. 用白色背景填充新的尺寸 (这确保了如果画布变大，新区域也是白色的)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 4. [核心修复] 如果有保存的内容，将其绘制回画布的左上角
        if (savedContent) {
            ctx.putImageData(savedContent, 0, 0);
        }
    }
    resizeCanvas();
    
    // --- 核心绘图函数 ---
    function draw(e) {
        if (!isDrawing) return;

        // [修复] 获取当前缩放比例
        const currentScale = parseFloat(document.body.style.zoom) || 1;
        
        // [核复] 将鼠标坐标除以缩放比例，得到正确的画布坐标
        const currentX = e.offsetX / currentScale;
        const currentY = e.offsetY / currentScale;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        
        ctx.strokeStyle = (currentTool === 'eraser') ? '#ffffff' : currentColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.stroke();

        [lastX, lastY] = [currentX, currentY];
    }

    // --- 事件监听 ---
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;

        // [修复] 在开始绘制时，同样需要校准初始坐标
        const currentScale = parseFloat(document.body.style.zoom) || 1;
        [lastX, lastY] = [e.offsetX / currentScale, e.offsetY / currentScale];
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);

    // --- 工具栏交互 ---
    const toolButtons = paintWindow.querySelectorAll('.tool-button');
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            toolButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTool = button.dataset.tool;
        });
    });

    const brushSizeSlider = document.getElementById('brush-size');
    brushSizeSlider.addEventListener('input', (e) => brushSize = e.target.value);

    // --- 颜色面板交互 ---
    const colorBoxes = paintWindow.querySelectorAll('.color-box');
    colorBoxes.forEach(box => {
        box.addEventListener('click', () => {
            colorBoxes.forEach(b => b.classList.remove('selected'));
            box.classList.add('selected');
            currentColor = box.dataset.color;
        });
    });
    
    // 当窗口大小改变时，重新调整画布大小 (简易版)
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(paintWindow);

    // --- [新增] 保存功能 ---
    const saveButton = document.getElementById('paint-save-button');
    const usernameInput = document.getElementById('paint-username');

    saveButton.addEventListener('click', async () => {
        const name = usernameInput.value.trim();
        if (!name) {
            playSound('chord');
            return alert('作品需要署名，画作也是一样。');
        }

        // 1. 将 Canvas 转换为 Base64 编码的 PNG 图片数据
        // toDataURL() 是 Canvas API 的核心功能，它会返回一个长字符串
        const imageData = canvas.toDataURL('image/png');

        saveButton.disabled = true;
        saveButton.textContent = '正在保存...';
        playSound('notify');

        try {
            const response = await fetch('/save-drawing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, imageData }),
            });

            const result = await response.json();
            if (result.success) {
                playSound('tada');
                alert('不知道你画的是什么，但吸血鬼现在收藏了它。感谢你的提交。');
            } else {
                playSound('chord');
                alert('保存失败：' + result.message);
            }
        } catch (error) {
            playSound('chord');
            console.error('Error saving drawing:', error);
            alert('无法连接到服务器，出错了。');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = '保存';
        }
    });
}