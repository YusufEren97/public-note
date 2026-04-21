const translations = {
    tr: {
        subtitle: 'Şifreli notlarınız, tek bir başlıkla güvende',
        placeholder: 'Başlık girin...',
        goBtn: 'Git',
        hint: 'Başlığınız hem adresiniz hem de anahtarınız. Unutmayın!',
        backBtn: '← Geri',
        refreshBtnTitle: 'Yenile',
        notePlaceholder: 'Notunuzu yazın...',
        footerInfo: 'Notunuz askeri düzeyde AES-256 şifrelemesiyle korunuyor. Başlığınızı sakın unutmayın!'
    },
    en: {
        subtitle: 'Your encrypted notes, secured with a single title',
        placeholder: 'Enter a title...',
        goBtn: 'Go',
        hint: 'Your title is both your address and your key. Don\'t forget it!',
        backBtn: '← Back',
        refreshBtnTitle: 'Refresh',
        notePlaceholder: 'Write your note...',
        footerInfo: 'Your note is protected with military-grade AES-256 encryption. Don\'t ever forget your title!'
    }
};

let currentLang = localStorage.getItem('lang') || 'en';

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    const langToggle = document.getElementById('lang-toggle');
    langToggle.textContent = lang === 'tr' ? 'EN' : 'TR';
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translations[lang][key]) {
            el.title = translations[lang][key];
        }
    });
}

const titleScreen = document.getElementById('title-screen');
const noteScreen = document.getElementById('note-screen');
const titleInput = document.getElementById('title-input');
const goBtn = document.getElementById('go-btn');
const backBtn = document.getElementById('back-btn');
const refreshBtn = document.getElementById('refresh-btn');
const noteContent = document.getElementById('note-content');
const currentTitle = document.getElementById('current-title');
const saveIndicator = document.getElementById('save-indicator');

let currentNoteId = null;
let currentTitleKey = null;
let saveTimeout = null;
let isSaving = false;

function generateHash(text) {
    return CryptoJS.SHA256(text).toString();
}

function encrypt(content, key) {
    return CryptoJS.AES.encrypt(content, key).toString();
}

function decrypt(encryptedContent, key) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedContent, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return '';
    }
}

async function loadNote(title) {
    const noteId = generateHash(title);
    currentNoteId = noteId;
    currentTitleKey = title;

    try {
        const response = await fetch(`api.php?id=${noteId}`);
        const data = await response.json();

        if (data.success && data.content) {
            const decrypted = decrypt(data.content, title);
            noteContent.value = decrypted;
        } else {
            noteContent.value = '';
        }
    } catch (e) {
        console.error('Error loading note:', e);
        noteContent.value = '';
    }
}

async function saveNote(title, content) {
    if (isSaving) return;

    const noteId = generateHash(title);
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
        console.error('Error saving note:', e);
    } finally {
        isSaving = false;
    }
}

function showSaveIndicator() {
    saveIndicator.classList.remove('hidden');
    setTimeout(() => {
        saveIndicator.classList.add('hidden');
    }, 2000);
}

function showScreen(screen) {
    titleScreen.classList.remove('active');
    noteScreen.classList.remove('active');
    screen.classList.add('active');
}

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

// Auto-save (debounce - 1s)
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

async function switchNote(newTitle) {
    if (!newTitle || newTitle === currentTitleKey) return;

    // Save current note first
    if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
    }
    if (currentTitleKey && noteContent.value) {
        await saveNote(currentTitleKey, noteContent.value);
    }

    currentTitle.value = newTitle;
    loadNote(newTitle);
    noteContent.focus();
}

async function goBack() {
    // Save pending changes immediately
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

async function refreshNote() {
    if (!currentTitleKey) return;

    if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
    }

    refreshBtn.classList.add('spinning');

    await loadNote(currentTitleKey);

    setTimeout(() => {
        refreshBtn.classList.remove('spinning');
    }, 500);
}

goBtn.addEventListener('click', goToNote);

titleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        goToNote();
    }
});

backBtn.addEventListener('click', goBack);
refreshBtn.addEventListener('click', refreshNote);

noteContent.addEventListener('input', handleNoteChange);

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

currentTitle.addEventListener('blur', () => {
    const newTitle = currentTitle.value.trim();
    if (newTitle && newTitle !== currentTitleKey) {
        switchNote(newTitle);
    } else if (!newTitle) {
        currentTitle.value = currentTitleKey;
    }
});

titleInput.focus();

document.getElementById('lang-toggle').addEventListener('click', () => {
    applyLanguage(currentLang === 'tr' ? 'en' : 'tr');
});

applyLanguage(currentLang);
