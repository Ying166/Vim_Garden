// public/js/modules/myComputer.js (修复后的完整代码)
import { openWindow } from './windowManager.js';
// --- 1. Virtual File System Definition ---
let VFS = {
    "C:": {
        type: "drive",
        content: {
            "loading...": { type: "file" } // 一个临时的加载提示
        }
    }
};

let isContentLoaded = false; // 添加一个标志位，防止重复加载
let currentPath = "C:\\";

// --- 2. DOM Element Retrieval (Declared here, assigned later) ---
// [MODIFIED] 我们在这里只声明变量，让它们在整个模块内可用。
let computerWindow, addressBar, mainPane, itemCountStatus, upButton;

// --- 3. Path Navigation and Rendering Logic ---
// 这个函数本身没有变化，但现在它可以正确访问到 mainPane 等变量了。
function getDirectoryContent(path) {
    const parts = path.split('\\').filter(p => p);
    let currentNode = VFS;
    for (const part of parts) {
        currentNode = (currentNode.content || currentNode)[part];
        if (!currentNode) return null;
    }
    return currentNode.content || null;
}

function renderDirectory(path) {
    const dirContent = getDirectoryContent(path);

    if (dirContent === null) {
        console.error("Path not found:", path);
        mainPane.innerHTML = `<p style="padding: 10px;">Error404-找不到路径 ${path}</p>`;
        return;
    }

    mainPane.innerHTML = '';
    currentPath = path;
    addressBar.value = path;

    const items = Object.keys(dirContent);
    itemCountStatus.textContent = `${items.length} 个对象`;

    for (const itemName of items) {
        const item = dirContent[itemName];
        const iconDiv = document.createElement('div');
        iconDiv.className = 'file-icon';
        iconDiv.dataset.name = itemName;
        iconDiv.dataset.type = item.type;

        let iconName = 'normalfile.png';
        if (item.type === 'folder' || item.type === 'drive') {
            iconName = 'folder.png';
        } else if (item.type === 'shortcut') {
            iconName = 'folder-shortcut.png';
        } else if (itemName.endsWith('.pdf')) {
            iconName = 'pdfile.png';
        } else if (itemName.endsWith('.txt')) {
            iconName = 'textfile.png';
        } else if (itemName.endsWith('.md')) {
            iconName = 'textfile.png';
        } else if (itemName.endsWith('.png')){
            iconName = 'pngfile.png'
        } else if (itemName.endsWith('.url')){
            iconName = 'urlfile.png'
        }

        iconDiv.innerHTML = `
            <img src="/assets/icons/${iconName}" alt="${itemName}">
            <span>${itemName}</span>
        `;
        mainPane.appendChild(iconDiv);
    }
}

// --- 4. Event Handlers (No changes needed here) ---
function handleNavigation(e) {
    const target = e.target.closest('.file-icon');
    if (!target) return;

    const itemName = target.dataset.name;
    const dirContent = getDirectoryContent(currentPath);
    const item = dirContent ? dirContent[itemName] : null;

    if (item) {
        if (item.type === 'folder') {
            const newPath = currentPath.endsWith('\\') ? `${currentPath}${itemName}\\` : `${currentPath}\\${itemName}\\`;
            renderDirectory(newPath);
        } else if (item.app && item.filePath) {
            // **核心修改在这里**
            // 调用新的 openWindow，并传入应用ID和文件路径参数
            openWindow(item.app, { filePath: item.filePath });
        } else if (item.url) { // 保留旧的URL逻辑
            window.open(item.url, '_blank');
        }
    }
}

function handleUpButton() {
    if (currentPath === "C:\\") return;
    const parts = currentPath.split('\\').filter(p => p);
    parts.pop();
    const newPath = parts.join('\\') + '\\';
    renderDirectory(newPath);
}

// --- 5. Initialization ---
export async function initializeExplorer() {
    computerWindow = document.getElementById('my-computer-window');
    addressBar = document.getElementById('explorer-address-bar');
    mainPane = document.getElementById('explorer-main-pane');
    itemCountStatus = document.getElementById('explorer-item-count');
    upButton = document.getElementById('explorer-up-button');
    
    if (!computerWindow || !mainPane || !upButton) {
        console.error("Explorer elements could not be found. Initialization failed.");
        return;
    }

    // --- 动态加载内容 ---
    if (!isContentLoaded) {
        try {
            const response = await fetch('/api/get-content-structure');
            if (!response.ok) throw new Error('Failed to fetch content structure');
            
            const dynamicContent = await response.json();
            
            // 将获取到的动态内容合并到我们的 VFS 中
            VFS["C:"].content = dynamicContent;
            
            isContentLoaded = true; // 标记为已加载
            
        } catch (error) {
            console.error("Error loading dynamic content:", error);
            VFS["C:"].content = { "Error.txt": { type: "file", content: "无法加载内容..." } };
        }
    }

    // 初始渲染和事件绑定
    renderDirectory("C:\\");
    mainPane.addEventListener('dblclick', handleNavigation);
    upButton.addEventListener('click', handleUpButton);
}