// ============================================================
// STATE GLOBAL & NAVIGASI
// ============================================================

const STATE = {
  currentPage: 'dashboard',
  tables: {},
  editId: null,
  editTable: null,
  confirmCb: null,
};

// Inisialisasi state per tabel
function initTableState(key) {
  if (!STATE.tables[key]) STATE.tables[key] = {
    data: [], filtered: [], sortCol: null, sortDir: 'asc', page: 1, perPage: 10
  };
  return STATE.tables[key];
}

// ---- NAVIGASI ----
function navigate(page) {
  // ✅ FIX: Cek apakah halaman sudah dimuat
  const targetPage = document.getElementById('page-' + page);
  if (!targetPage) {
    console.warn('Halaman belum dimuat:', page);
    return;
  }

  document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(el => el.classList.remove('active'));
  targetPage.classList.add('active');
  document.querySelectorAll('.sb-item').forEach(el => {
    if (el.getAttribute('onclick') && el.getAttribute('onclick').includes("'" + page + "'")) {
      el.classList.add('active');
    }
  });

  const titles = {
    dashboard: 'Dashboard',
    users: 'Pengguna',
    eras: 'Era Sejarah',
    quizzes: 'Kuis & Materi',
    questions: 'Soal',
    avatars: 'Avatar',
    scores: 'Skor & Leaderboard',
    progress: 'Progress Pengguna'
  };

  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titles[page] || page;

  STATE.currentPage = page;

  const loaders = {
    users: loadUsers,
    eras: loadEras,
    quizzes: loadMaterials,
    questions: loadQuestions,
    avatars: loadAvatars,
    scores: loadScores,
    progress: loadProgress,
    dashboard: loadDashboard
  };
  if (loaders[page]) loaders[page]();
}

// ---- TOAST NOTIFIKASI ----
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  const el = document.createElement('div');
  el.className = `toast-item toast-${type}`;
  el.textContent = msg;
  t.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 3000);
}

// ---- KONFIRMASI HAPUS ----
function showConfirm(msg, cb) {
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('confirm-overlay').classList.add('open');
  STATE.confirmCb = cb;
  document.getElementById('confirm-ok-btn').onclick = () => { closeConfirm(); cb(); };
}
function closeConfirm() {
  document.getElementById('confirm-overlay').classList.remove('open');
}

// ---- CEK KONEKSI SUPABASE ----
async function checkConnection() {
  const el = document.getElementById('db-status');
  if (!el) return;
  if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    el.innerHTML = '<span class="material-icons" style="font-size:14px;vertical-align:middle">warning</span> Belum Dikonfigurasi';
    el.style.background = '#fff3cd';
    el.style.color = '#856404';
    return;
  }
  try {
    const { error } = await sb.from('profiles').select('id', { count: 'exact', head: true });
    if (error) throw error;
    el.innerHTML = '<span class="material-icons" style="font-size:14px;vertical-align:middle">check_circle</span> Terhubung';
    el.style.background = '#d1fae5';
    el.style.color = '#065f46';
  } catch (e) {
    el.innerHTML = '<span class="material-icons" style="font-size:14px;vertical-align:middle">error</span> Gagal Terhubung';
    el.style.background = '#fee2e2';
    el.style.color = '#991b1b';
  }
}