// ============================================================
// CRUD — TAMBAH, EDIT, HAPUS DATA
// ============================================================

// ---- DEFINISI FORM MODAL ----
const FORMS = {
  user: {
    title: 'Tambah / Edit Pengguna',
    table: 'profiles',
    fields: [
      { name: 'name',     label: 'Nama',     type: 'text',   required: true },
      { name: 'username', label: 'Username', type: 'text',   required: true },
      { name: 'email',    label: 'Email',    type: 'email' },
      { name: 'phone',    label: 'No. HP',   type: 'text' },
      { name: 'level',    label: 'Level',    type: 'number' },
      { name: 'xp',       label: 'XP',       type: 'number' },
      { name: 'stars',    label: 'Bintang',  type: 'number' },
    ]
  },
  era: {
    title: 'Tambah / Edit Era',
    table: 'quizzes',
    fields: [
      { name: 'title',        label: 'Judul Era',    type: 'text',   required: true },
      { name: 'category',     label: 'Kategori',     type: 'text' },
      { name: 'mode',         label: 'Mode',         type: 'text' },
      { name: 'age',          label: 'Usia Target',  type: 'text' },
      { name: 'order_number', label: 'Nomor Urut',   type: 'number' },
      { name: 'is_locked',    label: 'Terkunci?',    type: 'select',
        options: [{ val: 'false', lbl: 'Tidak' }, { val: 'true', lbl: 'Ya' }] },
    ]
  },
  quiz: {
    title: 'Tambah / Edit Kuis',
    table: 'quizzes',
    fields: [
      { name: 'title',        label: 'Judul Kuis',   type: 'text',   required: true },
      { name: 'category',     label: 'Kategori',     type: 'text' },
      { name: 'mode',         label: 'Mode',         type: 'text' },
      { name: 'age',          label: 'Usia Target',  type: 'text' },
      { name: 'order_number', label: 'Nomor Urut',   type: 'number' },
      { name: 'rating',       label: 'Rating',       type: 'number' },
      { name: 'is_locked',    label: 'Terkunci?',    type: 'select',
        options: [{ val: 'false', lbl: 'Tidak' }, { val: 'true', lbl: 'Ya' }] },
    ]
  },
  question: {
    title: 'Tambah / Edit Soal',
    table: 'questions',
    fields: [
      { name: 'era_id',         label: 'Era ID',                  type: 'text',     required: true },
      { name: 'question_text',  label: 'Teks Pertanyaan',         type: 'textarea', required: true },
      { name: 'option_a',       label: 'Pilihan A',               type: 'text',     required: true },
      { name: 'option_b',       label: 'Pilihan B',               type: 'text',     required: true },
      { name: 'option_c',       label: 'Pilihan C',               type: 'text',     required: true },
      { name: 'option_d',       label: 'Pilihan D',               type: 'text',     required: true },
      { name: 'correct_answer', label: 'Jawaban Benar (A/B/C/D)', type: 'select',
        options: [{ val: 'A', lbl: 'A' }, { val: 'B', lbl: 'B' }, { val: 'C', lbl: 'C' }, { val: 'D', lbl: 'D' }] },
      { name: 'order_num',      label: 'Nomor Urut',              type: 'number' },
    ]
  },
  avatar: {
    title: 'Tambah / Edit Avatar',
    table: 'avatars',
    fields: [
      { name: 'name',         label: 'Nama Avatar',      type: 'text',   required: true },
      { name: 'image_path',   label: 'Path Gambar',      type: 'text' },
      { name: 'price_stars',  label: 'Harga (Bintang)',  type: 'number' },
      { name: 'is_default',   label: 'Default?',         type: 'select',
        options: [{ val: 'false', lbl: 'Tidak' }, { val: 'true', lbl: 'Ya' }] },
    ]
  },
};

// ---- BUKA MODAL ----
function openModal(type, data = null) {
  const form = FORMS[type];
  if (!form) return;
  STATE.editId = data ? data.id : null;
  STATE.editTable = type;
  document.getElementById('modal-title').textContent = form.title;
  let html = '';
  form.fields.forEach(f => {
    html += `<div class="form-group"><label for="mf-${f.name}">${f.label}${f.required ? ' *' : ''}</label>`;
    const val = data ? (data[f.name] ?? '') : '';
    if (f.type === 'textarea') {
      html += `<textarea id="mf-${f.name}" ${f.required ? 'required' : ''}>${val}</textarea>`;
    } else if (f.type === 'select') {
      html += `<select id="mf-${f.name}">${f.options.map(o =>
        `<option value="${o.val}" ${String(val) === o.val ? 'selected' : ''}>${o.lbl}</option>`
      ).join('')}</select>`;
    } else {
      html += `<input type="${f.type}" id="mf-${f.name}" value="${val}" ${f.required ? 'required' : ''}>`;
    }
    html += `</div>`;
  });
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}

// ---- TUTUP MODAL ----
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  STATE.editId = null;
  STATE.editTable = null;
}

// ---- SIMPAN MODAL (INSERT / UPDATE) ----
async function saveModal() {
  const type = STATE.editTable;
  const form = FORMS[type];
  if (!form) return;
  const payload = {};
  for (const f of form.fields) {
    const el = document.getElementById('mf-' + f.name);
    if (!el) continue;
    let val = el.value.trim();
    if (f.required && !val) {
      toast('Field "' + f.label + '" wajib diisi!', 'error');
      el.focus(); return;
    }
    if (f.type === 'number') val = val === '' ? null : Number(val);
    else if (f.type === 'select' && (f.name === 'is_locked' || f.name === 'is_default')) val = val === 'true';
    payload[f.name] = val;
  }
  const btn = document.getElementById('modal-save-btn');
  btn.innerHTML = '<span class="material-icons" style="font-size:15px;vertical-align:middle">hourglass_empty</span> Menyimpan...';
  btn.disabled = true;
  let error;
  if (STATE.editId) {
    ({ error } = await sb.from(form.table).update(payload).eq('id', STATE.editId));
  } else {
    ({ error } = await sb.from(form.table).insert(payload));
  }
  btn.innerHTML = '<span class="material-icons" style="font-size:15px;vertical-align:middle">save</span> Simpan';
  btn.disabled = false;
  if (error) { toast('Gagal menyimpan: ' + error.message, 'error'); return; }
  toast(STATE.editId ? 'Data berhasil diperbarui!' : 'Data berhasil ditambahkan!');
  closeModal();
  const reloaders = { user: loadUsers, era: loadEras, quiz: loadQuizzes, question: loadQuestions, avatar: loadAvatars };
  if (reloaders[type]) reloaders[type]();
}

// ---- EDIT ROW ----
async function editRow(tableKey, id) {
  const tableMap = { users: 'profiles', eras: 'quizzes', quizzes: 'quizzes', questions: 'questions', avatars: 'avatars' };
  const formMap  = { users: 'user',     eras: 'era',     quizzes: 'quiz',    questions: 'question',  avatars: 'avatar' };
  const tbl = tableMap[tableKey];
  const { data, error } = await sb.from(tbl).select('*').eq('id', id).single();
  if (error || !data) { toast('Gagal memuat data: ' + (error?.message || ''), 'error'); return; }
  openModal(formMap[tableKey], data);
}

// ---- HAPUS ROW ----
async function deleteRow(table, id) {
  const tableNames = {
    users: 'profiles', eras: 'quizzes', quizzes: 'quizzes',
    questions: 'questions', avatars: 'avatars', quiz_scores: 'quiz_scores'
  };
  const tbl = tableNames[table] || table;
  showConfirm(`Yakin ingin menghapus data dengan ID: ${shortId(id)}?`, async () => {
    const { error } = await sb.from(tbl).delete().eq('id', id);
    if (error) { toast('Gagal hapus: ' + error.message, 'error'); return; }
    toast('Data berhasil dihapus!');
    const pageMap = { profiles: 'users', quizzes: 'eras', questions: 'questions', avatars: 'avatars', quiz_scores: 'scores' };
    navigate(pageMap[tbl] || STATE.currentPage);
  });
}