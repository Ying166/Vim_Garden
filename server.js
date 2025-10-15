// server.js

// 引入我们需要的模块
const express = require('express');
const fs = require('fs');
const path = require('path');

// 初始化 express 应用
const app = express();
const PORT = 2333; // 您可以根据需要更改端口

// --- 中间件 ---
// 1. 允许服务器解析收到的 JSON 数据
app.use(express.json());
// 2. 将您的项目根目录设置为静态文件目录，这样浏览器才能访问到 home.html, style.css 等
app.use(express.static(path.join(__dirname, 'public')));

// --- API 路由 ---
// 这就是前端 fetch('/save-note') 请求的目标
app.post('/save-note', (req, res) => {
    try {
        // 从请求体中获取 name 和 message
        const { name, message } = req.body;

        // 服务器端验证
        if (!name || !message || typeof name !== 'string' || typeof message !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid data provided.' });
        }

        // --- [新增] 检查并创建 notes 目录 ---
        const notesDirectory = path.join(__dirname, 'notes');
        if (!fs.existsSync(notesDirectory)) {
            console.log("Creating 'notes' directory...");
            fs.mkdirSync(notesDirectory, { recursive: true });
        }

        // --- 文件名处理 ---
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
        const safeName = name.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 20);
        const filename = `${dateStr}_${safeName}.txt`;
        const filePath = path.join(notesDirectory, filename); // [优化] 使用已定义的目录变量

        // --- 写入文件 ---
        fs.writeFileSync(filePath, message, 'utf8');

        console.log(`Note saved: ${filename}`);

        // --- 发送成功响应 ---
        res.status(200).json({ success: true, message: 'Note saved successfully!' });

    } catch (error) {
        console.error('Error saving note:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// --- 新增 API 路由：获取内容文件 ---
// :type 和 :slug 是 URL 参数，例如 /get-content/posts/my-first-post
app.get('/get-content/:type/:slug', (req, res) => {
    const { type, slug } = req.params;

    // !! 安全性第一 !!
    // 清理输入，防止路径遍历攻击 (e.g., ../../...)
    const safeType = path.normalize(type).replace(/^(\.\.[\/\\])+/, '');
    const safeSlug = path.normalize(slug).replace(/^(\.\.[\/\\])+/, '');

    // 构建安全的文件路径
    const filePath = path.join(__dirname, 'content', safeType, `${safeSlug}.md`);

    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            // 发送纯文本内容
            res.status(200).send(content); 
        } catch (error) {
            console.error('Error reading file:', error);
            res.status(500).send('Error reading file on server.');
        }
    } else {
        res.status(404).send('File not found.');
    }
});

/**
 * 递归扫描目录并构建一个符合 VFS 格式的对象
 * @param {string} dirPath - 要扫描的目录的完整路径
 * @param {string} relativePath - 相对于 content 根目录的路径
 * @returns {object} - 一个包含文件和文件夹的对象
 */
function scanContentDirectory(dirPath, relativePath = '') {
    const structure = {};
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            structure[item] = {
                type: "folder",
                content: scanContentDirectory(itemPath, path.join(relativePath, item))
            };
        } else if (path.extname(item) === '.md') {
            const slug = path.basename(item, '.md'); // 获取不带扩展名的文件名
            structure[item] = {
                type: "file",
                app: "reader-window",
                filePath: { 
                    type: relativePath, // 文件夹名作为 type
                    slug: slug          // 文件名作为 slug
                }
            };
        }
    }
    return structure;
}

// --- 新增 API 路由：获取整个 content 文件夹的结构 ---
app.get('/api/get-content-structure', (req, res) => {
    try {
        const contentPath = path.join(__dirname, 'content');
        if (fs.existsSync(contentPath)) {
            const structure = scanContentDirectory(contentPath);
            res.status(200).json(structure);
        } else {
            res.status(404).json({ error: 'Content directory not found.' });
        }
    } catch (error) {
        console.error('Error scanning content directory:', error);
        res.status(500).json({ error: 'Server error while scanning directory.' });
    }
});

// --- 启动服务器 ---
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT},everything is fine.`);
    console.log('Powered by Ying166');
});