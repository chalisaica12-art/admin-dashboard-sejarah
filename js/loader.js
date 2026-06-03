// ============================================================
// LOADER — AMBIL DATA DARI SUPABASE
// ============================================================

async function loadDashboard() {
  const tables = ['profiles', 'quizzes', 'materials', 'questions', 'quiz_scores', 'avatars'];
  const ids = ['stat-users', 'stat-quizzes', 'stat-materials', 'stat-questions', 'stat-scores', 'stat-avatars'];
  
  for (let i = 0; i < tables.length; i++) {
    const el = document.getElementById(ids[i]);
    if (!el) continue;
    const { count, error } = await sb.from(tables[i]).select('*', { count: 'exact', head: true });
    el.textContent = error ? '?' : (count || 0).toLocaleString();
  }
  
  // Load recent scores untuk dashboard
  const { data } = await sb
    .from('quiz_scores')
    .select(`*, profiles (name)`)
    .order('played_at', { ascending: false })
    .limit(8);
    
  const tbody = document.getElementById('recent-scores');
  if (!tbody) return;
  
  if (!data || !data.length) {
    tbody.innerHTML = '<tr class="loading-row"><td colspan="7">Belum ada skor</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map((r, i) => `
    <tr>
      <td class="row-num">${i + 1}</td>
      <td style="font-size:11px"><strong>${r.profiles?.name || shortId(r.user_id)}</strong></td>
      <td><strong>${r.score || 0}</strong></td>
      <td>${r.correct_answers || 0}</td>
      <td>${r.total_questions || 0}</td>
      <td>${starIcons(r.stars_earned)}</td>
      <td style="font-size:11px">${fmtDate(r.played_at)}</td>
    </tr>
  `).join('');
}

async function loadUsers() {
  const s = initTableState('users');
  const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) { toast('Gagal memuat pengguna: ' + error.message, 'error'); return; }
  s.data = data || []; 
  s.filtered = [...s.data]; 
  s.page = 1;
  renderTable('users');
}

async function loadEras() {
  const s = initTableState('eras');
  const { data, error } = await sb.from('quizzes').select('*').order('order_number');
  if (error) { toast('Gagal memuat era: ' + error.message, 'error'); return; }
  s.data = data || []; 
  s.filtered = [...s.data]; 
  s.page = 1;
  renderTable('eras');
}

// ========== LOAD MATERIALS (TANPA IMAGE) ==========
async function loadMaterials() {
  const s = initTableState('materials');
  const { data, error } = await sb
    .from('materials')
    .select(`*, quizzes(title)`)
    .order('order_number');
    
  if (error) { toast('Gagal memuat materi: ' + error.message, 'error'); return; }
  
  const formatted = (data || []).map(m => ({
    ...m,
    era_title: m.quizzes?.title || shortId(m.era_id)
  }));
  
  s.data = formatted; 
  s.filtered = [...formatted]; 
  s.page = 1;

  // Isi dropdown filter era
  const { data: eras } = await sb.from('quizzes').select('id,title').order('order_number');
  const sel = document.getElementById('filter-materials-era');
  if (sel && eras) {
    const prev = sel.value;
    sel.innerHTML = `<option value="">Semua Era</option>` +
      eras.map(e => `<option value="${e.id}" ${e.id === prev ? 'selected' : ''}>${e.title}</option>`).join('');
  }
  renderTable('materials');
}

// Tetap ada untuk backward compat
async function loadQuizzes() { return loadMaterials(); }

async function loadQuestions() {
  const s = initTableState('questions');
  const { data, error } = await sb
    .from('questions')
    .select(`*, quizzes(title), materials(title)`)
    .order('order_number');
    
  if (error) { toast('Gagal memuat soal: ' + error.message, 'error'); return; }
  
  const formatted = (data || []).map(q => ({
    ...q,
    era_title: q.quizzes?.title || shortId(q.era_id),
    material_title: q.materials?.title || shortId(q.material_id)
  }));
  
  s.data = formatted; 
  s.filtered = [...formatted]; 
  s.page = 1;

  // Isi dropdown filter era
  const { data: eras } = await sb.from('quizzes').select('id,title').order('order_number');
  const sel = document.getElementById('filter-questions-era');
  if (sel && eras) {
    const prev = sel.value;
    sel.innerHTML = `<option value="">Semua Era</option>` +
      eras.map(e => `<option value="${e.id}" ${e.id === prev ? 'selected' : ''}>${e.title}</option>`).join('');
  }
  renderTable('questions');
}

async function loadAvatars() {
  const s = initTableState('avatars');
  const { data, error } = await sb.from('avatars').select('*').order('id');
  if (error) { toast('Gagal memuat avatar: ' + error.message, 'error'); return; }
  s.data = data || []; 
  s.filtered = [...s.data]; 
  s.page = 1;
  renderTable('avatars');
}

async function loadScores() {
  const s = initTableState('scores');
  const { data, error } = await sb
    .from('quiz_scores')
    .select(`*, profiles (name)`)
    .order('score', { ascending: false });
    
  if (error) { toast('Gagal memuat skor: ' + error.message, 'error'); return; }
  
  const formattedData = (data || []).map(item => ({
    ...item,
    user_name: item.profiles?.name || shortId(item.user_id)
  }));
  
  s.data = formattedData; 
  s.filtered = [...formattedData]; 
  s.page = 1;
  renderTable('scores');
}

async function loadProgress() {
  const s = initTableState('progress');
  const { data, error } = await sb.from('user_progress').select('*').order('completed_st', { ascending: false });
  if (error) { toast('Gagal memuat progress: ' + error.message, 'error'); return; }
  s.data = data || []; 
  s.filtered = [...s.data]; 
  s.page = 1;
  renderTable('progress');
}