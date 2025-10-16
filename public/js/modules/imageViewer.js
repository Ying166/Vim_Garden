// public/js/modules/imageViewer.js

export function initializeImageViewer(params = {}) {
    const viewerWindow = document.getElementById('image-viewer-window');
    const imageElement = document.getElementById('image-viewer-content');
    const titleText = viewerWindow.querySelector('.title-bar-text');

    if (!imageElement) return;

    // 检查是否通过 openWindow 传递了文件路径
    if (params && params.filePath) {
        // 更新图片的源
        imageElement.src = params.filePath;
        
        // 从路径中提取文件名并更新窗口标题
        const filename = params.filePath.split('/').pop();
        titleText.textContent = `${filename} - 图片查看器`;
    } else {
        // 如果没有指定文件，显示错误信息
        imageElement.alt = '错误：没有指定要打开的图片文件。';
        titleText.textContent = '错误 - 图片查看器';
    }
}