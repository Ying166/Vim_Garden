// public/js/modules/uwaEncryptor.js
import { playSound } from './soundManager.js'; 
// --- 辅助函数 ---

/**
 * 将数字转换为16位的“呜哇”二进制字符串
 * @param {number} num - 要转换的数字
 * @returns {string} - 16位的呜哇字符串
 */
function toUwa(num) {
    return num.toString(2).padStart(16, '0').replace(/0/g, '呜').replace(/1/g, '哇');
}

/**
 * 将“呜哇”字符串转换回数字
 * @param {string} uwaStr - 呜哇字符串
 * @returns {number} - 对应的数字
 */
function fromUwa(uwaStr) {
    return parseInt(uwaStr.replace(/呜/g, '0').replace(/哇/g, '1'), 2);
}


// --- 核心加密/解密逻辑 ---

function encrypt(text) {
    if (!text) return '';
    
    // 1. 生成 16 位随机盐
    const salt = Math.floor(Math.random() * 65536);
    
    // 2. 将盐转换为呜哇字符串
    const uwaSalt = toUwa(salt);

    let encryptedChars = '';
    // 3. 遍历每个字符
    for (const char of text) {
        // 4. 获取 Unicode 编码并与盐进行 XOR 运算
        const xoredCode = char.charCodeAt(0) ^ salt;
        // 5. 转换为呜哇字符串并拼接
        encryptedChars += toUwa(xoredCode);
    }
    
    // 6. 返回 盐 + 加密内容
    return uwaSalt + encryptedChars;
}

function decrypt(uwaText) {
    if (!uwaText || uwaText.length % 16 !== 0) {
        throw new Error('无效的呜哇密文或长度错误！');
    }

    // 1. 提取盐
    const uwaSalt = uwaText.substring(0, 16);
    const salt = fromUwa(uwaSalt);

    let decryptedText = '';
    // 2. 从第16位开始，以16位为一块进行遍历
    for (let i = 16; i < uwaText.length; i += 16) {
        const uwaChunk = uwaText.substring(i, i + 16);
        // 3. 将块转换回数字
        const encryptedCode = fromUwa(uwaChunk);
        // 4. 再次进行 XOR 运算以还原
        const originalCode = encryptedCode ^ salt;
        // 5. 转换回字符并拼接
        decryptedText += String.fromCharCode(originalCode);
    }
    
    return decryptedText;
}


// --- 窗口初始化和事件绑定 ---

export function initializeUwaEncryptor() {
    const encryptorWindow = document.getElementById('uwa-encryptor-window');
    if (!encryptorWindow) return;

    // 获取所有UI元素
    const inputArea = document.getElementById('uwa-input');
    const outputArea = document.getElementById('uwa-output');
    const encryptBtn = document.getElementById('uwa-encrypt-button');
    const decryptBtn = document.getElementById('uwa-decrypt-button');
    const copyBtn = document.getElementById('uwa-copy-button');
    const clearBtn = document.getElementById('uwa-clear-button');

    // 绑定加密按钮事件
    encryptBtn.addEventListener('click', () => {
        const inputText = inputArea.value;
        outputArea.value = encrypt(inputText);
    });

    // 绑定解密按钮事件
    decryptBtn.addEventListener('click', () => {
        const uwaText = inputArea.value; // 解密时，密文在输入框
        try {
            outputArea.value = decrypt(uwaText);
        } catch (error) {
            playSound('chord');
            alert(error.message);
        }
    });

    // 绑定复制按钮事件
    copyBtn.addEventListener('click', () => {
        if (!outputArea.value) return;
        navigator.clipboard.writeText(outputArea.value)
            .then(() => {
                playSound('ding'); 
                alert('结果已复制。')
            })
            .catch(err => {
                playSound('chord'); 
                alert('失败了: ' + err)
            });
    });
    
    // 绑定清空按钮事件
    clearBtn.addEventListener('click', () => {
        inputArea.value = '';
        outputArea.value = '';
    });
}