/* ==========================================================================
   BROTHERS TRANSPORT LAHORE - CLIENT MANAGEMENT ENGINE
   Single Page Application Router, CRUD Engine, Chart.js Analytics, CSV Exporter
   ========================================================================== */

// Global App State
let appState = {
  isAuthenticated: false,
  drivers: [],
  earnings: [],
  monthlySummaries: [],
  earningViewMode: 'daily', // 'daily' or 'monthly'
  currentTab: 'home',
  charts: {}
};

// Initial Seed Data (Fallback if DB empty)
const SEED_DRIVERS = [
  { id: 'drv-1', name: 'Muhammad Usman', phone: '0301-4455667', cnic: '35202-1234567-1', carNumber: 'LEB-3492', carModel: 'Suzuki Alto VXR 2022', joiningDate: '2025-08-10', status: 'Active', notes: 'Experienced driver, Gulberg & Johar Town area Specialist' },
  { id: 'drv-2', name: 'Ali Raza', phone: '0321-8899112', cnic: '35201-9876543-3', carNumber: 'LEA-8821', carModel: 'Suzuki Alto VXL AGS 2023', joiningDate: '2025-09-01', status: 'Active', notes: 'Full time InDrive night shift' },
  { id: 'drv-3', name: 'Hamza Sheikh', phone: '0333-7766554', cnic: '35202-5544332-9', carNumber: 'LZE-5544', carModel: 'Suzuki Alto VXR 2021', joiningDate: '2025-11-15', status: 'Active', notes: 'Airport & Ring Road long trips preference' },
  { id: 'drv-4', name: 'Bilal Ahmed', phone: '0304-1122334', cnic: '35200-3322110-5', carNumber: 'LEC-1092', carModel: 'Suzuki Alto VXR 2023', joiningDate: '2026-01-20', status: 'Active', notes: 'DHA Phase 5 & Model Town routes' },
  { id: 'drv-5', name: 'Shahid Mahmood', phone: '0312-9988776', cnic: '35202-8877665-7', carNumber: 'LEG-7711', carModel: 'Suzuki Alto VXL AGS 2022', joiningDate: '2026-03-05', status: 'Inactive', notes: 'On leave for vehicle maintenance' }
];

const SEED_MONTHLY = [
  { id: 'ms-1', driverId: 'drv-1', driverName: 'Muhammad Usman', carNumber: 'LEB-3492', month: '2026-08', totalEarnings: 198000, fuelExpense: 61000, otherExpense: 7500, netEarning: 129500, daysWorked: 26, notes: 'August settlement complete. Oil change + filter.' },
  { id: 'ms-2', driverId: 'drv-2', driverName: 'Ali Raza', carNumber: 'LEA-8821', month: '2026-08', totalEarnings: 212000, fuelExpense: 65000, otherExpense: 5000, netEarning: 142000, daysWorked: 27, notes: 'Peak night rides bonus included.' },
  { id: 'ms-3', driverId: 'drv-3', driverName: 'Hamza Sheikh', carNumber: 'LZE-5544', month: '2026-08', totalEarnings: 185000, fuelExpense: 58000, otherExpense: 12000, netEarning: 115000, daysWorked: 24, notes: 'New brake pads replaced.' }
];

const SEED_EARNINGS = [
  { id: 'earn-101', driverId: 'drv-1', driverName: 'Muhammad Usman', carNumber: 'LEB-3492', date: getTodayStr(), totalEarnings: 7200, fuelExpense: 2200, otherExpense: 300, netEarning: 4700, notes: '14 rides completed. Oil top up 300 PKR' },
  { id: 'earn-102', driverId: 'drv-2', driverName: 'Ali Raza', carNumber: 'LEA-8821', date: getTodayStr(), totalEarnings: 6500, fuelExpense: 1900, otherExpense: 150, netEarning: 4450, notes: '12 rides. Toll plaza 150 PKR' },
  { id: 'earn-103', driverId: 'drv-3', driverName: 'Hamza Sheikh', carNumber: 'LZE-5544', date: getTodayStr(), totalEarnings: 8100, fuelExpense: 2500, otherExpense: 400, netEarning: 5200, notes: '2 long airport rides + 10 city rides. Car wash 400 PKR' },
  { id: 'earn-104', driverId: 'drv-4', driverName: 'Bilal Ahmed', carNumber: 'LEC-1092', date: getTodayStr(), totalEarnings: 5900, fuelExpense: 1800, otherExpense: 0, netEarning: 4100, notes: 'Smooth day, 11 InDrive rides' },
  { id: 'earn-105', driverId: 'drv-1', driverName: 'Muhammad Usman', carNumber: 'LEB-3492', date: getOffsetDateStr(-1), totalEarnings: 6800, fuelExpense: 2100, otherExpense: 200, netEarning: 4500, notes: 'Gulberg & Cavalry Ground' },
  { id: 'earn-106', driverId: 'drv-2', driverName: 'Ali Raza', carNumber: 'LEA-8821', date: getOffsetDateStr(-1), totalEarnings: 7400, fuelExpense: 2300, otherExpense: 0, netEarning: 5100, notes: 'Night shift peak hours' },
  { id: 'earn-107', driverId: 'drv-3', driverName: 'Hamza Sheikh', carNumber: 'LZE-5544', date: getOffsetDateStr(-1), totalEarnings: 6200, fuelExpense: 1950, otherExpense: 250, netEarning: 4000, notes: 'Tire puncture repair 250 PKR' },
  { id: 'earn-108', driverId: 'drv-4', driverName: 'Bilal Ahmed', carNumber: 'LEC-1092', date: getOffsetDateStr(-1), totalEarnings: 6600, fuelExpense: 2000, otherExpense: 100, netEarning: 4500, notes: '13 rides' },
  { id: 'earn-109', driverId: 'drv-1', driverName: 'Muhammad Usman', carNumber: 'LEB-3492', date: getOffsetDateStr(-2), totalEarnings: 7000, fuelExpense: 2200, otherExpense: 0, netEarning: 4800, notes: 'Regular shift' }
];

// Helper Date Functions
function getTodayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getOffsetDateStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function formatPKR(val) {
  const num = parseFloat(val) || 0;
  return 'Rs. ' + num.toLocaleString('en-PK');
}

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
  checkAuthSession();
  await loadData();
  setupFormDefaults();
  renderAllViews();
});

// Authentication Handlers
function checkAuthSession() {
  const sessionToken = sessionStorage.getItem('bt_admin_session');
  if (sessionToken === 'authenticated') {
    appState.isAuthenticated = true;
    updateAuthUI();
  }
}

function updateAuthUI() {
  const authBtnText = document.getElementById('auth-btn-text');
  const authBtn = document.getElementById('auth-btn');

  if (appState.isAuthenticated) {
    authBtnText.innerText = 'Admin (Logged In)';
    authBtn.classList.remove('btn-secondary');
    authBtn.classList.add('btn-primary');
  } else {
    authBtnText.innerText = 'Admin Login';
    authBtn.classList.remove('btn-primary');
    authBtn.classList.add('btn-secondary');
  }
}

function handleAuthToggle() {
  if (appState.isAuthenticated) {
    if (confirm('Are you sure you want to log out of Admin mode?')) {
      appState.isAuthenticated = false;
      sessionStorage.removeItem('bt_admin_session');
      updateAuthUI();
      switchTab('home');
      showToast('Logged out of Admin mode.', 'info');
    }
  } else {
    openModal('modal-auth');
  }
}

function submitAdminLogin() {
  const pinInput = document.getElementById('auth-pin-input');
  const pin = pinInput.value.trim();

  if (pin === 'admin123' || pin === '03207843805') {
    appState.isAuthenticated = true;
    sessionStorage.setItem('bt_admin_session', 'authenticated');
    updateAuthUI();
    closeModal('modal-auth');
    pinInput.value = '';
    showToast('Admin authentication successful!', 'success');
    switchTab('dashboard');
  } else {
    showToast('Invalid Admin PIN. Please try again.', 'danger');
  }
}

function protectedTab(tabName) {
  if (!appState.isAuthenticated) {
    openModal('modal-auth');
    showToast('Admin authentication required for this section.', 'info');
    return;
  }
  switchTab(tabName);
}

// Tab Router
function switchTab(tabName) {
  appState.currentTab = tabName;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

  const activeTab = document.getElementById('tab-' + tabName);
  const activeNav = document.getElementById('nav-' + tabName);

  if (activeTab) activeTab.classList.add('active');
  if (activeNav) activeNav.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-render responsive elements if switching tabs
  if (tabName === 'dashboard') {
    renderDashboardCharts();
  } else if (tabName === 'drivers') {
    renderDriversTable();
  } else if (tabName === 'earnings') {
    renderEarningsTable();
  } else if (tabName === 'reports') {
    calculateReportStats();
  }
}

// Data Storage Sync Engine (Tries API first, falls back to localStorage)
async function loadData() {
  try {
    const [resDrivers, resEarnings] = await Promise.all([
      fetch('/api/drivers').catch(() => null),
      fetch('/api/earnings').catch(() => null)
    ]);

    if (resDrivers && resDrivers.ok && resEarnings && resEarnings.ok) {
      appState.drivers = await resDrivers.json();
      appState.earnings = await resEarnings.json();
    } else {
      loadFromLocalStorage();
    }
  } catch (err) {
    loadFromLocalStorage();
  }
}

function loadFromLocalStorage() {
  const localDrivers = localStorage.getItem('bt_drivers');
  const localEarnings = localStorage.getItem('bt_earnings');
  const localMonthly = localStorage.getItem('bt_monthly');

  appState.drivers = localDrivers ? JSON.parse(localDrivers) : SEED_DRIVERS;
  appState.earnings = localEarnings ? JSON.parse(localEarnings) : SEED_EARNINGS;
  appState.monthlySummaries = localMonthly ? JSON.parse(localMonthly) : SEED_MONTHLY;
  saveToLocalStorage();
}

function saveToLocalStorage() {
  localStorage.setItem('bt_drivers', JSON.stringify(appState.drivers));
  localStorage.setItem('bt_earnings', JSON.stringify(appState.earnings));
  localStorage.setItem('bt_monthly', JSON.stringify(appState.monthlySummaries));
}

// Global UI Render Sync
function renderAllViews() {
  populateDriverDropdowns();
  updateKPIs();
  renderDriversTable();
  renderEarningsTable();
  calculateReportStats();
  if (appState.currentTab === 'dashboard') {
    renderDashboardCharts();
  }
}

// Populate Driver Selection Dropdowns
function populateDriverDropdowns() {
  const earningSelect = document.getElementById('earning-driver-id');
  const monthlySelect = document.getElementById('monthly-driver-id');
  const filterSelect = document.getElementById('earning-driver-filter');
  const reportSelect = document.getElementById('report-driver-filter');

  const activeDrivers = appState.drivers.filter(d => d.status === 'Active');

  let optHTML = '<option value="">-- Choose Driver --</option>';
  activeDrivers.forEach(d => {
    optHTML += `<option value="${d.id}">${d.name} (${d.carNumber} - ${d.carModel})</option>`;
  });
  if (earningSelect) earningSelect.innerHTML = optHTML;
  if (monthlySelect) monthlySelect.innerHTML = optHTML;

  let filterHTML = '<option value="ALL">All Drivers</option>';
  appState.drivers.forEach(d => {
    filterHTML += `<option value="${d.id}">${d.name} (${d.carNumber})</option>`;
  });
  if (filterSelect) filterSelect.innerHTML = filterHTML;
  if (reportSelect) reportSelect.innerHTML = filterHTML;
}

// Live Math Auto-Calculator: Net = Total - Fuel - Other
function autoCalculateNet() {
  const total = parseFloat(document.getElementById('earning-total').value) || 0;
  const fuel = parseFloat(document.getElementById('earning-fuel').value) || 0;
  const other = parseFloat(document.getElementById('earning-other').value) || 0;
  const net = total - fuel - other;

  const netInput = document.getElementById('earning-net');
  if (netInput) netInput.value = net >= 0 ? net : net;
}

function autoFillDriverDetails() {
  // Can extend if specific defaults needed
}

function setupFormDefaults() {
  const earningDate = document.getElementById('earning-date');
  if (earningDate) earningDate.value = getTodayStr();

  const driverJoiningDate = document.getElementById('driver-joining-date');
  if (driverJoiningDate) driverJoiningDate.value = getTodayStr();
}

// ================= DRIVER CRUD =================

function openDriverModal(driverId = null) {
  document.getElementById('driver-form').reset();
  setupFormDefaults();

  if (driverId) {
    const d = appState.drivers.find(x => x.id === driverId);
    if (d) {
      document.getElementById('modal-driver-title').innerHTML = `<i class="fa-solid fa-user-pen" style="color: var(--primary);"></i> Edit Driver Profile`;
      document.getElementById('driver-id').value = d.id;
      document.getElementById('driver-name').value = d.name;
      document.getElementById('driver-phone').value = d.phone;
      document.getElementById('driver-car-number').value = d.carNumber;
      document.getElementById('driver-car-model').value = d.carModel;
      document.getElementById('driver-cnic').value = d.cnic || '';
      document.getElementById('driver-joining-date').value = d.joiningDate;
      document.getElementById('driver-status').value = d.status;
      document.getElementById('driver-notes').value = d.notes || '';
    }
  } else {
    document.getElementById('modal-driver-title').innerHTML = `<i class="fa-solid fa-user-plus" style="color: var(--primary);"></i> Add New Driver`;
    document.getElementById('driver-id').value = '';
  }
  openModal('modal-driver');
}

async function saveDriver(e) {
  e.preventDefault();
  const id = document.getElementById('driver-id').value;
  const driverData = {
    name: document.getElementById('driver-name').value.trim(),
    phone: document.getElementById('driver-phone').value.trim(),
    carNumber: document.getElementById('driver-car-number').value.trim().toUpperCase(),
    carModel: document.getElementById('driver-car-model').value,
    cnic: document.getElementById('driver-cnic').value.trim(),
    joiningDate: document.getElementById('driver-joining-date').value,
    status: document.getElementById('driver-status').value,
    notes: document.getElementById('driver-notes').value.trim()
  };

  try {
    if (id) {
      // Edit
      const res = await fetch(`/api/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData)
      }).catch(() => null);

      const idx = appState.drivers.findIndex(d => d.id === id);
      if (idx !== -1) {
        appState.drivers[idx] = { ...appState.drivers[idx], ...driverData };
      }
      showToast('Driver profile updated!', 'success');
    } else {
      // Add
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData)
      }).catch(() => null);

      let newDriver = null;
      if (res && res.ok) {
        newDriver = await res.json();
      } else {
        newDriver = { id: 'drv-' + Date.now(), ...driverData };
      }
      appState.drivers.unshift(newDriver);
      showToast('New driver registered successfully!', 'success');
    }
  } catch (err) {
    showToast('Saved locally.', 'info');
  }

  saveToLocalStorage();
  closeModal('modal-driver');
  renderAllViews();
}

async function deleteDriver(id) {
  if (!confirm('Are you sure you want to delete this driver? Earnings records associated will be retained.')) return;

  try {
    await fetch(`/api/drivers/${id}`, { method: 'DELETE' }).catch(() => null);
  } catch (err) {}

  appState.drivers = appState.drivers.filter(d => d.id !== id);
  saveToLocalStorage();
  showToast('Driver profile deleted.', 'info');
  renderAllViews();
}

function renderDriversTable() {
  const tbody = document.getElementById('drivers-table-body');
  if (!tbody) return;

  const searchQuery = (document.getElementById('driver-search-input')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('driver-status-filter')?.value || 'ALL';

  const filtered = appState.drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery) ||
                          d.phone.includes(searchQuery) ||
                          d.carNumber.toLowerCase().includes(searchQuery) ||
                          (d.cnic && d.cnic.includes(searchQuery));
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No driver profiles found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(d => `
    <tr>
      <td style="font-weight: 700;">${d.name}</td>
      <td><span class="badge badge-info">${d.carNumber}</span></td>
      <td>${d.carModel}</td>
      <td><i class="fa-solid fa-phone" style="color: var(--primary); font-size: 0.8rem;"></i> ${d.phone}</td>
      <td>${d.cnic || '<span style="color: var(--text-muted);">N/A</span>'}</td>
      <td>${d.joiningDate}</td>
      <td>
        <span class="badge ${d.status === 'Active' ? 'badge-success' : 'badge-danger'}">
          ${d.status === 'Active' ? '<i class="fa-solid fa-circle"></i> Active' : '<i class="fa-solid fa-circle-xmark"></i> Inactive'}
        </span>
      </td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="openDriverModal('${d.id}')" title="Edit Driver"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteDriver('${d.id}')" title="Delete Driver"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// ================= DAILY EARNINGS CRUD =================

function openEarningModal(earningId = null) {
  document.getElementById('earning-form').reset();
  setupFormDefaults();
  populateDriverDropdowns();

  if (earningId) {
    const e = appState.earnings.find(x => x.id === earningId);
    if (e) {
      document.getElementById('modal-earning-title').innerHTML = `<i class="fa-solid fa-file-pen" style="color: var(--primary);"></i> Edit Earning Record`;
      document.getElementById('earning-id').value = e.id;
      document.getElementById('earning-driver-id').value = e.driverId;
      document.getElementById('earning-date').value = e.date;
      document.getElementById('earning-total').value = e.totalEarnings;
      document.getElementById('earning-fuel').value = e.fuelExpense;
      document.getElementById('earning-other').value = e.otherExpense || 0;
      document.getElementById('earning-net').value = e.netEarning;
      document.getElementById('earning-notes').value = e.notes || '';
    }
  } else {
    document.getElementById('modal-earning-title').innerHTML = `<i class="fa-solid fa-money-bill-wave" style="color: var(--primary);"></i> Log Daily Driver Earning`;
    document.getElementById('earning-id').value = '';
    autoCalculateNet();
  }
  openModal('modal-earning');
}

async function saveEarning(e) {
  e.preventDefault();
  const id = document.getElementById('earning-id').value;
  const driverId = document.getElementById('earning-driver-id').value;
  const driverObj = appState.drivers.find(d => d.id === driverId) || {};

  const total = parseFloat(document.getElementById('earning-total').value) || 0;
  const fuel = parseFloat(document.getElementById('earning-fuel').value) || 0;
  const other = parseFloat(document.getElementById('earning-other').value) || 0;
  const net = total - fuel - other;

  const earningData = {
    driverId,
    driverName: driverObj.name || 'Unknown Driver',
    carNumber: driverObj.carNumber || 'N/A',
    date: document.getElementById('earning-date').value,
    totalEarnings: total,
    fuelExpense: fuel,
    otherExpense: other,
    netEarning: net,
    notes: document.getElementById('earning-notes').value.trim()
  };

  try {
    if (id) {
      await fetch(`/api/earnings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(earningData)
      }).catch(() => null);

      const idx = appState.earnings.findIndex(x => x.id === id);
      if (idx !== -1) {
        appState.earnings[idx] = { ...appState.earnings[idx], ...earningData };
      }
      showToast('Earning record updated!', 'success');
    } else {
      const res = await fetch('/api/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(earningData)
      }).catch(() => null);

      let newEarning = null;
      if (res && res.ok) {
        newEarning = await res.json();
      } else {
        newEarning = { id: 'earn-' + Date.now(), ...earningData };
      }
      appState.earnings.unshift(newEarning);
      showToast('Daily earning record logged!', 'success');
    }
  } catch (err) {
    showToast('Saved locally.', 'info');
  }

  saveToLocalStorage();
  closeModal('modal-earning');
  renderAllViews();
}

async function deleteEarning(id) {
  if (!confirm('Delete this earning record?')) return;

  try {
    await fetch(`/api/earnings/${id}`, { method: 'DELETE' }).catch(() => null);
  } catch (err) {}

  appState.earnings = appState.earnings.filter(e => e.id !== id);
  saveToLocalStorage();
  showToast('Earning record removed.', 'info');
  renderAllViews();
}

function showEarningDetails(id) {
  const e = appState.earnings.find(x => x.id === id);
  if (!e) return;

  const body = document.getElementById('details-modal-body');
  body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
        <span style="color: var(--text-secondary);">Date</span>
        <strong style="font-size: 1.05rem;">${e.date}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
        <span style="color: var(--text-secondary);">Driver Name</span>
        <strong>${e.driverName}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
        <span style="color: var(--text-secondary);">Vehicle Registration</span>
        <span class="badge badge-info">${e.carNumber}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
        <span style="color: var(--text-secondary);">Total InDrive Earnings</span>
        <strong style="color: #60A5FA;">${formatPKR(e.totalEarnings)}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
        <span style="color: var(--text-secondary);">Fuel Expense</span>
        <strong style="color: #F87171;">- ${formatPKR(e.fuelExpense)}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
        <span style="color: var(--text-secondary);">Other Expenses</span>
        <strong style="color: #F87171;">- ${formatPKR(e.otherExpense)}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; background: rgba(0,184,107,0.12); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(0,184,107,0.3);">
        <span style="font-size: 1.1rem; font-weight: 700;">Net Driver Profit</span>
        <strong style="font-size: 1.2rem; color: var(--primary);">${formatPKR(e.netEarning)}</strong>
      </div>
      <div style="margin-top: 0.5rem;">
        <span style="color: var(--text-secondary); font-size: 0.85rem;">Notes & Remarks:</span>
        <p style="background: var(--bg-input); padding: 0.75rem; border-radius: var(--radius-sm); margin-top: 0.25rem; font-size: 0.9rem;">
          ${e.notes || 'No specific notes recorded for this shift.'}
        </p>
      </div>
    </div>
  `;
  openModal('modal-details');
}

function setEarningViewMode(mode) {
  appState.earningViewMode = mode;
  const btnDaily = document.getElementById('view-mode-daily');
  const btnMonthly = document.getElementById('view-mode-monthly');

  if (mode === 'daily') {
    btnDaily.className = 'btn btn-primary btn-sm';
    btnMonthly.className = 'btn btn-secondary btn-sm';
  } else {
    btnDaily.className = 'btn btn-secondary btn-sm';
    btnMonthly.className = 'btn btn-primary btn-sm';
  }
  renderEarningsTable();
}

// Auto-Calculate Monthly Net Profit
function autoCalculateMonthlyNet() {
  const total = parseFloat(document.getElementById('monthly-total').value) || 0;
  const fuel = parseFloat(document.getElementById('monthly-fuel').value) || 0;
  const other = parseFloat(document.getElementById('monthly-other').value) || 0;
  const net = total - fuel - other;

  const netInput = document.getElementById('monthly-net');
  if (netInput) netInput.value = net;
}

function openMonthlyModal(summaryId = null) {
  document.getElementById('monthly-form').reset();
  populateDriverDropdowns();

  const monthInput = document.getElementById('monthly-month');
  if (monthInput) monthInput.value = getTodayStr().substring(0, 7);

  if (summaryId) {
    const ms = appState.monthlySummaries.find(x => x.id === summaryId);
    if (ms) {
      document.getElementById('modal-monthly-title').innerHTML = `<i class="fa-solid fa-calendar-pen" style="color: var(--primary);"></i> Edit Monthly Earning Summary`;
      document.getElementById('monthly-id').value = ms.id;
      document.getElementById('monthly-driver-id').value = ms.driverId;
      document.getElementById('monthly-month').value = ms.month;
      document.getElementById('monthly-total').value = ms.totalEarnings;
      document.getElementById('monthly-fuel').value = ms.fuelExpense;
      document.getElementById('monthly-other').value = ms.otherExpense || 0;
      document.getElementById('monthly-net').value = ms.netEarning;
      document.getElementById('monthly-days').value = ms.daysWorked || 26;
      document.getElementById('monthly-notes').value = ms.notes || '';
    }
  } else {
    document.getElementById('modal-monthly-title').innerHTML = `<i class="fa-solid fa-calendar-days" style="color: var(--primary);"></i> Log Monthly Driver Earning Summary`;
    document.getElementById('monthly-id').value = '';
    autoCalculateMonthlyNet();
  }
  openModal('modal-monthly');
}

async function saveMonthlyEarning(e) {
  e.preventDefault();
  const id = document.getElementById('monthly-id').value;
  const driverId = document.getElementById('monthly-driver-id').value;
  const driverObj = appState.drivers.find(d => d.id === driverId) || {};

  const total = parseFloat(document.getElementById('monthly-total').value) || 0;
  const fuel = parseFloat(document.getElementById('monthly-fuel').value) || 0;
  const other = parseFloat(document.getElementById('monthly-other').value) || 0;
  const net = total - fuel - other;
  const daysWorked = parseInt(document.getElementById('monthly-days').value) || 26;

  const summaryData = {
    id: id || 'ms-' + Date.now(),
    driverId,
    driverName: driverObj.name || 'Unknown Driver',
    carNumber: driverObj.carNumber || 'N/A',
    month: document.getElementById('monthly-month').value,
    totalEarnings: total,
    fuelExpense: fuel,
    otherExpense: other,
    netEarning: net,
    daysWorked,
    notes: document.getElementById('monthly-notes').value.trim()
  };

  if (id) {
    const idx = appState.monthlySummaries.findIndex(x => x.id === id);
    if (idx !== -1) appState.monthlySummaries[idx] = summaryData;
    showToast('Monthly summary updated!', 'success');
  } else {
    appState.monthlySummaries.unshift(summaryData);
    showToast('Monthly earning summary recorded!', 'success');
  }

  saveToLocalStorage();
  closeModal('modal-monthly');
  renderAllViews();
}

function deleteMonthlySummary(id) {
  if (!confirm('Delete this monthly summary record?')) return;
  appState.monthlySummaries = appState.monthlySummaries.filter(m => m.id !== id);
  saveToLocalStorage();
  showToast('Monthly record removed.', 'info');
  renderAllViews();
}

function resetEarningFilters() {
  document.getElementById('earning-search-input').value = '';
  document.getElementById('earning-driver-filter').value = 'ALL';
  document.getElementById('earning-date-filter').value = '';
  document.getElementById('earning-month-filter').value = '';
  renderEarningsTable();
}

function renderEarningsTable() {
  const tbody = document.getElementById('earnings-table-body');
  const thead = document.getElementById('earnings-table-head');
  if (!tbody || !thead) return;

  const searchQuery = (document.getElementById('earning-search-input')?.value || '').toLowerCase();
  const driverFilter = document.getElementById('earning-driver-filter')?.value || 'ALL';
  const dateFilter = document.getElementById('earning-date-filter')?.value || '';
  const monthFilter = document.getElementById('earning-month-filter')?.value || '';

  if (appState.earningViewMode === 'daily') {
    // DAILY TABLE VIEW
    thead.innerHTML = `
      <tr>
        <th>Date</th>
        <th>Driver Name</th>
        <th>Car No.</th>
        <th>Total Earnings (PKR)</th>
        <th>Fuel Expense (PKR)</th>
        <th>Other Expense (PKR)</th>
        <th>Net Earning (PKR)</th>
        <th>Actions</th>
      </tr>
    `;

    const filtered = appState.earnings.filter(e => {
      const matchesSearch = e.driverName.toLowerCase().includes(searchQuery) ||
                            e.carNumber.toLowerCase().includes(searchQuery) ||
                            (e.notes && e.notes.toLowerCase().includes(searchQuery));
      const matchesDriver = driverFilter === 'ALL' || e.driverId === driverFilter;
      const matchesDate = !dateFilter || e.date === dateFilter;
      const matchesMonth = !monthFilter || e.date.startsWith(monthFilter);

      return matchesSearch && matchesDriver && matchesDate && matchesMonth;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No daily earning records found matching filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(e => `
      <tr>
        <td>${e.date}</td>
        <td style="font-weight: 700;">${e.driverName}</td>
        <td><span class="badge badge-info">${e.carNumber}</span></td>
        <td style="color: #60A5FA; font-weight: 600;">${formatPKR(e.totalEarnings)}</td>
        <td style="color: #F87171;">${formatPKR(e.fuelExpense)}</td>
        <td style="color: #F87171;">${formatPKR(e.otherExpense)}</td>
        <td style="color: var(--primary); font-weight: 800;">${formatPKR(e.netEarning)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="showEarningDetails('${e.id}')" title="View Details"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-secondary btn-sm" onclick="openEarningModal('${e.id}')" title="Edit Record"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteEarning('${e.id}')" title="Delete Record"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } else {
    // MONTHLY AGGREGATED TABLE VIEW
    thead.innerHTML = `
      <tr>
        <th>Month / Period</th>
        <th>Driver Name</th>
        <th>Car No.</th>
        <th>Working Days</th>
        <th>Monthly Income (PKR)</th>
        <th>Fuel Expense (PKR)</th>
        <th>Maintenance (PKR)</th>
        <th>Net Monthly Profit (PKR)</th>
        <th>Actions</th>
      </tr>
    `;

    const filtered = appState.monthlySummaries.filter(m => {
      const matchesSearch = m.driverName.toLowerCase().includes(searchQuery) ||
                            m.carNumber.toLowerCase().includes(searchQuery) ||
                            (m.notes && m.notes.toLowerCase().includes(searchQuery));
      const matchesDriver = driverFilter === 'ALL' || m.driverId === driverFilter;
      const matchesMonth = !monthFilter || m.month === monthFilter;
      return matchesSearch && matchesDriver && matchesMonth;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No monthly summary records found matching filters. Log a monthly summary or pick another filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(m => `
      <tr>
        <td style="font-weight: 700;"><i class="fa-solid fa-calendar-check" style="color: var(--primary);"></i> ${m.month}</td>
        <td style="font-weight: 700;">${m.driverName}</td>
        <td><span class="badge badge-info">${m.carNumber}</span></td>
        <td><span class="badge badge-success">${m.daysWorked || 26} Days</span></td>
        <td style="color: #60A5FA; font-weight: 600;">${formatPKR(m.totalEarnings)}</td>
        <td style="color: #F87171;">${formatPKR(m.fuelExpense)}</td>
        <td style="color: #F87171;">${formatPKR(m.otherExpense)}</td>
        <td style="color: var(--primary); font-weight: 800;">${formatPKR(m.netEarning)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openMonthlyModal('${m.id}')" title="Edit Monthly Record"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteMonthlySummary('${m.id}')" title="Delete Record"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }
}

// ================= KPI CALCULATIONS =================

function updateKPIs() {
  const totalDrivers = appState.drivers.length;
  const activeDrivers = appState.drivers.filter(d => d.status === 'Active').length;

  const today = getTodayStr();
  const currentMonth = today.substring(0, 7);

  const todayList = appState.earnings.filter(e => e.date === today);
  const monthList = appState.earnings.filter(e => e.date.startsWith(currentMonth));

  const todayTotal = todayList.reduce((sum, x) => sum + (x.totalEarnings || 0), 0);
  const todayFuel = todayList.reduce((sum, x) => sum + (x.fuelExpense || 0), 0);
  const todayOther = todayList.reduce((sum, x) => sum + (x.otherExpense || 0), 0);
  const todayExpenses = todayFuel + todayOther;
  const todayNet = todayTotal - todayExpenses;

  const monthTotal = monthList.reduce((sum, x) => sum + (x.totalEarnings || 0), 0);
  const monthFuel = monthList.reduce((sum, x) => sum + (x.fuelExpense || 0), 0);
  const monthOther = monthList.reduce((sum, x) => sum + (x.otherExpense || 0), 0);
  const monthExpenses = monthFuel + monthOther;
  const monthNet = monthTotal - monthExpenses;

  // Render to DOM
  const elemTotalDrivers = document.getElementById('kpi-total-drivers');
  if (elemTotalDrivers) elemTotalDrivers.innerText = totalDrivers;

  const elemActiveDrivers = document.getElementById('kpi-active-drivers');
  if (elemActiveDrivers) elemActiveDrivers.innerText = activeDrivers;

  document.getElementById('kpi-today-earnings').innerText = formatPKR(todayTotal);
  document.getElementById('kpi-today-expenses').innerText = formatPKR(todayExpenses);
  document.getElementById('kpi-today-net').innerText = formatPKR(todayNet);

  document.getElementById('kpi-month-earnings').innerText = formatPKR(monthTotal);
  document.getElementById('kpi-month-expenses').innerText = formatPKR(monthExpenses);
  document.getElementById('kpi-month-net').innerText = formatPKR(monthNet);
}

// ================= CHART.JS ANALYTICS =================

function renderDashboardCharts() {
  if (typeof Chart === 'undefined') return;

  // Destroy previous chart instances
  Object.values(appState.charts).forEach(c => c && c.destroy && c.destroy());
  appState.charts = {};

  // 1. Daily Trend Chart (Last 7 Days)
  const last7Dates = [];
  for (let i = 6; i >= 0; i--) {
    last7Dates.push(getOffsetDateStr(-i));
  }

  const dailyTrendData = last7Dates.map(d => {
    const list = appState.earnings.filter(e => e.date === d);
    return list.reduce((acc, curr) => acc + (curr.netEarning || 0), 0);
  });

  const ctxTrend = document.getElementById('dailyTrendChart')?.getContext('2d');
  if (ctxTrend) {
    appState.charts.trend = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: last7Dates.map(d => d.slice(5)),
        datasets: [{
          label: 'Net Profit (PKR)',
          data: dailyTrendData,
          borderColor: '#00B86B',
          backgroundColor: 'rgba(0, 184, 107, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#00B86B'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } }
        }
      }
    });
  }

  // 2. Monthly Comparison Chart (Gross vs Expenses vs Net)
  const currentMonth = getTodayStr().substring(0, 7);
  const monthEarnings = appState.earnings.filter(e => e.date.startsWith(currentMonth));

  const totalGross = monthEarnings.reduce((a, b) => a + (b.totalEarnings || 0), 0);
  const totalFuel = monthEarnings.reduce((a, b) => a + (b.fuelExpense || 0), 0);
  const totalOther = monthEarnings.reduce((a, b) => a + (b.otherExpense || 0), 0);
  const totalNet = totalGross - (totalFuel + totalOther);

  const ctxMonthly = document.getElementById('monthlyComparisonChart')?.getContext('2d');
  if (ctxMonthly) {
    appState.charts.monthly = new Chart(ctxMonthly, {
      type: 'bar',
      data: {
        labels: ['Gross Income', 'Fuel Expense', 'Other Expense', 'Net Profit'],
        datasets: [{
          data: [totalGross, totalFuel, totalOther, totalNet],
          backgroundColor: ['#3B82F6', '#EF4444', '#F59E0B', '#00B86B'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } }
        }
      }
    });
  }

  // 3. Driver Earnings Comparison (Bar Chart)
  const driverNames = appState.drivers.map(d => d.name);
  const driverTotals = appState.drivers.map(d => {
    return appState.earnings
      .filter(e => e.driverId === d.id)
      .reduce((sum, curr) => sum + (curr.netEarning || 0), 0);
  });

  const ctxDriver = document.getElementById('driverEarningsChart')?.getContext('2d');
  if (ctxDriver) {
    appState.charts.driver = new Chart(ctxDriver, {
      type: 'bar',
      data: {
        labels: driverNames,
        datasets: [{
          label: 'Total Net Earnings (PKR)',
          data: driverTotals,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: '#3B82F6',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
          y: { grid: { display: false }, ticks: { color: '#9CA3AF' } }
        }
      }
    });
  }

  // 4. Expense Breakdown (Donut Chart)
  const allFuel = appState.earnings.reduce((a, b) => a + (b.fuelExpense || 0), 0);
  const allOther = appState.earnings.reduce((a, b) => a + (b.otherExpense || 0), 0);

  const ctxExpense = document.getElementById('expenseBreakdownChart')?.getContext('2d');
  if (ctxExpense) {
    appState.charts.expense = new Chart(ctxExpense, {
      type: 'doughnut',
      data: {
        labels: ['Fuel Expense', 'Maintenance & Other'],
        datasets: [{
          data: [allFuel, allOther],
          backgroundColor: ['#EF4444', '#F59E0B'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#9CA3AF' } }
        }
      }
    });
  }
}

// ================= REPORTS & STATS ENGINE =================

function setReportRange(preset) {
  const today = getTodayStr();
  const startDateInput = document.getElementById('report-start-date');
  const endDateInput = document.getElementById('report-end-date');

  if (preset === 'today') {
    startDateInput.value = today;
    endDateInput.value = today;
  } else if (preset === 'week') {
    startDateInput.value = getOffsetDateStr(-7);
    endDateInput.value = today;
  } else if (preset === 'month') {
    startDateInput.value = today.substring(0, 7) + '-01';
    endDateInput.value = today;
  } else if (preset === 'all') {
    startDateInput.value = '';
    endDateInput.value = '';
  }
  calculateReportStats();
}

function calculateReportStats() {
  const driverFilter = document.getElementById('report-driver-filter')?.value || 'ALL';
  const startDate = document.getElementById('report-start-date')?.value || '';
  const endDate = document.getElementById('report-end-date')?.value || '';

  const filtered = appState.earnings.filter(e => {
    const matchesDriver = driverFilter === 'ALL' || e.driverId === driverFilter;
    const matchesStart = !startDate || e.date >= startDate;
    const matchesEnd = !endDate || e.date <= endDate;
    return matchesDriver && matchesStart && matchesEnd;
  });

  const totalIncome = filtered.reduce((a, b) => a + (b.totalEarnings || 0), 0);
  const totalFuel = filtered.reduce((a, b) => a + (b.fuelExpense || 0), 0);
  const totalOther = filtered.reduce((a, b) => a + (b.otherExpense || 0), 0);
  const totalExpenses = totalFuel + totalOther;
  const netProfit = totalIncome - totalExpenses;
  const workingDays = filtered.length;

  const elemIncome = document.getElementById('report-total-income');
  if (elemIncome) elemIncome.innerText = formatPKR(totalIncome);

  const elemExp = document.getElementById('report-total-expenses');
  if (elemExp) elemExp.innerText = formatPKR(totalExpenses);

  const elemNet = document.getElementById('report-net-profit');
  if (elemNet) elemNet.innerText = formatPKR(netProfit);

  const elemDays = document.getElementById('report-working-days');
  if (elemDays) elemDays.innerText = workingDays;

  // Render Report Table
  const tbody = document.getElementById('report-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No financial data matches the specified date range.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(e => `
    <tr>
      <td>${e.date}</td>
      <td style="font-weight: 700;">${e.driverName}</td>
      <td><span class="badge badge-info">${e.carNumber}</span></td>
      <td style="color: #60A5FA;">${formatPKR(e.totalEarnings)}</td>
      <td style="color: #F87171;">${formatPKR(e.fuelExpense)}</td>
      <td style="color: #F87171;">${formatPKR(e.otherExpense)}</td>
      <td style="color: var(--primary); font-weight: 800;">${formatPKR(e.netEarning)}</td>
      <td>${e.notes || '-'}</td>
    </tr>
  `).join('');
}

// Export Records to CSV / Excel File
function exportReportsCSV() {
  const driverFilter = document.getElementById('report-driver-filter')?.value || 'ALL';
  const startDate = document.getElementById('report-start-date')?.value || '';
  const endDate = document.getElementById('report-end-date')?.value || '';

  const filtered = appState.earnings.filter(e => {
    const matchesDriver = driverFilter === 'ALL' || e.driverId === driverFilter;
    const matchesStart = !startDate || e.date >= startDate;
    const matchesEnd = !endDate || e.date <= endDate;
    return matchesDriver && matchesStart && matchesEnd;
  });

  if (filtered.length === 0) {
    showToast('No data available to export.', 'warning');
    return;
  }

  const headers = ['Date', 'Driver Name', 'Car Registration', 'Total Earnings (PKR)', 'Fuel Expense (PKR)', 'Other Expense (PKR)', 'Net Earning (PKR)', 'Notes'];
  const rows = filtered.map(e => [
    `"${e.date}"`,
    `"${e.driverName}"`,
    `"${e.carNumber}"`,
    e.totalEarnings,
    e.fuelExpense,
    e.otherExpense,
    e.netEarning,
    `"${(e.notes || '').replace(/"/g, '""')}"`
  ]);

  let csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Brothers_Transport_Earnings_Report_${getTodayStr()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Financial CSV report downloaded!', 'success');
}

// Public Contact Form Submit Handler
function handleContactSubmit(e) {
  e.preventDefault();
  showToast('Thank you for contacting Brothers Transport Lahore! We will reach out on WhatsApp shortly.', 'success');
  e.target.reset();
}

// Utility UI Helpers
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'success') toast.style.borderLeftColor = 'var(--primary)';
  if (type === 'danger') toast.style.borderLeftColor = 'var(--accent-danger)';

  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}" style="color: var(--primary);"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
