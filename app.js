// DOM Elementleri
const titleScreen = document.getElementById('title-screen');
const noteScreen = document.getElementById('note-screen');
const titleInput = document.getElementById('title-input');
const goBtn = document.getElementById('go-btn');
const backBtn = document.getElementById('back-btn');
const noteContent = document.getElementById('note-content');
const currentTitle = document.getElementById('current-title');
const saveIndicator = document.getElementById('save-indicator');

// Mevcut durum
let currentNoteId = null;
let currentTitleKey = null;
let saveTimeout = null;
let isSaving = false;

// SHA-256 Hash üret (dosya adı olarak kullanılacak)
function generateHash(text) {
    return CryptoJS.SHA256(text).toString();
}

// AES-256 ile şifrele
function encrypt(content, key) {
    return CryptoJS.AES.encrypt(content, key).toString();
}

// AES-256 ile çöz
function decrypt(encryptedContent, key) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedContent, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return '';
    }
}

// Not yükle
async function loadNote(title) {
    const noteId = generateHash(title);
    currentNoteId = noteId;
    currentTitleKey = title;

    try {
        const response = await fetch(`api.php?id=${noteId}`);
        const data = await response.json();

        if (data.success && data.content) {
            // Şifreli içeriği çöz
            const decrypted = decrypt(data.content, title);
            noteContent.value = decrypted;
        } else {
            noteContent.value = '';
        }
    } catch (e) {
        console.error('Not yüklenirken hata:', e);
        noteContent.value = '';
    }
}

// Not kaydet
async function saveNote(title, content) {
    if (isSaving) return;

    const noteId = generateHash(title);

    // İçeriği şifrele
    const encrypted = encrypt(content, title);

    isSaving = true;

    try {
        const response = await fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: noteId,
                content: encrypted
            })
        });

        const data = await response.json();

        if (data.success) {
            showSaveIndicator();
        }
    } catch (e) {
        console.error('Not kaydedilirken hata:', e);
    } finally {
        isSaving = false;
    }
}

// Kayıt göstergesini göster
function showSaveIndicator() {
    saveIndicator.classList.remove('hidden');
    setTimeout(() => {
        saveIndicator.classList.add('hidden');
    }, 2000);
}

// Ekran geçişi
function showScreen(screen) {
    titleScreen.classList.remove('active');
    noteScreen.classList.remove('active');
    screen.classList.add('active');
}

// Nota git
function goToNote() {
    const title = titleInput.value.trim();
    if (!title) {
        titleInput.focus();
        return;
    }

    currentTitle.value = title;
    showScreen(noteScreen);
    loadNote(title);
    noteContent.focus();
}

// Başlık değişince nota geç
async function switchNote(newTitle) {
    if (!newTitle || newTitle === currentTitleKey) return;

    // Önce mevcut notu kaydet
    if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
    }
    if (currentTitleKey && noteContent.value) {
        await saveNote(currentTitleKey, noteContent.value);
    }

    // Yeni nota geç
    currentTitle.value = newTitle;
    loadNote(newTitle);
    noteContent.focus();
}

// Geri dön
async function goBack() {
    // Bekleyen kayıt varsa hemen kaydet
    if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
        if (currentTitleKey && noteContent.value) {
            await saveNote(currentTitleKey, noteContent.value);
        }
    }

    showScreen(titleScreen);
    titleInput.value = '';
    noteContent.value = '';
    currentNoteId = null;
    currentTitleKey = null;
    titleInput.focus();
}

// Auto-save (debounce - 1 saniye bekle)
function handleNoteChange() {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
        const title = currentTitle.value;
        const content = noteContent.value;
        saveNote(title, content);
    }, 1000);
}

// Event Listeners
goBtn.addEventListener('click', goToNote);

titleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        goToNote();
    }
});

backBtn.addEventListener('click', goBack);

noteContent.addEventListener('input', handleNoteChange);

// Başlık inputunda Enter → nota geç
currentTitle.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const newTitle = currentTitle.value.trim();
        if (newTitle) {
            switchNote(newTitle);
            currentTitle.blur();
        } else {
            currentTitle.value = currentTitleKey;
        }
    }
});

// Başlık inputu focustan çıkınca → nota geç
currentTitle.addEventListener('blur', () => {
    const newTitle = currentTitle.value.trim();
    if (newTitle && newTitle !== currentTitleKey) {
        switchNote(newTitle);
    } else if (!newTitle) {
        currentTitle.value = currentTitleKey;
    }
});

// Sayfa yüklendiğinde input'a odaklan
titleInput.focus();
