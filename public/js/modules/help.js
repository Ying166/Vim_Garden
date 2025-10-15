// public/js/modules/help.js
export function initializeHelpWindow() {
    const helpWindow = document.getElementById('my-projects-window');
    if (!helpWindow) return;

    const navItems = helpWindow.querySelectorAll('.nav-item');
    const contentPanels = helpWindow.querySelectorAll('.panel-content');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            contentPanels.forEach(p => p.style.display = 'none');
            const targetPanel = document.getElementById(item.dataset.target);
            if (targetPanel) targetPanel.style.display = 'block';
        });
    });
}