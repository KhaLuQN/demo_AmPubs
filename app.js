/* ============================================================
   AM_PUB mockup — shared render + interactions (demo only)
   Không gọi API. Data giả lấy cảm hứng từ sheet "Theo dõi chốt số Pub".
   ============================================================ */

/* ── Theme toggle (persist) ───────────────────────────────── */
const THEME_KEY = 'lm_theme';
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.classList.toggle('light', saved === 'light');
  updateThemeBtn();
}
function toggleTheme() {
  const light = document.documentElement.classList.toggle('light');
  localStorage.setItem(THEME_KEY, light ? 'light' : 'dark');
  updateThemeBtn();
}
function updateThemeBtn() {
  const b = document.getElementById('themeBtn');
  if (b) b.textContent = document.documentElement.classList.contains('light') ? '🌙' : '☀️';
}

/* ── money ────────────────────────────────────────────────── */
const fmt = (n) => n == null ? '—' :
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── Sidebar shell ────────────────────────────────────────── */
const ICONS = {
  settle: '<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="12" y="6" width="3" height="11"/><rect x="17" y="13" width="3" height="4"/>',
  payout: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  book:   '<path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z"/><path d="M8 8h8M8 12h6"/>',
  dash:   '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
};
const NAV = [
  { icon: 'settle', label: 'Chốt số Pub', badge: 3, key: 'settle', href: 'index.html' },
  { icon: 'payout', label: 'Lệnh chi',    key: 'payout' },
  { icon: 'book',   label: 'Công nợ Pub', key: 'congno', href: 'cong-no.html' },
  { icon: 'dash',   label: 'Dashboard',   key: 'dash' },
];
function renderShell(active) {
  const nav = NAV.map(n => `
    <div class="sb-link ${n.key === active ? 'active' : ''}" onclick="${n.href ? `location.href='${n.href}'` : `stub('Trang &quot;${n.label}&quot; — ngoài phạm vi bản demo này')`}">
      <svg class="sb-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[n.icon]}</svg>
      <span class="sb-label">${n.label}</span>
      ${n.badge ? `<span class="sb-badge">${n.badge}</span>` : ''}
    </div>`).join('');
  return `
  <aside class="sidebar">
    <div class="sb-logo">
      <span class="logo-mark">L</span>
      <div class="logo-text"><b>LEADSMAX</b><small>Quyết toán</small></div>
    </div>
    <nav class="sb-nav">${nav}</nav>
    <div class="sb-footer">
      <div class="sb-actions">
        <button class="sb-action-btn" title="Thông báo" onclick="stub('Thông báo')">🔔</button>
        <button class="sb-action-btn" id="themeBtn" title="Đổi nền sáng/tối" onclick="toggleTheme()">☀️</button>
        <button class="sb-action-btn" title="Thu gọn" onclick="stub('Thu gọn menu')">«</button>
      </div>
      <div class="user-chip" onclick="stub('Hồ sơ / Đăng xuất')">
        <span class="user-avatar">Q</span>
        <span class="user-name">Quinn</span>
        <span class="role-badge role-badge--afm">AFM</span>
      </div>
    </div>
  </aside>`;
}

/* ── DATA: bảng chốt số Pub (T7/2026) ─────────────────────────
   state: none | expected | partial | booked | cancel
   Bối cảnh: mỗi dòng = 1 pub chạy 1 offer (offer thuộc đúng 1 ADV).
   Trạng thái kế thừa từ record ADV bên module AM ADV.
──────────────────────────────────────────────────────────────*/
const ROWS = [
  // Record ADV "Fluent" · TT 1 PHẦN → mở drawer giải ngân (key: fluent)
  { pub: '(73) Abby Yang',       offer: 'Rewards US - Apple Pay $750 - CPL', oid: '#5521', adv: 'Fluent',
    payout: 430.00, earn: 129.00, state: 'partial', rec: 'fluent' },
  { pub: '(60) koashadvertising', offer: 'Rewards US - Apple Pay $750 - CPL', oid: '#5521', adv: 'Fluent',
    payout: 270.00, earn: 81.00, state: 'partial', rec: 'fluent' },
  { pub: '(18) Magic Find',      offer: 'Rewards US - Apple Pay $500 - CPL', oid: '#5498', adv: 'Fluent',
    payout: 510.00, earn: 153.00, state: 'partial', rec: 'fluent' },
  { pub: '(30) Thuy Nguyen',     offer: 'Rewards US - Apple Pay $1000 - CPL', oid: '#5530', adv: 'Fluent',
    payout: 360.00, earn: 108.00, state: 'booked', book: 360.00, bookDate: '14/07' },

  // Đã vào sổ (record ĐÃ THANH TOÁN)
  { pub: '(30) Thuy Nguyen',     offer: 'Money.com Auto Insurance - Revshare', oid: '#4471', adv: 'Axad Capital',
    payout: 2209.48, earn: 946.92, state: 'booked', book: 2209.48, bookDate: '09/07' },
  { pub: '(36) checkweb.us',     offer: 'Eluminus - Online Degree - CPS', oid: '#3310', adv: 'IEIM Corp',
    payout: 103.43, earn: 44.33, state: 'booked', book: 103.43, bookDate: '09/07' },

  // Dự kiến (đã chốt khớp, chờ ADV thanh toán)
  { pub: '(56) Trackon Ads',     offer: 'Hello Genius Auto Insurance - CPA', oid: '#2208', adv: 'Diablo',
    payout: 157.50, earn: 82.50, state: 'expected' },
  { pub: '(18) Magic Find',      offer: 'One Loan Stop - Revshare', oid: '#1180', adv: 'Leap Theory',
    payout: 66.47, earn: 28.49, state: 'expected' },
  { pub: '(45) One Pride Group', offer: 'MyReliableFund - Revshare', oid: '#2245', adv: 'Vellko Media',
    payout: 31.51, earn: 13.50, state: 'expected' },

  // Chưa có số (record ADV chưa chốt / lệch chờ KTV khớp số) — payout chưa chụp
  { pub: '(24) Justin Moore',    offer: 'Consumer Test Connect - CashApp - CPA', oid: '#6104', adv: 'Shopgala',
    payout: null, live: 98.80, state: 'none', why: 'ADV chưa chốt số' },
  { pub: '(49) Kmfinfotech',     offer: 'Five CBD - CPS', oid: '#1042', adv: 'Katalys',
    payout: null, live: 267.02, state: 'none', why: 'Số ADV chốt lệch Affise — chờ KTV khớp số' },

  // Hủy (record ADV TRỪ HẾT — ADV không trả)
  { pub: '(39) none.com',        offer: 'Casino Push VN - CPA', oid: '#7745', adv: 'Whaaatads',
    payout: 88.00, earn: 35.20, state: 'cancel', why: 'ADV báo fraud toàn bộ traffic, không thanh toán (AM ADV: Đạt)' },
];

const STATE_META = {
  none:     { dot: 's-none',     label: 'Chưa có số' },
  expected: { dot: 's-expected', label: 'Dự kiến' },
  partial:  { dot: 's-partial',  label: 'Chờ giải ngân' },
  booked:   { dot: 's-booked',   label: 'Đã vào sổ' },
  cancel:   { dot: 's-cancel',   label: 'Hủy' },
};
const CHIPS = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'none',     label: 'Chưa có số' },
  { key: 'expected', label: 'Dự kiến' },
  { key: 'partial',  label: 'Chờ giải ngân' },
  { key: 'booked',   label: 'Đã vào sổ' },
  { key: 'cancel',   label: 'Hủy' },
];
let activeChip = 'all';

/* ── Summary band (việc hôm nay — xuyên kỳ) ───────────────── */
function renderSummary() {
  const expected = ROWS.filter(r => r.state === 'expected').reduce((s, r) => s + (r.payout || 0), 0);
  const booked   = ROWS.filter(r => r.state === 'booked').reduce((s, r) => s + (r.book || 0), 0);
  const partialRecords = new Set(ROWS.filter(r => r.state === 'partial').map(r => r.rec)).size;
  const cancel   = ROWS.filter(r => r.state === 'cancel').reduce((s, r) => s + (r.payout || 0), 0);
  return `
  <div class="summary-band">
    <div class="sb-cell">
      <div class="sb-lbl"><span class="sb-dot s-expected"></span> Dự kiến</div>
      <div class="sb-val mono">${fmt(expected)}</div>
      <div class="sb-sub">đã chụp số, chờ ADV trả</div>
    </div>
    <div class="sb-cell ok">
      <div class="sb-lbl"><span class="sb-dot s-booked"></span> Đã vào sổ</div>
      <div class="sb-val mono">${fmt(booked)}</div>
      <div class="sb-sub">tích lũy tháng này</div>
    </div>
    <div class="sb-cell hot sb-link" onclick="filterChip('partial')">
      <div class="sb-lbl"><span class="sb-dot s-partial"></span> ⚡ Chờ giải ngân</div>
      <div class="sb-val">${partialRecords} <span style="font-size:14px">record</span></div>
      <div class="sb-sub">ADV trả thiếu — cần chọn dòng chi</div>
    </div>
    <div class="sb-cell sb-link" onclick="filterChip('cancel')">
      <div class="sb-lbl"><span class="sb-dot s-cancel"></span> Bị hủy</div>
      <div class="sb-val mono">${fmt(cancel)}</div>
      <div class="sb-sub">cần báo pub</div>
    </div>
    <div class="sb-cell sb-link" onclick="location.href='cong-no.html'">
      <div class="sb-lbl">💸 Pub đủ điều kiện chi</div>
      <div class="sb-val">4 <span style="font-size:14px">pub</span></div>
      <div class="sb-sub">balance ≥ $100 · Công nợ Pub ▸</div>
    </div>
  </div>`;
}

/* ── Toolbar + chips ──────────────────────────────────────── */
function renderToolbar() {
  return `
  <div class="toolbar">
    <button class="btn btn-refresh" onclick="stub('Đồng bộ số Affise')">↻ Làm mới</button>
    <div class="month-nav">
      <button onclick="stub('Tháng trước')">‹</button>
      <span class="mn-label">T7/2026</span>
      <button onclick="stub('Tháng sau')">›</button>
    </div>
    <button class="btn btn-export" style="margin-left:auto" onclick="stub('Xuất Excel')">📥 Xuất Excel</button>
  </div>
  <div class="chips-row">
    <div class="seg-chips" id="chips"></div>
    <div class="search-box" style="margin-left:auto">
      <span>🔍</span><input placeholder="Tìm pub / offer…" oninput="onSearch(this.value)">
    </div>
  </div>`;
}
function renderChips() {
  const counts = {};
  CHIPS.forEach(c => counts[c.key] = c.key === 'all' ? ROWS.length : ROWS.filter(r => r.state === c.key).length);
  document.getElementById('chips').innerHTML = CHIPS.map(c => `
    <button class="seg-chip ${c.key === activeChip ? 'active' : ''}" onclick="filterChip('${c.key}')">
      ${c.label} <span class="cnt">${counts[c.key]}</span>
    </button>`).join('');
}
let searchTerm = '';
function onSearch(v) { searchTerm = v.trim().toLowerCase(); renderTable(); }
function filterChip(k) { activeChip = k; renderChips(); renderTable(); }

/* ── Bảng chốt số ─────────────────────────────────────────── */
function renderTable() {
  const rows = ROWS.filter(r =>
    (activeChip === 'all' || r.state === activeChip) &&
    (!searchTerm || (r.pub + r.offer + r.adv).toLowerCase().includes(searchTerm))
  );
  const body = rows.map(r => {
    const m = STATE_META[r.state];
    const payoutCell = r.payout == null
      ? `<span class="dim-i">${fmt(r.live)}</span><div class="sub-book">live · chưa chụp</div>`
      : `<span class="money-strong">${fmt(r.payout)}</span>`;
    let bookCell = '<span class="dim">—</span>';
    if (r.state === 'booked') bookCell = `<span class="money-strong" style="color:var(--lm-success-text)">${fmt(r.book)}</span><div class="sub-book">${r.bookDate}</div>`;
    else if (r.state === 'partial') bookCell = `<span class="dim">$0.00</span><div class="sub-remain">chờ chọn chi</div>`;

    let statusCell;
    if (r.state === 'partial')
      statusCell = `<span class="status-pill pill-warn"><span class="sdot ${m.dot}"></span>⚠ ${m.label}</span>`;
    else if (r.state === 'cancel')
      statusCell = `<span class="status-pill" title="${r.why}"><span class="sdot ${m.dot}"></span><span class="pill-help">✕ ${m.label}</span></span>`;
    else if (r.state === 'none')
      statusCell = `<span class="status-pill" title="${r.why}"><span class="sdot ${m.dot}"></span><span class="pill-help">${m.label}</span></span>`;
    else
      statusCell = `<span class="status-pill"><span class="sdot ${m.dot}"></span>${m.label}</span>`;

    const clickable = r.state === 'partial';
    const onclick = clickable ? `onclick="openDrawer('${r.rec}')"` : '';
    const menu = clickable
      ? `<button class="row-menu" title="Giải ngân" onclick="event.stopPropagation();openDrawer('${r.rec}')">⋯</button>`
      : `<button class="row-menu" title="Xem Công nợ Pub" onclick="event.stopPropagation();gotoCongNo('${r.pub}')">⋯</button>`;

    return `
    <tr class="${clickable ? 'row-act' : ''} ${r.state === 'cancel' ? 'row-cancel' : ''}" ${onclick}>
      <td class="col-pub"><span class="c-pub" style="cursor:pointer;border-bottom:1px dotted var(--lm-border-strong)" onclick="event.stopPropagation();gotoCongNo('${r.pub}')" title="Xem Công nợ / sổ tích lũy pub">${r.pub}</span></td>
      <td class="col-offer"><span class="c-offer-name">${r.offer}</span><span class="c-offer-id">${r.oid}</span></td>
      <td class="col-adv"><span class="c-adv">${r.adv}</span></td>
      <td class="col-money">${payoutCell}</td>
      <td class="col-money"><span class="dim mono">${fmt(r.earn)}</span></td>
      <td class="col-money">${bookCell}</td>
      <td class="col-status">${statusCell}</td>
      <td class="col-act">${menu}</td>
    </tr>`;
  }).join('');

  const totalPayout = rows.reduce((s, r) => s + (r.payout || 0), 0);
  const totalBook   = rows.reduce((s, r) => s + (r.book || 0), 0);

  document.getElementById('tableCard').innerHTML = `
    <div class="table-hd">
      <span class="table-title">Chốt số Pub — theo pub × offer</span>
      <span class="table-meta">${rows.length} dòng · grain: 1 dòng = 1 pub chạy 1 offer</span>
    </div>
    <div class="table-wrap">
      <table class="st">
        <thead><tr>
          <th class="col-pub">PUB</th>
          <th class="col-offer">OFFER</th>
          <th class="col-adv">ADV <span class="dim" style="font-weight:400">(suy từ offer)</span></th>
          <th class="col-money th-in">PAYOUT (chốt)</th>
          <th class="col-money">EARNING</th>
          <th class="col-money">ĐÃ VÀO SỔ</th>
          <th class="col-status">TRẠNG THÁI</th>
          <th class="col-act"></th>
        </tr></thead>
        <tbody>${body || `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--lm-text-dim)">Không có dòng khớp bộ lọc.</td></tr>`}</tbody>
        <tfoot><tr>
          <td colspan="3"><span class="tfoot-label">Tổng ${rows.length} dòng đang hiển thị</span></td>
          <td class="col-money">${fmt(totalPayout)}</td>
          <td class="col-money"></td>
          <td class="col-money">${fmt(totalBook)}</td>
          <td colspan="2"></td>
        </tr></tfoot>
      </table>
    </div>`;
}

/* ── DATA: drawer giải ngân (record ADV "Fluent") ─────────── */
const DISBURSE = {
  fluent: {
    adv: 'Fluent', period: 'T7/2026', amAdv: 'Helen',
    reason: 'ADV giữ 30% do nghi fraud offer #5521, hẹn trả nốt trong T8/2026.',
    paid: 1400.00,          // ADV thực trả (của record này)
    chot: 2000.00,          // số ADV chốt
    done: [                 // đã giải ngân đợt trước (+PARTIAL) — khóa, chỉ xem
      { pub: '(30) Thuy Nguyen', offer: 'Rewards US - Apple Pay $1000 - CPL #5530', amt: 360.00, date: '14/07' },
      { pub: '(73) Abby Yang',   offer: 'Rewards US - Apple Pay $1000 - CPL #5530', amt: 240.00, date: '14/07' },
    ],
    open: [                 // dòng chờ giải ngân (tick được)
      { id: 'o1', pub: '(73) Abby Yang',       offer: 'Rewards US - Apple Pay $750 - CPL #5521', amt: 430.00 },
      { id: 'o2', pub: '(60) koashadvertising', offer: 'Rewards US - Apple Pay $750 - CPL #5521', amt: 270.00 },
      { id: 'o3', pub: '(18) Magic Find',      offer: 'Rewards US - Apple Pay $500 - CPL #5498', amt: 510.00 },
    ],
  },
};
let drawerRec = null;
const checked = new Set();

function buildDrawer(recKey) {
  const d = DISBURSE[recKey];
  const doneSum = d.done.reduce((s, x) => s + x.amt, 0);
  const remaining = d.paid - doneSum;

  const doneRows = d.done.map(x => `
    <div class="disb-row done">
      <div class="dcheck">✓</div>
      <div class="disb-main">
        <div class="disb-offer">${x.offer}</div>
        <div class="disb-meta"><b class="pub-tag" style="color:var(--lm-text-secondary)">${x.pub}</b></div>
      </div>
      <div style="text-align:right">
        <div class="disb-amt">${fmt(x.amt)}</div>
        <div class="disb-flag ok">đã vào sổ ${x.date}</div>
      </div>
    </div>`).join('');

  const openRows = d.open.map(o => `
    <div class="disb-row" id="row-${o.id}" data-amt="${o.amt}" onclick="toggleRow('${o.id}')">
      <div class="dcheck">✓</div>
      <div class="disb-main">
        <div class="disb-offer">${o.offer}</div>
        <div class="disb-meta"><b class="pub-tag">${o.pub}</b></div>
      </div>
      <div style="text-align:right">
        <div class="disb-amt">${fmt(o.amt)}</div>
        <div class="disb-flag" id="flag-${o.id}"></div>
      </div>
    </div>`).join('');

  return `
  <div class="dwr-scrim" id="scrim" onclick="if(event.target===this)closeDrawer()">
    <aside class="dwr">
      <header class="dwr__hd">
        <div>
          <h3 class="dwr__title">Giải ngân tay — ${d.adv} · ${d.period}</h3>
          <div class="dwr__sub">
            <span class="status-pill pill-warn"><span class="sdot s-partial"></span>Record ADV · TT 1 PHẦN</span>
            · AM ADV: <b style="color:var(--lm-text-secondary)">${d.amAdv}</b>
          </div>
        </div>
        <button class="dwr__x" onclick="closeDrawer()">×</button>
      </header>
      <div class="dwr__body">
        <div class="reason-box">
          <div class="rb-lbl">⚠ Lý do từ AM ADV (${d.amAdv})</div>
          <div class="rb-txt">"${d.reason}"</div>
        </div>

        <div class="limit-card">
          <div class="limit-row"><span class="lk">ADV thực trả (record này)</span><span class="lv mono">${fmt(d.paid)}</span></div>
          <div class="limit-row"><span class="lk">Đã giải ngân đợt trước</span><span class="lv mono">−${fmt(doneSum)}</span></div>
          <div class="limit-row remain"><span class="lk">Còn được giải ngân</span><span class="lv mono" id="remainVal">${fmt(remaining)}</span></div>
          <div class="bar"><div class="bar-fill" id="bar" style="width:0%"></div></div>
        </div>
        <div class="limit-note">ⓘ Hạn mức chung cho MỌI pub chạy record này — không riêng 1 pub. Tick vượt hạn mức sẽ bị khóa.</div>

        <div class="disb-group">
          <div class="disb-group-hd">✓ ĐÃ VÀO SỔ ĐỢT TRƯỚC (chỉ xem)</div>
          ${doneRows}
        </div>
        <div class="disb-group">
          <div class="disb-group-hd">CHỜ GIẢI NGÂN — tick dòng ưu tiên</div>
          ${openRows}
        </div>
      </div>
      <footer class="dwr__ft">
        <div class="ft-sum" id="ftSum">Đã chọn <b>$0.00</b> / còn ${fmt(remaining)}</div>
        <div class="ft-actions">
          <button class="btn btn-secondary" onclick="closeDrawer()">Hủy</button>
          <button class="btn btn-primary" id="confirmBtn" disabled onclick="doDisburse()">✓ Vào sổ</button>
        </div>
      </footer>
    </aside>
  </div>`;
}

function openDrawer(recKey) {
  drawerRec = recKey;
  checked.clear();
  document.getElementById('drawerHost').innerHTML = buildDrawer(recKey);
  document.body.style.overflow = 'hidden';
  recomputeDrawer();
}
function closeDrawer() {
  document.getElementById('drawerHost').innerHTML = '';
  document.body.style.overflow = '';
  drawerRec = null;
}
function toggleRow(id) {
  const d = DISBURSE[drawerRec];
  const row = d.open.find(o => o.id === id);
  if (checked.has(id)) checked.delete(id);
  else {
    // chặn cứng: tick vượt hạn mức thì không cho
    const doneSum = d.done.reduce((s, x) => s + x.amt, 0);
    const remaining = d.paid - doneSum;
    const cur = [...checked].reduce((s, k) => s + d.open.find(o => o.id === k).amt, 0);
    if (cur + row.amt > remaining + 0.001) { toast('Vượt hạn mức còn lại — không thể chọn dòng này'); return; }
    checked.add(id);
  }
  recomputeDrawer();
}
function recomputeDrawer() {
  const d = DISBURSE[drawerRec];
  const doneSum = d.done.reduce((s, x) => s + x.amt, 0);
  const remaining = d.paid - doneSum;
  const cur = [...checked].reduce((s, k) => s + d.open.find(o => o.id === k).amt, 0);

  d.open.forEach(o => {
    const el = document.getElementById('row-' + o.id);
    const flag = document.getElementById('flag-' + o.id);
    const isChk = checked.has(o.id);
    const wouldExceed = !isChk && (cur + o.amt > remaining + 0.001);
    el.classList.toggle('checked', isChk);
    el.classList.toggle('locked', wouldExceed);
    flag.textContent = wouldExceed ? '🔒 vượt hạn mức' : '';
  });

  const pct = Math.min(100, (cur / remaining) * 100);
  document.getElementById('bar').style.width = pct + '%';
  const over = cur > remaining + 0.001;
  const ft = document.getElementById('ftSum');
  ft.className = 'ft-sum' + (over ? ' bad' : '');
  ft.innerHTML = `Đã chọn <b>${fmt(cur)}</b> / còn ${fmt(remaining)} ${cur > 0 && !over ? '✓' : ''}`;
  const btn = document.getElementById('confirmBtn');
  btn.disabled = cur <= 0 || over;
  btn.textContent = checked.size ? `✓ Vào sổ ${checked.size} dòng` : '✓ Vào sổ';
}
function doDisburse() {
  const n = checked.size;
  const d = DISBURSE[drawerRec];
  const cur = [...checked].reduce((s, k) => s + d.open.find(o => o.id === k).amt, 0);
  closeDrawer();
  toast(`Đã ghi sổ +PARTIAL ${n} dòng — tổng ${fmt(cur)} (demo)`, true);
}

/* ── DATA: sổ tích lũy per pub (append-only) ───────────────── */
const PUBS = {
  '(18) Magic Find': {
    am: 'Quinn', pay: 'Payoneer · lovemejt@gmail.com', expected: 255.48,
    ledger: [
      { date: '14/05/2026', type: 'accrual',  desc: 'Tích lũy T4/2026 · Fluent',            note: 'ADV đã thanh toán đủ', amt: 620.00 },
      { date: '12/06/2026', type: 'accrual',  desc: 'Tích lũy T5/2026 · Diablo',            note: 'ADV đã thanh toán đủ', amt: 540.00 },
      { date: '20/06/2026', type: 'deduct',   desc: 'Trừ fraud offer #5521',                orig: 'T4/2026', note: 'AM ADV: Đạt — ADV reject traffic', amt: -180.00 },
      { date: '28/06/2026', type: 'payout',   desc: 'Lệnh chi #PO-0142 · Payoneer',         note: 'AM Pub tạo lệnh', amt: -900.00 },
      { date: '02/07/2026', type: 'reversal', desc: 'KT hủy lệnh #PO-0142',                 note: 'Lệch phí bank/tỷ giá — trả về balance', amt: 900.00 },
      { date: '14/07/2026', type: 'partial',  desc: 'Giải ngân tay T7/2026 · Fluent',       note: 'ADV trả 1 phần — AM chọn chi', amt: 360.00 },
    ],
  },
  '(30) Thuy Nguyen': {
    am: 'Quinn', pay: 'Payoneer · zaidalqassaba@gmail.com', expected: 0,
    ledger: [
      { date: '10/05/2026', type: 'accrual', desc: 'Tích lũy T4/2026 · Axad Capital', note: 'Money.com Auto Insurance', amt: 2209.48 },
      { date: '11/06/2026', type: 'accrual', desc: 'Tích lũy T5/2026 · Axad Capital', note: 'ADV đã thanh toán đủ', amt: 540.00 },
      { date: '18/06/2026', type: 'deduct',  desc: 'Trừ reject muộn', orig: 'T5/2026', note: 'AM ADV: Helen', amt: -120.00 },
    ],
  },
  '(73) Abby Yang': {
    am: 'Susan', pay: 'PayPal · abbyyang@financefer.com', expected: 430.00,
    ledger: [
      { date: '14/06/2026', type: 'accrual', desc: 'Tích lũy T5/2026 · Fluent', note: 'Rewards US - Apple Pay', amt: 296.00 },
    ],
  },
  '(56) Trackon Ads': {
    am: 'Susan', pay: 'Payoneer · Sanjaysingh9787@gmail.com', expected: 0,
    ledger: [
      { date: '13/06/2026', type: 'accrual', desc: 'Tích lũy T5/2026 · Diablo', note: 'Hello Genius Auto Insurance', amt: 157.50 },
    ],
  },
  '(36) checkweb.us': {
    am: 'Quinn', pay: 'Payoneer · support@topadsweb.com', expected: 60.00,
    ledger: [
      { date: '09/05/2026', type: 'accrual', desc: 'Tích lũy T4/2026 · IEIM Corp', note: 'Eluminus - Online Degree', amt: 1558.08 },
      { date: '25/06/2026', type: 'payout',  desc: 'Lệnh chi #PO-0138 · Payoneer', note: 'AM Pub tạo lệnh', amt: -1500.00 },
    ],
  },
  '(50) Azman Ahmad': {
    am: 'Susan', pay: 'Payoneer · azman.a@gmail.com', expected: 0,
    ledger: [
      { date: '12/06/2026', type: 'accrual', desc: 'Tích lũy T5/2026 · Vellko Media', note: '', amt: 1141.85 },
      { date: '30/06/2026', type: 'payout',  desc: 'Lệnh chi #PO-0145', note: 'AM Pub tạo lệnh', amt: -1088.30 },
    ],
  },
  '(45) One Pride Group': {
    am: 'Quinn', pay: 'finance@onepride-group.com', expected: 31.51,
    ledger: [
      { date: '14/06/2026', type: 'accrual', desc: 'Tích lũy T5/2026 · Vellko Media', note: 'MyReliableFund - Revshare', amt: 31.51 },
    ],
  },
  '(60) koashadvertising': {
    am: 'Susan', pay: 'Payoneer · ashish@koashadvertising.com', expected: 270.00,
    ledger: [
      { date: '13/06/2026', type: 'accrual', desc: 'Tích lũy T5/2026 · Fluent', note: 'Rewards US - Apple Pay', amt: 5.60 },
    ],
  },
};
const PUB_ORDER = ['(30) Thuy Nguyen','(18) Magic Find','(73) Abby Yang','(56) Trackon Ads','(36) checkweb.us','(50) Azman Ahmad','(45) One Pride Group','(60) koashadvertising'];
const balanceOf = (p) => p.ledger.reduce((s, e) => s + e.amt, 0);
const deductOf  = (p) => p.ledger.filter(e => e.type === 'deduct').reduce((s, e) => s + Math.abs(e.amt), 0);

function gotoCongNo(pub) { location.href = 'cong-no.html?pub=' + encodeURIComponent(pub); }

/* ── Trang Công nợ Pub (danh sách + balance) ──────────────── */
function renderCongNoPage() {
  const list = PUB_ORDER.map(name => ({ name, ...PUBS[name] }));
  const totBal = list.reduce((s, p) => s + balanceOf(p), 0);
  const totExp = list.reduce((s, p) => s + (p.expected || 0), 0);
  const totDed = list.reduce((s, p) => s + deductOf(p), 0);
  const nPay   = list.filter(p => balanceOf(p) >= 100).length;

  const rows = list.map((p, i) => {
    const bal = balanceOf(p), ded = deductOf(p), canPay = bal >= 100;
    return `
    <tr class="row-act" onclick="openPubDrawer('${p.name}')">
      <td class="dim mono" style="text-align:center">${i + 1}</td>
      <td class="col-pub"><span class="c-pub" style="border-bottom:1px dotted var(--lm-border-strong)">${p.name}</span></td>
      <td class="col-adv"><span class="c-adv">${p.am}</span></td>
      <td class="col-money"><span class="dim mono">${fmt(p.expected || 0)}</span></td>
      <td class="col-money">${ded > 0 ? `<span class="l-minus mono">−${fmt(ded)}</span>` : '<span class="dim">—</span>'}</td>
      <td class="col-money"><span class="money-strong" style="font-size:15px">${fmt(bal)}</span></td>
      <td class="col-status">${canPay
        ? '<span class="bal-badge ok">≥ $100 · chi được</span>'
        : '<span class="bal-badge no">dưới $100</span>'}</td>
      <td class="col-act">
        <button class="btn btn-primary" style="padding:4px 10px;font-size:12px" ${canPay ? '' : 'disabled'}
          onclick="event.stopPropagation();openPayout('${p.name}', ${bal})">💸 Chi</button>
      </td>
    </tr>`;
  }).join('');

  document.getElementById('pageBody').innerHTML = `
  <div class="page">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:2px">
      <h1 class="page-h1">Công nợ Pub</h1>
      <span class="demo-flag">● BẢN DEMO GIAO DIỆN</span>
    </div>
    <p class="page-sub">Sổ tích lũy &amp; số dư từng publisher (all-time) · gộp mọi ADV / mọi kỳ · click 1 pub để xem sổ chi tiết.</p>
    <div class="summary-band" style="grid-template-columns:repeat(4,1fr)">
      <div class="sb-cell"><div class="sb-lbl">Tổng balance</div><div class="sb-val mono">${fmt(totBal)}</div><div class="sb-sub">${list.length} publisher</div></div>
      <div class="sb-cell ok sb-link" onclick="stub('Lọc pub đủ điều kiện chi')"><div class="sb-lbl">💸 Đủ điều kiện chi</div><div class="sb-val">${nPay} <span style="font-size:14px">pub</span></div><div class="sb-sub">balance ≥ $100</div></div>
      <div class="sb-cell"><div class="sb-lbl">Dự kiến đang chờ</div><div class="sb-val mono">${fmt(totExp)}</div><div class="sb-sub">đã chụp, chưa vào sổ</div></div>
      <div class="sb-cell"><div class="sb-lbl">Đã trừ (fraud/reject)</div><div class="sb-val mono">${fmt(totDed)}</div><div class="sb-sub">theo tháng gốc</div></div>
    </div>
    <div class="chips-row">
      <div class="search-box"><span>🔍</span><input placeholder="Tìm pub…" disabled></div>
    </div>
    <div class="table-card">
      <div class="table-hd"><span class="table-title">Danh sách công nợ publisher</span><span class="table-meta">${list.length} pub · 1 dòng = 1 publisher (all-time)</span></div>
      <div class="table-wrap">
        <table class="st">
          <thead><tr>
            <th style="width:44px;text-align:center">#</th>
            <th class="col-pub">PUB</th>
            <th class="col-adv">AM PUB</th>
            <th class="col-money">DỰ KIẾN CHỜ</th>
            <th class="col-money">ĐÃ TRỪ</th>
            <th class="col-money th-in">BALANCE</th>
            <th class="col-status">TRẠNG THÁI</th>
            <th class="col-act"></th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr>
            <td colspan="3"><span class="tfoot-label">Tổng ${list.length} pub</span></td>
            <td class="col-money">${fmt(totExp)}</td>
            <td class="col-money">−${fmt(totDed)}</td>
            <td class="col-money">${fmt(totBal)}</td>
            <td colspan="2"></td>
          </tr></tfoot>
        </table>
      </div>
    </div>
  </div>`;
}
const ETAG = {
  accrual:  'Tích lũy',
  partial:  'Giải ngân tay',
  deduct:   'Trừ tiền',
  payout:   'Lệnh chi',
  reversal: 'Hủy lệnh',
};

function openPubDrawer(pubName) {
  const p = PUBS[pubName] || PUBS['(18) Magic Find']; // demo: mọi pub khác dùng chung sổ mẫu
  document.getElementById('drawerHost').innerHTML = buildPubDrawer(pubName, p);
  document.body.style.overflow = 'hidden';
}
function buildPubDrawer(name, p) {
  const bal = p.ledger.reduce((s, e) => s + e.amt, 0);
  const canPay = bal >= 100;
  // running balance oldest→newest, hiển thị newest trên cùng
  let run = 0; const withBal = p.ledger.map(e => { run += e.amt; return { ...e, bal: run }; });
  const rows = withBal.slice().reverse().map(e => `
    <tr>
      <td class="l-date">${e.date}</td>
      <td><span class="etag ${e.type}">${ETAG[e.type]}</span></td>
      <td class="l-desc">${e.desc}${e.orig ? `<span class="orig-badge">gốc ${e.orig}</span>` : ''}<small>${e.note}</small></td>
      <td class="l-amt ${e.amt >= 0 ? 'l-plus' : 'l-minus'}">${e.amt >= 0 ? '+' : '−'}${fmt(Math.abs(e.amt))}</td>
      <td class="l-bal">${fmt(e.bal)}</td>
    </tr>`).join('');

  return `
  <div class="dwr-scrim" id="scrim" onclick="if(event.target===this)closeDrawer()">
    <aside class="dwr">
      <header class="dwr__hd">
        <div>
          <h3 class="dwr__title">${name}</h3>
          <div class="dwr__sub">AM Pub: <b style="color:var(--lm-text-secondary)">${p.am}</b> · Sổ tích lũy (all-time)</div>
        </div>
        <button class="dwr__x" onclick="closeDrawer()">×</button>
      </header>
      <div class="dwr__body">
        <div class="bal-card">
          <div class="bal-lbl">
            <span>Balance khả dụng (mọi ADV / mọi kỳ)</span>
            <span class="bal-badge ${canPay ? 'ok' : 'no'}">${canPay ? '≥ $100 · chi được' : 'dưới $100'}</span>
          </div>
          <div class="bal-val">${fmt(bal)}</div>
          <div class="bal-sub">Dự kiến đang chờ (chưa vào sổ): <b>${fmt(p.expected)}</b></div>
          <div class="bal-actions">
            <button class="btn btn-secondary" onclick="openDeduct('${name}')">− Trừ tiền</button>
            <button class="btn btn-primary" ${canPay ? '' : 'disabled'} onclick="openPayout('${name}', ${bal})">💸 Tạo lệnh chi</button>
          </div>
        </div>

        <div class="ledger-note">ⓘ Sổ append-only — mỗi biến động là 1 bút toán, không sửa/xóa. Balance = tổng sổ.</div>
        <table class="ledger">
          <thead><tr><th>Ngày</th><th>Loại</th><th>Diễn giải</th><th style="text-align:right">Số tiền</th><th style="text-align:right">Số dư</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="sec-title">Thông tin nhận tiền</div>
        <div class="pay-info-stub"><span class="pi-ico">🏦</span><div>${p.pay}<br><span style="opacity:.7">(quản lý payment info — ngoài phạm vi bản này)</span></div></div>
      </div>
    </aside>
  </div>`;
}

/* ── Dialog: Trừ tiền (deduction, ghi tháng gốc) ──────────── */
const MONTHS = ['T1/2026','T2/2026','T3/2026','T4/2026','T5/2026','T6/2026','T7/2026'];
function openDeduct(name) {
  const opts = ['<option value="">— chọn tháng gốc —</option>', ...MONTHS.map(m => `<option>${m}</option>`)].join('');
  showDialog(`
    <div class="dlg__hd"><span class="dlg__title">Trừ tiền — ${name}</span><button class="dlg__x" onclick="closeDialog()">×</button></div>
    <div class="dlg__body">
      <p class="dlg-desc">Trừ khoản fraud / reject khỏi balance pub. <b>Bắt buộc ghi tháng phát sinh gốc</b> — không dồn vào tháng hiện tại.</p>
      <div class="field"><label>Số tiền trừ (USD) <span class="req">*</span></label><input class="lm-in" type="number" placeholder="0.00" value="180.00"></div>
      <div class="field"><label>Tháng gốc phát sinh <span class="req">*</span></label><select class="lm-in" id="dmonth">${opts}</select>
        <div class="field-hint warn">⚠ Chọn đúng tháng fraud phát sinh, không phải tháng nhập.</div></div>
      <div class="field"><label>Lý do <span class="req">*</span></label><textarea class="lm-in" placeholder="VD: ADV reject traffic offer #5521 do nghi fraud (AM ADV: Đạt)"></textarea></div>
    </div>
    <div class="dlg__ft"><button class="btn btn-secondary" onclick="closeDialog()">Hủy</button>
      <button class="btn btn-danger" onclick="submitDeduct()">− Ghi trừ tiền</button></div>
  `);
}
function submitDeduct() {
  const m = document.getElementById('dmonth').value;
  if (!m) { toast('Chưa chọn tháng gốc — bắt buộc'); return; }
  closeDialog(); toast(`Đã ghi −DEDUCTION vào sổ, gốc ${m} (demo)`, true);
}

/* ── Dialog: Tạo lệnh chi ─────────────────────────────────── */
function openPayout(name, bal) {
  showDialog(`
    <div class="dlg__hd"><span class="dlg__title">Tạo lệnh chi — ${name}</span><button class="dlg__x" onclick="closeDialog()">×</button></div>
    <div class="dlg__body">
      <p class="dlg-desc">Rút toàn bộ balance khả dụng thành 1 lệnh chi. <b>Số tiền là final — không sửa được sau khi tạo.</b> Muốn đổi phải hủy lệnh (KT) rồi tạo lại.</p>
      <div class="field"><label>Số tiền chi (USD)</label><input class="lm-in emphasis" value="${fmt(bal)}" readonly></div>
      <div class="dlg-preview"><span>Balance sau khi chi</span><b>$0.00</b></div>
      <div class="field-hint" style="margin-top:12px">Lệnh sang trạng thái <b style="color:var(--lm-warning-text)">Chờ chi</b> → KT chuyển khoản ngoài app rồi bấm <b>Đã chi</b>.</div>
    </div>
    <div class="dlg__ft"><button class="btn btn-secondary" onclick="closeDialog()">Hủy</button>
      <button class="btn btn-primary" onclick="submitPayout()">💸 Tạo lệnh chi</button></div>
  `);
}
function submitPayout() { closeDialog(); closeDrawer(); toast('Đã tạo lệnh chi — trạng thái "Chờ chi", chờ KT (demo)', true); }

/* ── Dialog host ──────────────────────────────────────────── */
function showDialog(inner) {
  const host = document.getElementById('dialogHost');
  host.innerHTML = `<div class="dlg-scrim" onclick="if(event.target===this)closeDialog()"><div class="dlg">${inner}</div></div>`;
}
function closeDialog() { document.getElementById('dialogHost').innerHTML = ''; }

/* ── Toast ────────────────────────────────────────────────── */
function toast(msg, ok) {
  let host = document.getElementById('toastHost');
  if (!host) { host = document.createElement('div'); host.id = 'toastHost'; host.className = 'toast-host'; document.body.appendChild(host); }
  const t = document.createElement('div');
  t.className = 'toast' + (ok ? ' ok' : '');
  t.textContent = msg;
  host.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}
function stub(what) { toast(what + ' — (bản demo giao diện, chưa nối chức năng)'); }

/* ── Boot ─────────────────────────────────────────────────── */
function boot(opts) {
  opts = opts || {};
  initTheme();

  if (opts.mode === 'congno') {
    document.getElementById('shell').innerHTML = renderShell('congno');
    renderCongNoPage();
    const pub = new URLSearchParams(location.search).get('pub');
    if (pub && PUBS[pub]) openPubDrawer(pub);
    return;
  }

  document.getElementById('shell').innerHTML = renderShell('settle');
  document.getElementById('pageBody').innerHTML =
    `<div class="page">
       <div style="display:flex;align-items:center;gap:12px;margin-bottom:2px">
         <h1 class="page-h1">Chốt số Pub</h1>
         <span class="demo-flag">● BẢN DEMO GIAO DIỆN</span>
       </div>
       <p class="page-sub">Tích lũy công nợ publisher theo tháng · kế thừa trạng thái từ record ADV · giải ngân tay khi ADV trả thiếu.</p>
       ${renderSummary()}
       ${renderToolbar()}
       <div class="table-card" id="tableCard"></div>
     </div>`;
  renderChips();
  renderTable();
  if (opts.openDrawer) openDrawer(opts.openDrawer);
}
