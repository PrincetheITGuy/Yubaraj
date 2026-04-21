const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

app.disableHardwareAcceleration();

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// default note path
function getDefaultNotePath() {
    return path.join(app.getPath('documents'), 'quicknote.txt');
}

// Save to default path or currently open file path
ipcMain.handle('smart-save', async (event, text, filePath) => {
    const targetPath = filePath || getDefaultNotePath();
    fs.writeFileSync(targetPath, text, 'utf-8');
    return { success: true, filePath: targetPath };
});

// Load default note on startup
ipcMain.handle('load-note', async () => {
    const filePath = getDefaultNotePath();

    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }

    return '';
});

// Save As
ipcMain.handle('save-as', async (event, text) => {
    const result = await dialog.showSaveDialog({
        title: 'Save Note As',
        defaultPath: 'quicknote.txt',
        filters: [
            { name: 'Text Files', extensions: ['txt'] }
        ]
    });

    if (result.canceled || !result.filePath) {
        return { success: false, canceled: true };
    }

    fs.writeFileSync(result.filePath, text, 'utf-8');
    return { success: true, filePath: result.filePath };
});

// New Note confirmation
ipcMain.handle('new-note', async () => {
    const result = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['Discard Changes', 'Cancel'],
        defaultId: 1,
        cancelId: 1,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Do you want to discard them?'
    });

    return { confirmed: result.response === 0 };
});

// Open File
ipcMain.handle('open-file', async () => {
    const result = await dialog.showOpenDialog({
        title: 'Open Note',
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] }
        ]
    });

    if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
    }

    const selectedPath = result.filePaths[0];
    const content = fs.readFileSync(selectedPath, 'utf-8');

    return {
        success: true,
        filePath: selectedPath,
        content
    };
});