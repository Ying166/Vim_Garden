// public/js/modules/reader.js

let fileToLoad = null;
const converter = new showdown.Converter();

/**
 * [核心修复] 精准计算并设置阅读器内容区的高度
 * 这是解决滚动条问题的关键
 */

async function loadContent() {
    const readerWindow = document.getElementById('reader-window');
    if (!readerWindow || !fileToLoad) return;
    
    const contentDiv = document.getElementById('reader-content');
    const titleText = readerWindow.querySelector('.title-bar-text');
    
    try {
        const response = await fetch(`/get-content/${fileToLoad.type}/${fileToLoad.slug}`);
        if (!response.ok) {
            throw new Error(`文件加载失败: ${response.statusText}`);
        }
        const markdown = await response.text();
        const html = converter.makeHtml(markdown);
        
        contentDiv.innerHTML = html;
        titleText.textContent = `${fileToLoad.slug} - 文档阅读器`;

    } catch (error) {
        contentDiv.innerHTML = `<p style="color: red;">加载失败: ${error.message}</p>`;
        console.error(error);
    }
}

export function initializeReader(params = {}) {
    if (params && params.filePath) {
        fileToLoad = params.filePath;
        loadContent();
    } else {
        const contentDiv = document.getElementById('reader-content');
        if (contentDiv) contentDiv.innerHTML = "<p>错误：没有指定要打开的文件。</p>";
    }


    // [可选但推荐] 如果未来窗口可以调整大小，我们还需要监听 resize 事件
    // const resizeObserver = new ResizeObserver(adjustReaderHeight);
    // const readerWindow = document.getElementById('reader-window');
    // if(readerWindow) resizeObserver.observe(readerWindow);
}