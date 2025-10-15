// public/js/modules/display.js (只显示修改后的函数)

export function initializeDisplayProperties() {
    // 我们仍然需要读取 savedScale 来设置下拉菜单的默认值
    const savedScale = localStorage.getItem('uiScale') || '1';
    
    // [删除!] 下面这行代码被移到了 main.js 中，所以在这里要删除它。
    // document.body.style.zoom = savedScale; 
    
    const displayWindow = document.getElementById('display-properties-window');
    if (!displayWindow) return;

    const scaleSelect = document.getElementById('scale-select');
    const okButton = document.getElementById('display-ok-button');
    const applyButton = document.getElementById('display-apply-button');
    const cancelButton = document.getElementById('display-cancel-button');
    
    // 确保下拉菜单能正确显示当前保存的值
    scaleSelect.value = savedScale;

    const applyScale = () => {
        const selectedValue = scaleSelect.value;
        document.body.style.zoom = selectedValue;
        localStorage.setItem('uiScale', selectedValue);
    };

    applyButton.addEventListener('click', applyScale);
    okButton.addEventListener('click', () => {
        applyScale();
        displayWindow.querySelector('.close-button').click();
    });
    cancelButton.addEventListener('click', () => {
        displayWindow.querySelector('.close-button').click();
    });
}