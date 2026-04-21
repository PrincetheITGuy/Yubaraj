window.addEventListener('DOMContentLoaded', async () => {
    const textarea = document.getElementById('note');
    const saveBtn = document.getElementById('save');
    const saveAsBtn = document.getElementById('save-as');
    const newNoteBtn = document.getElementById('new-note');
    const openFileBtn = document.getElementById('open-file');
    const saveStatus = document.getElementById('save-status');

    let lastSavedText = '';
    let currentFilePath = null;

    try {
        const savedNote = await window.electronAPI.loadNote();
        textarea.value = savedNote;
        lastSavedText = savedNote;
    } catch (error) {
        console.error('Load note error:', error);
        saveStatus.textContent = 'Error loading note.';
    }

    saveBtn.addEventListener('click', async () => {
        try {
            const result = await window.electronAPI.smartSave(textarea.value, currentFilePath);

            if (result.success) {
                currentFilePath = result.filePath;
                lastSavedText = textarea.value;
                saveStatus.textContent = `Saved successfully: ${result.filePath}`;
            }
        } catch (error) {
            console.error('Save error:', error);
            saveStatus.textContent = 'Error saving note.';
        }
    });

    saveAsBtn.addEventListener('click', async () => {
        try {
            const result = await window.electronAPI.saveAs(textarea.value);

            if (result.success) {
                currentFilePath = result.filePath;
                lastSavedText = textarea.value;
                saveStatus.textContent = `Saved as: ${result.filePath}`;
            }
        } catch (error) {
            console.error('Save As error:', error);
            saveStatus.textContent = 'Error in Save As.';
        }
    });

    newNoteBtn.addEventListener('click', async () => {
        try {
            const hasUnsavedChanges = textarea.value !== lastSavedText;

            if (!hasUnsavedChanges) {
                textarea.value = '';
                currentFilePath = null;
                saveStatus.textContent = 'Started a new note.';
                return;
            }

            const result = await window.electronAPI.newNote();

            if (result.confirmed) {
                textarea.value = '';
                currentFilePath = null;
                saveStatus.textContent = 'Started a new note.';
            }
        } catch (error) {
            console.error('New Note error:', error);
            saveStatus.textContent = 'Error creating new note.';
        }
    });

    openFileBtn.addEventListener('click', async () => {
        try {
            const result = await window.electronAPI.openFile();

            if (result.success) {
                textarea.value = result.content;
                currentFilePath = result.filePath;
                lastSavedText = result.content;
                saveStatus.textContent = `Opened: ${result.filePath}`;
            }
        } catch (error) {
            console.error('Open File error:', error);
            saveStatus.textContent = 'Error opening file.';
        }
    });
});