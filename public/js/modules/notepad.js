import { playSound } from './soundManager.js'; 
export function initializeNotepad() {
    const notepadWindow = document.getElementById('notepad-window');
    if (!notepadWindow) return;

    const saveButton = document.getElementById('notepad-save-button');
    const usernameInput = document.getElementById('notepad-username');
    const textarea = document.getElementById('notepad-textarea');

    saveButton.addEventListener('click', async () => {
        const name = usernameInput.value.trim();
        const message = textarea.value.trim();
        if (!name) return alert('你得留个名字');
        if (!message) return alert('空着的内容是不会被接受的');

        saveButton.disabled = true;
        saveButton.textContent = '正在保存...';
        try {
            const response = await fetch('/save-note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, message }),
            });
            const result = await response.json();
            if (result.success) {
                playSound('chimes');
                alert('吸血鬼会看到它的，大概。感谢你的留言。');
                usernameInput.value = '';
                textarea.value = '';
            } else {
                playSound('chord');
                alert('保存失败：' + result.message);
            }
        } catch (error) {
            playSound('chord');
            console.error('Error saving note:', error);
            alert('无法连接到服务器，所以肯定是有什么错误发生了,应该不是你的问题。');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = '保存留言';
        }
    });
}