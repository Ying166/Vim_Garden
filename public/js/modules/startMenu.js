// public/js/modules/startMenu.js
import { windowInitializers } from '../moduleRegistry.js';
import { openWindow } from './windowManager.js';
import { playSound } from './soundManager.js'; 

// --- 1. The Menu's Data Structure ---
// This array of objects defines the entire start menu.
const menuData = [
    {
        text: "程序",
        icon: "assets/icons/programs.png",
        submenu: [ // This item has a submenu
            { text: "记事本", icon: "assets/icons/notepad.png", windowId: "notepad-window" },
            { text: "显示属性", icon: "assets/icons/monitor_windows.png", windowId: "display-properties-window" },
            { text: "让我们说绿绿话", icon:"assets/icons/green.png",windowId:"uwa-encryptor-window"},
            { text: "画图", icon:"assets/icons/paint.png",windowId:"paint-window"}
        ]
    },
    {
        text: "文档",
        icon: "assets/icons/document1.png",
        windowId: "my-projects-window" // "网站导览" window
    },
    {
        text: "查找",
        icon: "assets/icons/search_file.png",
        disabled: true // This item will be grayed out
    },
    { type: 'separator' }, // A visual separator line
    {
        text: "关于吸血鬼",
        icon: "assets/icons/explorer.png", // Using the same icon as the desktop for consistency
        windowId: "about-me-window"
    },
    {
        text: "关机",
        icon: "assets/icons/shut_down.png",
        onClick: () => { // A custom action instead of opening a window
            playSound('shutdown');
            alert("别离开我。");
        }
    }
];

// --- 2. The Rendering Engine ---
const startMenuContainer = document.getElementById('start-menu-items'); // The <ul> in the HTML
const startMenu = document.getElementById('start-menu');

// A recursive function to build the menu from the data structure
function createMenuItems(items, parentElement) {
    items.forEach(itemData => {
        const li = document.createElement('li');

        if (itemData.type === 'separator') {
            li.className = 'separator';
            parentElement.appendChild(li);
            return;
        }

        li.className = 'start-menu-item';
        if (itemData.disabled) {
            li.classList.add('disabled');
        }
        if (itemData.submenu) {
            li.classList.add('has-submenu');
        }

        li.innerHTML = `
            <img src="${itemData.icon || 'assets/icons/default-icon.png'}" width="22" height="22">
            <span>${itemData.text}</span>
        `;

        // --- Event Handling ---
        if (!itemData.disabled) {
            li.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop the click from bubbling up to the desktop
                if (itemData.windowId) {
                    openWindow(itemData.windowId);
                } else if (itemData.onClick) {
                    itemData.onClick();
                }
                // Hide the entire start menu after a click
                startMenu.style.display = 'none';
            });
        }
        
        // --- Submenu Logic ---
        if (itemData.submenu) {
            const submenuUl = document.createElement('ul');
            submenuUl.className = 'submenu';
            li.appendChild(submenuUl);
            // Recursion! Build the submenu using the same function.
            createMenuItems(itemData.submenu, submenuUl);
        }

        parentElement.appendChild(li);
    });
}

// --- 3. The Initialization Function ---
export function initializeStartMenu() {
    if (!startMenuContainer) return;
    // Clear any hardcoded items from the HTML
    startMenuContainer.innerHTML = '';
    // Build the menu dynamically
    createMenuItems(menuData, startMenuContainer);
}