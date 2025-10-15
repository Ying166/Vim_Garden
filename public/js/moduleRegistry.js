// public/js/moduleRegistry.js

// 1. 导入所有窗口模块的特定初始化函数
import { initializeAboutWindow } from './modules/aboutMe.js';
import { initializeDisplayProperties } from './modules/display.js';
import { initializeExplorer } from './modules/myComputer.js';
import { initializeHelpWindow } from './modules/help.js';
import { initializeNotepad } from './modules/notepad.js';
import { initializeReader } from './modules/reader.js'; 
import { initializeUwaEncryptor } from './modules/uwaEncryptor.js';

// 2. 创建一个“注册表”或“地图”
// 这个对象将窗口的 ID 与其对应的初始化函数关联起来。
export const windowInitializers = {
    'about-me-window': initializeAboutWindow,
    'my-projects-window': initializeHelpWindow,
    'display-properties-window': initializeDisplayProperties,
    'notepad-window': initializeNotepad,
    'my-computer-window': initializeExplorer,
    'reader-window': initializeReader,
    'uwa-encryptor-window': initializeUwaEncryptor,
    // 当你未来添加新应用时，只需在这里添加一行即可
};

// 3. 这个文件不需要默认导出，它只提供上面的具名导出