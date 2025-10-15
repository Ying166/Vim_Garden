// public/js/modules/aboutMe.js
export function initializeAboutWindow() {
    const aboutMeWindow = document.getElementById('about-me-window');
    if (!aboutMeWindow) return;

    const tabs = aboutMeWindow.querySelectorAll('[role="tab"]');
    const tabPanels = aboutMeWindow.querySelectorAll('[role="tabpanel"]');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
            tabPanels.forEach(p => p.style.display = 'none');
            tab.setAttribute('aria-selected', 'true');
            const targetPanel = document.getElementById(tab.getAttribute('aria-controls'));
            if (targetPanel) targetPanel.style.display = 'block';
        });
    });
}