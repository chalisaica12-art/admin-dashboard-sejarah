// ============================================================
// MAIN — INISIALISASI SAAT HALAMAN DIBUKA
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  checkConnection();
  loadDashboard();
});

// ============================================================
// NAVIGASI & STATE GLOBAL
// ============================================================

// State global untuk aplikasi
const STATE = {
  currentPage: 'dashboard',
  editId: null,
  editTable: null,
};

// Navigasi antar halaman
function navigate(page) {
  STATE.currentPage = page;
  
  // Sembunyikan semua halaman
  const pages = ['dashboard', 'users', 'eras', 'materials', 'questions', 'avatars', 'scores', 'progress'];
  pages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.style.display = 'none';
  });
  
  // Tampilkan halaman yang dipilih
  const activePage = document.getElementById('page-' + page);
  if (activePage) activePage.style.display = 'block';
  
  // Load data sesuai halaman
  if (page === 'users') loadUsers();
  else if (page === 'eras') loadEras();
  else if (page === 'materials') loadMaterials();
  else if (page === 'questions') loadQuestions();
  else if (page === 'avatars') loadAvatars();
  else if (page === 'scores') loadScores();
  else if (page === 'progress') loadProgress();
  else if (page === 'dashboard') loadDashboard();
}

// Cek koneksi Supabase
function checkConnection() {
  const statusEl = document.getElementById('db-status'); // FIXED: was 'connection-status'
  if (!statusEl) return;
  
  sb.from('profiles').select('id', { count: 'exact', head: true })
    .then(() => {
      statusEl.innerHTML = '<span class="material-icons" style="font-size:14px;color:#10b981">cloud_done</span> Terhubung';
      statusEl.style.background = '#d1fae5';
    })
    .catch(() => {
      statusEl.innerHTML = '<span class="material-icons" style="font-size:14px;color:#ef4444">cloud_off</span> Gagal koneksi';
      statusEl.style.background = '#fee2e2';
    });
}

// Toast notifikasi
function toast(message, type = 'success') {
  const toastEl = document.getElementById('toast');
  if (!toastEl) {
    // Buat toast element jika belum ada
    const div = document.createElement('div');
    div.id = 'toast';
    div.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:8px;z-index:9999;transition:all 0.3s;opacity:0;';
    document.body.appendChild(div);
  }
  const el = document.getElementById('toast');
  el.textContent = message;
  el.style.backgroundColor = type === 'error' ? '#ef4444' : '#10b981';
  el.style.color = 'white';
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 3000);
}

// Confirm dialog
function showConfirm(message, onConfirm) {
  if (confirm(message)) {
    onConfirm();
  }
}