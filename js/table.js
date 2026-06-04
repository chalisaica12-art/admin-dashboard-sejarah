// ============================================================
// TABEL: FILTER, SORT, PAGINATION, RENDER
// ============================================================

// ---- GLOBAL STATE ----
const tableStates = {};

function initTableState(key) {
  if (!tableStates[key]) {
    tableStates[key] = {
      data: [],
      filtered: [],
      sortCol: null,
      sortDir: 'asc',
      page: 1,
      perPage: 10
    };
  }
  return tableStates[key];
}

function updateTableState(key, data) {
  const s = initTableState(key);
  s.data = data;
  s.filtered = [...data];
  s.page = 1;
  if (key === 'scores') renderTable(key);
  else filterTable(key);
}

// ---- FILTER ----
function filterTable(key) {
  const s = initTableState(key);
  const searchEl = document.getElementById('search-' + key);
  const searchVal = searchEl ? searchEl.value.toLowerCase() : '';

  s.filtered = s.data.filter(row => {
    const matchSearch = !searchVal || Object.values(row).some(v =>
      String(v).toLowerCase().includes(searchVal)
    );
    const filters = {
      users: () => {
        const lvl = document.getElementById('filter-users-level')?.value;
        if (!lvl) return true;
        return lvl === '5' ? (row.level >= 5) : (String(row.level) === lvl);
      },
      eras: () => {
        const lk = document.getElementById('filter-eras-locked')?.value;
        if (!lk) return true;
        return String(row.is_locked) === lk;
      },
      materials: () => {
        const era = document.getElementById('filter-materials-era')?.value;
        return !era || String(row.era_id) === era;
      },
      questions: () => {
        const era = document.getElementById('filter-questions-era')?.value;
        return !era || String(row.era_id) === era;
      },
      avatars: () => {
        const def = document.getElementById('filter-avatars-default')?.value;
        return !def || String(row.is_default) === def;
      },
      scores: () => {
        const st = document.getElementById('filter-scores-stars')?.value;
        return !st || String(row.stars_earned) === st;
      },
      progress: () => {
        const cp = document.getElementById('filter-progress-completed')?.value;
        return !cp || String(row.completed) === cp;
      },
    };
    const matchFilter = filters[key] ? filters[key]() : true;
    return matchSearch && matchFilter;
  });
  s.page = 1;
  renderTable(key);
}

// ---- SORT ----
function sortTable(key, col) {
  const s = initTableState(key);
  if (s.sortCol === col) s.sortDir = s.sortDir === 'asc' ? 'desc' : 'asc';
  else { s.sortCol = col; s.sortDir = 'asc'; }
  s.filtered.sort((a, b) => {
    let av = a[col], bv = b[col];
    if (av == null) av = '';
    if (bv == null) bv = '';
    if (!isNaN(Number(av)) && !isNaN(Number(bv))) {
      return s.sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
    }
    return s.sortDir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });
  renderTable(key);
}

// ---- PAGINATION ----
function renderPagination(key) {
  const s = initTableState(key);
  const totalPages = Math.max(1, Math.ceil(s.filtered.length / s.perPage));
  const el = document.getElementById('pagination-' + key);
  if (!el) return;
  const start = (s.page - 1) * s.perPage + 1;
  const end = Math.min(s.page * s.perPage, s.filtered.length);
  let html = `<span class="pg-info">Menampilkan ${s.filtered.length ? start : 0}–${end} dari ${s.filtered.length} data</span>`;
  html += `<div class="pg-btns">`;
  html += `<button class="pg-btn" onclick="gotoPage('${key}',${s.page - 1})" ${s.page === 1 ? 'disabled' : ''}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages <= 7 || Math.abs(i - s.page) <= 2 || i === 1 || i === totalPages) {
      html += `<button class="pg-btn ${i === s.page ? 'active' : ''}" onclick="gotoPage('${key}',${i})">${i}</button>`;
    } else if (i === s.page - 3 || i === s.page + 3) {
      html += `<button class="pg-btn" style="pointer-events:none">…</button>`;
    }
  }
  html += `<button class="pg-btn" onclick="gotoPage('${key}',${s.page + 1})" ${s.page === totalPages ? 'disabled' : ''}>›</button>`;
  html += `</div>`;
  el.innerHTML = html;
}

function gotoPage(key, page) {
  const s = initTableState(key);
  const totalPages = Math.max(1, Math.ceil(s.filtered.length / s.perPage));
  s.page = Math.max(1, Math.min(page, totalPages));
  renderTable(key);
}

// ---- HELPER ----
function shortId(id) { return id ? '…' + String(id).slice(-8) : '-'; }
function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
function starIcons(n) {
  return '<span class="material-icons" style="font-size:14px;color:#D4A017">star</span>'.repeat(n || 0) || '-';
}
function iconHtml(name, style = '') {
  return `<span class="material-icons" style="font-size:14px;${style}">${name}</span>`;
}
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
function getUserName(userId, profilesMap) {
  if (profilesMap && profilesMap[userId]) return profilesMap[userId];
  return shortId(userId);
}

// ---- RENDER ----
function renderTable(key) {
  const s = initTableState(key);
  const tbody = document.getElementById('table-' + key);
  if (!tbody) return;
  const start = (s.page - 1) * s.perPage;
  const rows = s.filtered.slice(start, start + s.perPage);

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="20">
      <div class="empty-state">
        <span class="material-icons" style="font-size:40px">inbox</span>
        <p>Tidak ada data ditemukan</p>
      </div></td></tr>`;
    renderPagination(key);
    return;
  }

  const editBtn = (tbl, id) =>
    `<button class="btn btn-secondary btn-sm" onclick="editRow('${tbl}','${id}')">${iconHtml('edit')}</button>`;
  const delBtn = (tbl, id) =>
    `<button class="btn btn-danger btn-sm" onclick="deleteRow('${tbl}','${id}')">${iconHtml('delete')}</button>`;
  const actions = (tbl, id) =>
    `<div class="td-actions">${editBtn(tbl, id)} ${delBtn(tbl, id)}</div>`;

  const renderers = {
    users: (r, i) => `<tr>
      <td class="row-num">${start + i + 1}</td>
      <td><strong>${r.name || '-'}</strong></td>
      <td style="font-size:12px;color:var(--text2)">${r.email || '-'}</td>
      <td><span class="badge badge-gold">Lv ${r.level || 0}</span></td>
      <td>${(r.xp || 0).toLocaleString()} XP</td>
      <td>${iconHtml('star', 'color:#D4A017')} ${r.stars || 0}</td>
      <td>${actions('users', r.id)}</td>
    </tr>`,

    // ✅ FIX: Hapus kolom image dari renderer eras
    eras: (r, i) => `<tr>
      <td class="row-num">${r.order_number || start + i + 1}</td>
      <td><strong>${r.title || '-'}</strong></td>
      <td><span class="badge ${r.is_locked ? 'badge-red' : 'badge-green'}">
        ${r.is_locked ? iconHtml('lock') + ' Terkunci' : iconHtml('lock_open') + ' Aktif'}
      </span></td>
      <td>${actions('eras', r.id)}</td>
    </tr>`,

    materials: (r, i) => `<tr>
      <td class="row-num">${r.order_number || start + i + 1}</td>
      <td><span class="badge badge-gold">${r.era_title || shortId(r.era_id)}</span></td>
      <td><strong>${r.title || '-'}</strong></td>
      <td>${actions('materials', r.id)}</td>
    </tr>`,

    questions: (r, i) => `<tr>
      <td class="row-num">${r.order_number || start + i + 1}</td>
      <td><span class="badge badge-gold" style="font-size:10px">${r.era_title || shortId(r.era_id)}</span></td>
      <td><span class="badge badge-blue" style="font-size:10px">${r.material_title || shortId(r.material_id)}</span></td>
      <td style="font-size:12px;max-width:180px;word-break:break-word">${r.question_text || '-'}</td>
      <td><span class="badge badge-green">${iconHtml('check')} ${r.correct_answer || '-'}</span></td>
      <td>${actions('questions', r.id)}</td>
    </tr>`,

    avatars: (r, i) => `<tr>
      <td class="row-num">${start + i + 1}</td>
      <td><strong>${r.name || '-'}</strong></td>
      <td style="font-size:11px;color:var(--text3)">${r.image_path || '-'}</td>
      <td>${iconHtml('star', 'color:#D4A017')} ${r.price_stars || 0}</td>
      <td><span class="badge ${r.is_default ? 'badge-green' : 'badge-gold'}">
        ${r.is_default ? iconHtml('check') + ' Default' : 'Premium'}
      </span></td>
      <td>${actions('avatars', r.id)}</td>
    </tr>`,

    scores: (r, i) => `<tr>
      <td class="row-num">${start + i + 1}</td>
      <td style="font-size:11px"><strong>${r.user_name || shortId(r.user_id)}</strong></td>
      <td><strong>${r.score || 0}</strong></td>
      <td>${r.correct_answers || 0}</td>
      <td>${r.total_questions || 0}</td>
      <td>${starIcons(r.stars_earned)}</td>
      <td>${formatDuration(r.duration_seconds)}</td>
      <td style="font-size:11px">${fmtDate(r.played_at)}</td>
      <td>${delBtn('quiz_scores', r.id)}</td>
    </tr>`,

    progress: (r, i) => `<tr>
      <td class="row-num">${start + i + 1}</td>
      <td style="font-size:11px;color:var(--text2)">${shortId(r.user_id)}</td>
      <td><span class="badge badge-gold">${r.era_id || '-'}</span></td>
      <td>Ch. ${r.chapter_index ?? '-'}</td>
      <td><span class="badge ${r.completed ? 'badge-green' : 'badge-red'}">
        ${r.completed
          ? iconHtml('check_circle', 'color:#065f46') + ' Selesai'
          : iconHtml('hourglass_empty', 'color:#92400e') + ' Proses'}
      </span></td>
      <td style="font-size:11px">${fmtDate(r.completed_st)}</td>
    </tr>`,
  };

  const renderer = renderers[key];
  if (renderer) tbody.innerHTML = rows.map((r, i) => renderer(r, i)).join('');
  renderPagination(key);
}