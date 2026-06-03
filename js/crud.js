// ============================================================
// CRUD — TAMBAH, EDIT, HAPUS DATA
// ============================================================

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
      { name: 'title',        label: 'Judul Era',   type: 'text',   required: true },
      { name: 'image',        label: 'Path Gambar', type: 'text' },
      { name: 'order_number', label: 'Nomor Urut',  type: 'number', required: true },
      { name: 'is_locked',    label: 'Terkunci?',   type: 'select',
        options: [{ val: 'false', lbl: 'Tidak' }, { val: 'true', lbl: 'Ya' }] },
    ]
  },
  material: {
    title: 'Tambah / Edit Materi',
    table: 'materials',
    fields: [
      { name: 'era_id',       label: 'Era',          type: 'select-era', required: true },
      { name: 'title',        label: 'Judul Materi', type: 'text',       required: true },
      { name: 'order_number', label: 'Nomor Urut',   type: 'number',     required: true },
    ]
  },
  question: {
    title: 'Tambah / Edit Soal',
    table: 'questions',
    fields: [
      { name: 'era_id',         label: 'Era',             type: 'select-era',      required: true },
      { name: 'material_id',    label: 'Materi',          type: 'select-material', required: true },
      { name: 'question_text',  label: 'Teks Pertanyaan', type: 'textarea',        required: true },
      { name: 'option_a',       label: 'Pilihan A',       type: 'text',            required: true },
      { name: 'option_b',       label: 'Pilihan B',       type: 'text',            required: true },
      { name: 'option_c',       label: 'Pilihan C',       type: 'text',            required: true },
      { name: 'option_d',       label: 'Pilihan D',       type: 'text',            required: true },
      { name: 'correct_answer', label: 'Jawaban Benar',   type: 'select',
        options: [{ val: 'A', lbl: 'A' }, { val: 'B', lbl: 'B' }, { val: 'C', lbl: 'C' }, { val: 'D', lbl: 'D' }] },
      { name: 'order_number',   label: 'Nomor Urut',      type: 'number' },
    ]
  },
  avatar: {
    title: 'Tambah / Edit Avatar',
    table: 'avatars',
    fields: [
      { name: 'name',         label: 'Nama Avatar',     type: 'text',   required: true },
      { name: 'image_path',   label: 'Path Gambar',     type: 'text' },
      { name: 'price_stars',  label: 'Harga (Bintang)', type: 'number' },
      { name: 'is_default',   label: 'Default?',        type: 'select',
        options: [{ val: 'false', lbl: 'Tidak' }, { val: 'true', lbl: 'Ya' }] },
    ]
  },
};

// ---- BUKA MODAL ----
async function openModal(type, data = null) {
  const form = FORMS[type];
  if (!form) return;
  STATE.editId = data ? data.id : null;
  STATE.editTable = type;
  document.getElementById('modal-title').textContent = form.title;
  let html = '';

  // Ambil data era untuk dropdown select-era & select-material
  let erasData = [];
  if (form.fields.some(f => f.type === 'select-era' || f.type === 'select-material')) {
    const { data: eras } = await sb.from('quizzes').select('id,title').order('order_number');
    erasData = eras || [];
  }

  for (const f of form.fields) {
    html += `<div class="form-group"><label for="mf-${f.name}">${f.label}${f.required ? ' *' : ''}</label>`;
    const val = data ? (data[f.name] ?? '') : '';

    if (f.type === 'textarea') {
      html += `<textarea id="mf-${f.name}" ${f.required ? 'required' : ''}>${val}</textarea>`;
    } else if (f.type === 'select') {
      html += `<select id="mf-${f.name}">${f.options.map(o =>
        `<option value="${o.val}" ${String(val) === o.val ? 'selected' : ''}>${o.lbl}</option>`
      ).join('')}</select>`;
    } else if (f.type === 'select-era') {
      html += `<select id="mf-${f.name}" ${f.required ? 'required' : ''} onchange="onEraSelectChange()">
        <option value="">-- Pilih Era --</option>
        ${erasData.map(e => `<option value="${e.id}" ${e.id === val ? 'selected' : ''}>${e.title}</option>`).join('')}
      </select>`;
    } else if (f.type === 'select-material') {
      // Ambil materi berdasarkan era yang dipilih
      const selectedEraId = data?.era_id || '';
      let matsData = [];
      if (selectedEraId) {
        const { data: mats } = await sb.from('materials').select('id,title').eq('era_id', selectedEraId).order('order_number');
        matsData = mats || [];
      }
      html += `<select id="mf-${f.name}" ${f.required ? 'required' : ''}>
        <option value="">-- Pilih Materi --</option>
        ${matsData.map(m => `<option value="${m.id}" ${m.id === val ? 'selected' : ''}>${m.title}</option>`).join('')}
      </select>`;
    } else {
      html += `<input type="${f.type}" id="mf-${f.name}" value="${val}" ${f.required ? 'required' : ''}>`;
    }
    html += `</div>`;
  }

  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}

// Update dropdown materi saat era berubah (khusus form question)
async function onEraSelectChange() {
  const eraEl = document.getElementById('mf-era_id');
  const matEl = document.getElementById('mf-material_id');
  if (!eraEl || !matEl) return;
  const eraId = eraEl.value;
  matEl.innerHTML = '<option value="">-- Pilih Materi --</option>';
  if (!eraId) return;
  const { data } = await sb.from('materials').select('id,title').eq('era_id', eraId).order('order_number');
  if (data) {
    matEl.innerHTML += data.map(m => `<option value="${m.id}">${m.title}</option>`).join('');
  }
}

// ---- TUTUP MODAL ----
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  STATE.editId = null;
  STATE.editTable = null;
}

// ---- SIMPAN MODAL ----
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

  // Kalau avatar di-set default, reset semua avatar lain dulu
  if (type === 'avatar' && payload.is_default === true) {
    await sb.from('avatars').update({ is_default: false }).neq('id', STATE.editId || '00000000-0000-0000-0000-000000000000');
  }

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
  const reloaders = { user: loadUsers, era: loadEras, material: loadMaterials, question: loadQuestions, avatar: loadAvatars };
  if (reloaders[type]) reloaders[type]();
}

// ---- EDIT ROW ----
async function editRow(tableKey, id) {
  const tableMap = { users: 'profiles', eras: 'quizzes', materials: 'materials', questions: 'questions', avatars: 'avatars' };
  const formMap  = { users: 'user',     eras: 'era',     materials: 'material',  questions: 'question',  avatars: 'avatar' };
  const tbl = tableMap[tableKey];
  const { data, error } = await sb.from(tbl).select('*').eq('id', id).single();
  if (error || !data) { toast('Gagal memuat data: ' + (error?.message || ''), 'error'); return; }
  openModal(formMap[tableKey], data);
}

// ---- HAPUS ROW ----
async function deleteRow(table, id) {
  const tableNames = {
    users: 'profiles', eras: 'quizzes', materials: 'materials',
    questions: 'questions', avatars: 'avatars', quiz_scores: 'quiz_scores'
  };
  const tbl = tableNames[table] || table;
  showConfirm(`Yakin ingin menghapus data ini?`, async () => {
    const { error } = await sb.from(tbl).delete().eq('id', id);
    if (error) { toast('Gagal hapus: ' + error.message, 'error'); return; }
    toast('Data berhasil dihapus!');
    const pageMap = { profiles: 'users', quizzes: 'eras', materials: 'materials', questions: 'questions', avatars: 'avatars', quiz_scores: 'scores' };
    const targetPage = pageMap[tbl] || STATE.currentPage;
    navigate(targetPage);
    const reloadMap = {
      profiles: loadUsers, quizzes: loadEras, materials: loadMaterials,
      questions: loadQuestions, avatars: loadAvatars, quiz_scores: loadScores
    };
    if (reloadMap[tbl]) reloadMap[tbl]();
  });
}