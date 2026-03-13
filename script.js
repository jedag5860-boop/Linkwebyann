// Data kredensial
const users = [
    { username: 'YANNWEB', password: 'Brian123', role: 'admin' },
    { username: 'YANN444', password: 'YANN444', role: 'user' }
];

// State aplikasi
let currentUser = null;
let cards = [];
let nextId = 1;
let editingId = null;

// Elemen DOM (sama seperti sebelumnya)
const loginContainer = document.getElementById('loginContainer');
const mainApp = document.getElementById('mainApp');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');
const userInfo = document.getElementById('userInfo');
const cardsGrid = document.getElementById('cardsGrid');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const cardTitle = document.getElementById('cardTitle');
const cardUrl = document.getElementById('cardUrl');
const addCardBtn = document.getElementById('addCardBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Fungsi localStorage
function saveCardsToStorage() {
    localStorage.setItem('dashboardCards', JSON.stringify(cards));
}

function loadCardsFromStorage() {
    const stored = localStorage.getItem('dashboardCards');
    if (stored) {
        try {
            cards = JSON.parse(stored);
            if (cards.length > 0) {
                nextId = Math.max(...cards.map(c => c.id)) + 1;
            } else {
                nextId = 1;
            }
        } catch (e) {
            console.error('Gagal memuat cards:', e);
            // fallback ke data awal
            cards = [
                { id: 1, text: 'Google', url: 'https://google.com' },
                { id: 2, text: 'YouTube', url: 'https://youtube.com' },
                { id: 3, text: 'Catatan Penting', url: '' },
            ];
            nextId = 4;
        }
    } else {
        // Data awal jika belum ada di localStorage
        cards = [
            { id: 1, text: 'Google', url: 'https://google.com' },
            { id: 2, text: 'YouTube', url: 'https://youtube.com' },
            { id: 3, text: 'Catatan Penting', url: '' },
        ];
        nextId = 4;
        saveCardsToStorage(); // simpan data awal
    }
}

// Panggil load saat halaman dimuat (sebelum login, tapi cards sudah siap)
loadCardsFromStorage();

// Render cards (sama seperti sebelumnya, tapi setelah render panggil save jika ada perubahan)
function renderCards() {
    if (!cardsGrid) return;
    cardsGrid.innerHTML = '';
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.setAttribute('data-id', card.id);

        let content = '';
        if (card.url) {
            content = `<a href="${card.url}" target="_blank" rel="noopener noreferrer">${card.text}</a>`;
        } else {
            content = `<p>${card.text}</p>`;
        }

        cardDiv.innerHTML = content;

        if (currentUser && currentUser.role === 'admin') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'card-actions';
            actionsDiv.innerHTML = `
                <button class="edit-btn" data-id="${card.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${card.id}"><i class="fas fa-trash"></i></button>
            `;
            cardDiv.appendChild(actionsDiv);
        }

        cardsGrid.appendChild(cardDiv);
    });

    if (currentUser && currentUser.role === 'admin') {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                startEditCard(id);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                deleteCard(id);
            });
        });
    }
}

// Fungsi login
function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = { username: user.username, role: user.role };
        loginContainer.style.display = 'none';
        mainApp.style.display = 'block';
        userInfo.textContent = `${user.username} (${user.role})`;
        if (user.role === 'admin') {
            menuToggle.style.display = 'block';
        } else {
            menuToggle.style.display = 'none';
        }
        renderCards();
        errorMsg.textContent = '';
    } else {
        errorMsg.textContent = 'Username atau password salah';
    }
}

loginBtn.addEventListener('click', handleLogin);
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

menuToggle.addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('active');
});

overlay.addEventListener('click', closeSidebar);

function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    resetForm();
}

function resetForm() {
    cardTitle.value = '';
    cardUrl.value = '';
    editingId = null;
    addCardBtn.textContent = 'Tambah';
    cancelEditBtn.style.display = 'none';
}

function startEditCard(id) {
    const card = cards.find(c => c.id === id);
    if (!card) return;
    editingId = id;
    cardTitle.value = card.text;
    cardUrl.value = card.url || '';
    addCardBtn.textContent = 'Update';
    cancelEditBtn.style.display = 'block';
    sidebar.classList.add('open');
    overlay.classList.add('active');
}

function deleteCard(id) {
    if (confirm('Yakin ingin menghapus kotak ini?')) {
        cards = cards.filter(c => c.id !== id);
        saveCardsToStorage(); // Simpan perubahan
        renderCards();
    }
}

function saveCard() {
    const text = cardTitle.value.trim();
    if (!text) {
        alert('Judul/teks tidak boleh kosong');
        return;
    }
    const url = cardUrl.value.trim();

    if (editingId !== null) {
        const index = cards.findIndex(c => c.id === editingId);
        if (index !== -1) {
            cards[index] = { ...cards[index], text, url: url || '' };
        }
    } else {
        const newCard = {
            id: nextId++,
            text: text,
            url: url || ''
        };
        cards.push(newCard);
    }

    saveCardsToStorage(); // Simpan perubahan
    renderCards();
    resetForm();
}

addCardBtn.addEventListener('click', saveCard);
cancelEditBtn.addEventListener('click', resetForm);

// Inisialisasi: sembunyikan menu toggle
menuToggle.style.display = 'none';