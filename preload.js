const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadNote: () => ipcRenderer.invoke('load-note'),
    smartSave: (text, filePath) => ipcRenderer.invoke('smart-save', text, filePath),
    saveAs: (text) => ipcRenderer.invoke('save-as', text),
    newNote: () => ipcRenderer.invoke('new-note'),
    openFile: () => ipcRenderer.invoke('open-file')
});