// ============================================================
// LOADER — AMBIL DATA DARI SUPABASE
// ============================================================

async function loadDashboard() {
  const tables = ['profiles', 'quizzes', 'questions', 'quiz_scores', 'avatars'];
  const ids = ['stat-users', 'stat-quizzes', 'stat-questions', 'stat-scores', 'stat-avatars'];
  for (let i = 0; i < tables.length; i++) {
    const { count, error } = await sb.from(tables[i]).select('*', { count: 'exact', head: true });
    document.getElementById(ids[i]).textContent = error ? '?' : (count || 0).toLocaleString();
  }
  const { data } = await sb.from('quiz_scores').select('*').order('played_at', { ascending: false }).limit(8);
  const tbody = document.getElementById('recent-scores');
  if (!data || !data.length) {
    tbody.innerHTML = '<tr class="loading-row"><td colspan="7">Belum ada skor</td></tr>';
    return;
  }
  tbody.innerHTML = data.map((r, i) => `<tr>
    <td class="row-num">${i + 1}</td>
    <td style="font-size:11px">${shortId(r.user_id)}</td>
    <td><strong>${r.score || 0}</strong></td>
    <td>${r.correct_answers || 0}</td>
    <td>${r.total_questions || 0}</td>
    <td>${starIcons(r.stars_earned)}</td>
    <td style="font-size:11px">${fmtDate(r.played_at)}</td></tr>`).join('');
}

async function loadUsers() {
  const s = initTableState('users');
  const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) { toast('Gagal memuat pengguna: ' + error.message, 'error'); return; }
  s.data = data || []; s.filtered = [...s.data]; s.page = 1;
  renderTable('users');
}

async function loadEras() {
  const s = initTableState('eras');
  const { data, error } = await sb.from('quizzes').select('*').order('order_number');
  if (error) { toast('Gagal memuat era: ' + error.message, 'error'); return; }
  s.data = data || []; s.filtered = [...s.data]; s.page = 1;
  renderTable('eras');
}

async function loadQuizzes() {
  const s = initTableState('quizzes');
  const { data, error } = await sb.from('quizzes').select('*').order('order_number');
  if (error) { toast('Gagal memuat kuis: ' + error.message, 'error'); return; }
  s.data = data || []; s.filtered = [...s.data]; s.page = 1;
  renderTable('quizzes');
}

async function loadQuestions() {
  const s = initTableState('questions');
  const { data, error } = await sb.from('questions').select('*').order('order_num');
  if (error) { toast('Gagal memuat soal: ' + error.message, 'error'); return; }
  s.data = data || []; s.filtered = [...s.data]; s.page = 1;
  // Isi dropdown filter era secara dinamis
  const eras = [...new Set((data || []).map(q => q.era_id).filter(Boolean))];
  const sel = document.getElementById('filter-questions-era');
  if (sel) {
    const prev = sel.value;
    sel.innerHTML = `<option value="">Semua Era</option>` +
      eras.map(e => `<option value="${e}" ${e === prev ? 'selected' : ''}>${e}</option>`).join('');
  }
  renderTable('questions');
}

async function loadAvatars() {
  const s = initTableState('avatars');
  const { data, error } = await sb.from('avatars').select('*').order('id');
  if (error) { toast('Gagal memuat avatar: ' + error.message, 'error'); return; }
  s.data = data || []; s.filtered = [...s.data]; s.page = 1;
  renderTable('avatars');
}

async function loadScores() {
  const s = initTableState('scores');
  const { data, error } = await sb.from('quiz_scores').select('*').order('score', { ascending: false });
  if (error) { toast('Gagal memuat skor: ' + error.message, 'error'); return; }
  s.data = data || []; s.filtered = [...s.data]; s.page = 1;
  renderTable('scores');
}

async function loadProgress() {
  const s = initTableState('progress');
  const { data, error } = await sb.from('user_progress').select('*').order('completed_st', { ascending: false });
  if (error) { toast('Gagal memuat progress: ' + error.message, 'error'); return; }
  s.data = data || []; s.filtered = [...s.data]; s.page = 1;
  renderTable('progress');
}