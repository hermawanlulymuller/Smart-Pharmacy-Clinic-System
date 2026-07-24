/* ==========================================================================
   SMART PHARMACY & CLINIC MANAGEMENT SYSTEM
   Main Application Router, State Store, & UI Controller
   ========================================================================== */

class SmartAppController {
  constructor() {
    this.currentLanguage = localStorage.getItem("SMART_LANG") || APP_CONFIG.defaultLanguage;
    this.currentTheme = localStorage.getItem("SMART_THEME") || APP_CONFIG.defaultTheme;
    this.currentUser = JSON.parse(sessionStorage.getItem("SMART_USER") || "null");
    this.selectedRole = "admin";
    this.activeModule = "dashboard";
    this.charts = {};
    this.posCart = [];

    this.initTheme();
    this.initLanguage();
    this.initLandingGasInput();
    this.checkAuth();
    this.bindGlobalEvents();

    // Async background checks
    setTimeout(() => {
      try { this.initGasSyncStatus(); } catch(e){}
      try { this.checkLandingGasConnection(); } catch(e){}
    }, 100);
  }

  // Pre-fill landing page Google Sheet API URL field
  initLandingGasInput() {
    try {
      const landingInput = document.getElementById("landing-gas-url");
      if (landingInput) {
        landingInput.value = dbStore.getGasUrl();
      }
    } catch(e){}
  }

  // Live LED indicator checker for Landing Page
  async checkLandingGasConnection(showToast = false) {
    const landingInput = document.getElementById("landing-gas-url");
    const badge = document.getElementById("landing-sync-badge");
    const led = document.getElementById("landing-sync-led");
    const text = document.getElementById("landing-sync-text");

    const url = landingInput ? landingInput.value.trim() : dbStore.getGasUrl();

    if (!url) {
      if (badge) badge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all duration-300";
      if (led) led.className = "pulse-dot warning";
      if (text) text.textContent = "BELUM TERHUBUNG";
      return false;
    }

    if (text) text.textContent = "MEMERIKSA...";
    const isConnected = await gasSyncService.testConnection(url);

    if (isConnected) {
      if (badge) badge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all duration-300";
      if (led) led.className = "pulse-dot success";
      if (text) text.textContent = "TERHUBUNG (LIVE)";

      if (showToast && typeof Swal !== "undefined") {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: '⚡ Google Sheets 100% Terhubung!',
          showConfirmButton: false,
          timer: 1500,
          background: '#101B24',
          color: '#fff'
        });
      }
      return true;
    } else {
      if (badge) badge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-all duration-300";
      if (led) led.className = "pulse-dot danger";
      if (text) text.textContent = "GAGAL TERHUBUNG";

      if (showToast && typeof Swal !== "undefined") {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Gagal Terhubung ke Google Sheets',
          text: 'Periksa kembali URL Web App Apps Script Anda.',
          showConfirmButton: false,
          timer: 2000,
          background: '#101B24',
          color: '#fff'
        });
      }
      return false;
    }
  }

  // Auto-fill credential inputs based on role selection chip
  selectLoginRole(role) {
    this.selectedRole = role;
    const userInput = document.getElementById("login-username");
    const passInput = document.getElementById("login-password");

    const credentialsMap = {
      admin: { user: "admin@smartclinic.com", pass: "admin123" },
      doctor: { user: "dokter@smartclinic.com", pass: "doctor123" },
      pharmacist: { user: "apoteker@smartclinic.com", pass: "pharmacy123" },
      nurse: { user: "perawat@smartclinic.com", pass: "nurse123" },
      cashier: { user: "kasir@smartclinic.com", pass: "cashier123" },
      patient: { user: "pasien@smartclinic.com", pass: "patient123" }
    };

    const cred = credentialsMap[role] || credentialsMap.admin;
    if (userInput) userInput.value = cred.user;
    if (passInput) passInput.value = cred.pass;

    // Immediately log in as that role smoothly
    this.login(role);
  }

  // Login handler triggered when user clicks "Masuk Sekarang"
  loginFromLanding() {
    const landingInput = document.getElementById("landing-gas-url");
    const userInput = document.getElementById("login-username")?.value.trim() || "admin@smartclinic.com";
    
    // Save GAS URL if provided
    if (landingInput && landingInput.value.trim()) {
      dbStore.setGasUrl(landingInput.value.trim());
    }

    // Determine role from input username or selectedRole
    let role = this.selectedRole || "admin";
    const lowerUser = userInput.toLowerCase();
    if (lowerUser.includes("dokter")) role = "doctor";
    else if (lowerUser.includes("apoteker")) role = "pharmacist";
    else if (lowerUser.includes("perawat")) role = "nurse";
    else if (lowerUser.includes("kasir")) role = "cashier";
    else if (lowerUser.includes("pasien")) role = "patient";

    // Perform Login
    this.login(role, userInput);
  }

  // --- Google Sheets Realtime Sync Badge & Controller ---
  async initGasSyncStatus() {
    const dot = document.getElementById("gas-sync-status-dot");
    const text = document.getElementById("gas-sync-status-text");
    const icon = document.getElementById("gas-sync-icon");
    const navBtn = document.getElementById("navbar-sync-btn");

    if (!gasSyncService.getUrl()) {
      if (dot) dot.className = "pulse-dot warning";
      if (text) text.textContent = "Google Sheet: Offline";
      if (navBtn) navBtn.className = "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400";
      return;
    }

    if (text) text.textContent = "Checking Google Sheet...";
    const isConnected = await gasSyncService.testConnection();

    if (isConnected) {
      if (dot) dot.className = "pulse-dot success";
      if (text) text.textContent = "Google Sheet: Terhubung 🟢";
      if (icon) icon.className = "fas fa-check-circle text-emerald-400 text-xs ml-1";
      if (navBtn) navBtn.className = "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs font-bold text-emerald-300 shadow-md shadow-emerald-500/10";

      const updated = await gasSyncService.syncFromSheets();
      if (updated) {
        this.loadModule(this.activeModule);
      }
    } else {
      if (dot) dot.className = "pulse-dot warning";
      if (text) text.textContent = "Google Sheet: Local Only 🟡";
      if (navBtn) navBtn.className = "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/50 border border-amber-500/30 text-xs font-semibold text-amber-300";
    }
  }

  async pullAllFromGoogleSheets() {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: 'Menarik Data Google Sheets...',
        text: 'Mengambil data pasien, obat, janji temu & transaksi dari Google Sheets API...',
        background: '#101B24',
        color: '#fff',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });
    }

    try {
      const count = await gasSyncService.pullAllDataFromGoogleSheets();
      this.loadModule(this.activeModule);
      this.initGasSyncStatus();

      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: 'success',
          title: 'Data Berhasil Disinkronkan!',
          text: `${count} modul data telah ditarik dan disinkronkan dari Google Sheets.`,
          background: '#101B24',
          color: '#fff',
          confirmButtonColor: '#00C2A8'
        });
      }
    } catch (err) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: 'warning',
          title: 'Gagal Menarik Data',
          text: err.message || 'Menggunakan data LocalStorage offline.',
          background: '#101B24',
          color: '#fff'
        });
      }
    }
  }

  async triggerManualSync() {
    const icon = document.getElementById("gas-sync-icon");
    if (icon) icon.className = "fas fa-spinner fa-spin text-teal-400 text-xs ml-1";

    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: 'Menyinkronkan Data...',
        text: 'Menghubungkan dengan Google Sheets Database...',
        background: '#101B24',
        color: '#fff',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });
    }

    try {
      if (!gasSyncService.getUrl()) {
        throw new Error("URL Google Apps Script belum dikonfigurasi di Settings atau Landing Page.");
      }

      await gasSyncService.syncAllToGoogleSheets();
      await gasSyncService.syncFromSheets();
      this.loadModule(this.activeModule);
      this.initGasSyncStatus();

      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: 'success',
          title: 'Sinkronisasi Berhasil!',
          text: 'Data UI & Google Sheet telah 100% sinkron real-time.',
          background: '#101B24',
          color: '#fff',
          confirmButtonColor: '#00C2A8'
        });
      }
    } catch (err) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: 'warning',
          title: 'Sinkronisasi Terbatas',
          text: err.message || 'Menggunakan data LocalStorage offline.',
          background: '#101B24',
          color: '#fff'
        });
      }
    }
  }

  // --- Theme & Language Management ---
  initTheme() {
    document.documentElement.setAttribute("data-theme", this.currentTheme);
    const themeIcon = document.getElementById("theme-icon");
    if (themeIcon) {
      themeIcon.className = this.currentTheme === "dark" ? "fas fa-moon text-amber-400" : "fas fa-sun text-yellow-500";
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("SMART_THEME", this.currentTheme);
    this.initTheme();
    if (typeof Swal !== "undefined") {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `Theme: ${this.currentTheme.toUpperCase()} Mode`,
        showConfirmButton: false,
        timer: 1500,
        background: '#101B24',
        color: '#fff'
      });
    }
  }

  initLanguage() {
    const dict = APP_CONFIG.translations[this.currentLanguage] || APP_CONFIG.translations.id;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) {
        if (el.tagName === "INPUT" && el.placeholder) {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });
    const langLabel = document.getElementById("current-lang-label");
    if (langLabel) langLabel.textContent = this.currentLanguage.toUpperCase();
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === "id" ? "en" : "id";
    localStorage.setItem("SMART_LANG", this.currentLanguage);
    this.initLanguage();
    if (typeof Swal !== "undefined") {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Bahasa: ${this.currentLanguage === 'id' ? 'Bahasa Indonesia' : 'English'}`,
        showConfirmButton: false,
        timer: 1500,
        background: '#101B24',
        color: '#fff'
      });
    }
  }

  // --- Auth & Role Guard ---
  checkAuth() {
    const landingView = document.getElementById("landing-login-view");
    const appShellView = document.getElementById("app-shell-view");

    if (!this.currentUser) {
      if (landingView) {
        landingView.classList.remove("hidden");
        landingView.style.display = "flex";
      }
      if (appShellView) {
        appShellView.classList.add("hidden");
        appShellView.style.display = "none";
      }
    } else {
      if (landingView) {
        landingView.classList.add("hidden");
        landingView.style.display = "none";
      }
      if (appShellView) {
        appShellView.classList.remove("hidden");
        appShellView.style.display = "flex";
      }
      this.updateUserUI();
      this.loadModule(this.activeModule);
    }
  }

  login(role = "admin", customName = "") {
    try {
      const landingInput = document.getElementById("landing-gas-url");
      if (landingInput && landingInput.value.trim()) {
        dbStore.setGasUrl(landingInput.value.trim());
      }

      const roleConfig = (APP_CONFIG && APP_CONFIG.roles && APP_CONFIG.roles[role]) 
        ? APP_CONFIG.roles[role] 
        : { label: role, badge: "badge-teal" };
      
      this.currentUser = {
        name: customName || (role === 'patient' ? 'Budi Santoso (Pasien)' : `Staf ${roleConfig.label}`),
        role: role,
        roleBadge: roleConfig.badge,
        roleLabel: roleConfig.label,
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
        loginTime: new Date().toLocaleTimeString('id-ID')
      };
      
      sessionStorage.setItem("SMART_USER", JSON.stringify(this.currentUser));
      try { dbStore.logAction("User Login", `Login sebagai ${this.currentUser.roleLabel}`); } catch(e){}
      
      // GUARANTEED INSTANT DOM SWITCH!
      const landingView = document.getElementById("landing-login-view");
      const appShellView = document.getElementById("app-shell-view");
      
      if (landingView) {
        landingView.classList.add("hidden");
        landingView.style.display = "none";
      }
      if (appShellView) {
        appShellView.classList.remove("hidden");
        appShellView.style.display = "flex";
      }

      this.updateUserUI();
      this.loadModule(this.activeModule || "dashboard");

      // Non-blocking async background sync
      setTimeout(() => {
        try { this.initGasSyncStatus(); } catch(e){}
      }, 100);

      // Non-blocking toast
      if (typeof Swal !== "undefined") {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Selamat Datang, ${this.currentUser.name}!`,
          showConfirmButton: false,
          timer: 1800,
          background: '#101B24',
          color: '#fff'
        });
      }
    } catch(err) {
      console.error("Login fallback handler:", err);
      const landingView = document.getElementById("landing-login-view");
      const appShellView = document.getElementById("app-shell-view");
      if (landingView) landingView.style.display = "none";
      if (appShellView) appShellView.style.display = "flex";
    }
  }

  logout() {
    sessionStorage.removeItem("SMART_USER");
    this.currentUser = null;
    this.checkAuth();
    if (typeof Swal !== "undefined") {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Anda telah logout',
        showConfirmButton: false,
        timer: 1500,
        background: '#101B24',
        color: '#fff'
      });
    }
  }

  updateUserUI() {
    if (!this.currentUser) return;
    const nameEl = document.getElementById("user-display-name");
    const roleEl = document.getElementById("user-display-role");
    if (nameEl) nameEl.textContent = this.currentUser.name;
    if (roleEl) {
      roleEl.textContent = this.currentUser.roleLabel;
      roleEl.className = `badge-status ${this.currentUser.roleBadge}`;
    }
  }

  // --- Router & Module Loader with RBAC Guard ---
  loadModule(moduleName) {
    this.activeModule = moduleName;
    
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("data-module") === moduleName) {
        link.classList.add("active");
      }
    });

    document.querySelectorAll(".module-view").forEach(view => {
      view.classList.add("hidden");
    });

    const targetView = document.getElementById(`module-${moduleName}`);
    if (targetView) {
      targetView.classList.remove("hidden");
    }

    try {
      switch (moduleName) {
        case "dashboard":
          this.renderDashboard();
          break;
        case "patients":
          this.renderPatientsTable();
          break;
        case "doctors":
          this.renderDoctorsGrid();
          break;
        case "appointments":
          this.renderAppointmentsTable();
          break;
        case "medicine":
          this.renderMedicinesTable();
          break;
        case "consultation":
          this.renderConsultationRoom();
          break;
        case "ai-assistant":
          break;
        case "nurse":
          this.renderNurseQueue();
          break;
        case "pharmacist":
          this.renderPharmacistDispensing();
          break;
        case "cashier":
          this.renderCashierPOS();
          break;
        case "reports":
          this.renderReports();
          break;
        case "settings":
          this.renderSettings();
          break;
      }
    } catch(e) {
      console.warn(`Module load warning [${moduleName}]:`, e);
    }
  }

  // --- Dashboard Render & Charts ---
  renderDashboard() {
    try {
      const patients = dbStore.get("patients") || [];
      const doctors = dbStore.get("doctors") || [];
      const medicines = dbStore.get("medicines") || [];
      const appointments = dbStore.get("appointments") || [];
      const transactions = dbStore.get("transactions") || [];

      const elPatients = document.getElementById("kpi-patients-count");
      const elDoctors = document.getElementById("kpi-doctors-count");
      const elStock = document.getElementById("kpi-stock-count");
      const elLowStock = document.getElementById("kpi-lowstock-count");
      const elRevenue = document.getElementById("kpi-revenue-today");

      if (elPatients) elPatients.textContent = patients.length;
      if (elDoctors) elDoctors.textContent = doctors.filter(d => d.availability === "Online").length;
      if (elStock) elStock.textContent = medicines.length;

      const lowStockCount = medicines.filter(m => m.stock <= m.minStock).length;
      if (elLowStock) elLowStock.textContent = lowStockCount;

      const totalRev = transactions.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
      if (elRevenue) elRevenue.textContent = `Rp ${totalRev.toLocaleString('id-ID')}`;

      const activityFeed = document.getElementById("dashboard-activity-feed");
      if (activityFeed) {
        const logs = (dbStore.get("logs") || []).slice(0, 5);
        activityFeed.innerHTML = logs.map(l => `
          <div class="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div class="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-white">${l.user}</span>
                <span class="text-xs text-slate-400">${l.timestamp}</span>
              </div>
              <p class="text-xs text-teal-300 font-medium">${l.action}</p>
              <p class="text-xs text-slate-300 mt-1">${l.detail}</p>
            </div>
          </div>
        `).join("");
      }

      this.renderDashboardCharts();
    } catch(err) {
      console.warn("Dashboard render fallback:", err);
    }
  }

  renderDashboardCharts() {
    if (typeof Chart === "undefined") return;
    try {
      const ctxRevenue = document.getElementById("chart-revenue-canvas");
      const ctxUsage = document.getElementById("chart-usage-canvas");

      if (ctxRevenue) {
        if (this.charts.revenue) this.charts.revenue.destroy();
        this.charts.revenue = new Chart(ctxRevenue, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
            datasets: [{
              label: 'Pendapatan (Juta Rp)',
              data: [45, 52, 60, 58, 75, 82, 98],
              borderColor: '#00C2A8',
              backgroundColor: 'rgba(0, 194, 168, 0.15)',
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: '#14E1C6',
              pointRadius: 5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94A3B8' } } },
            scales: {
              x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
              y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
          }
        });
      }

      if (ctxUsage) {
        if (this.charts.usage) this.charts.usage.destroy();
        this.charts.usage = new Chart(ctxUsage, {
          type: 'doughnut',
          data: {
            labels: ['Paracetamol', 'Amoxicillin', 'Omeprazole', 'Amlodipine', 'Vitamin C'],
            datasets: [{
              data: [35, 15, 20, 10, 20],
              backgroundColor: ['#00C2A8', '#14E1C6', '#38BDF8', '#FFC857', '#4ADE80'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8' } } }
          }
        });
      }
    } catch(err) {
      console.warn("Charts render error:", err);
    }
  }

  // --- Patients Module ---
  renderPatientsTable() {
    const tableBody = document.getElementById("patients-table-body");
    if (!tableBody) return;
    const patients = dbStore.get("patients") || [];

    tableBody.innerHTML = patients.map(p => `
      <tr>
        <td>
          <div class="font-mono text-teal-400 font-bold text-xs">${p.id}</div>
          <div class="text-xs text-slate-400">${p.insurance}</div>
        </td>
        <td>
          <div class="font-bold text-white">${p.name}</div>
          <div class="text-xs text-slate-400">${p.dob} (${p.gender})</div>
        </td>
        <td>
          <div class="text-xs text-slate-200">${p.phone}</div>
          <div class="text-xs text-slate-400">${p.email}</div>
        </td>
        <td><span class="badge-status badge-info">${p.bloodType}</span></td>
        <td><span class="badge-status badge-danger">${p.allergy}</span></td>
        <td>
          <div class="flex items-center gap-2">
            <button onclick="smartApp.viewPatientQR('${p.id}')" class="px-2 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded hover:bg-teal-500/40 text-xs">
              <i class="fas fa-qrcode"></i> QR
            </button>
            <button onclick="smartApp.viewMedicalRecord('${p.id}')" class="px-2 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded hover:bg-sky-500/40 text-xs">
              <i class="fas fa-notes-medical"></i> Rekam Medis
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  addNewPatientModal() {
    Swal.fire({
      title: 'Registrasi Pasien Baru',
      html: `
        <div class="space-y-3 text-left">
          <input id="swal-pat-name" class="form-input" placeholder="Nama Lengkap Pasien">
          <div class="grid grid-cols-2 gap-2">
            <select id="swal-pat-gender" class="form-input">
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <input id="swal-pat-dob" type="date" class="form-input">
          </div>
          <input id="swal-pat-phone" class="form-input" placeholder="No. WhatsApp / HP">
          <input id="swal-pat-email" class="form-input" placeholder="Alamat Email">
          <input id="swal-pat-insurance" class="form-input" placeholder="Asuransi (BPJS / Mandiri / Umum)">
          <input id="swal-pat-allergy" class="form-input" placeholder="Alergi Obat / Makanan">
          <textarea id="swal-pat-history" class="form-input" placeholder="Riwayat Penyakit Dahulu"></textarea>
        </div>
      `,
      focusConfirm: false,
      background: '#101B24',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Simpan & Sync Google Sheet',
      confirmButtonColor: '#00C2A8',
      preConfirm: () => {
        const name = document.getElementById('swal-pat-name').value;
        if (!name) {
          Swal.showValidationMessage('Nama Pasien wajib diisi!');
          return false;
        }
        return {
          id: `PAT-2026-${Math.floor(100 + Math.random() * 900)}`,
          name: name,
          gender: document.getElementById('swal-pat-gender').value,
          dob: document.getElementById('swal-pat-dob').value || "1995-01-01",
          phone: document.getElementById('swal-pat-phone').value || "-",
          email: document.getElementById('swal-pat-email').value || "-",
          insurance: document.getElementById('swal-pat-insurance').value || "Umum",
          allergy: document.getElementById('swal-pat-allergy').value || "Tidak Ada",
          medicalHistory: document.getElementById('swal-pat-history').value || "Tidak ada riwayat signifikan",
          bloodType: "O+",
          visitsCount: 1,
          lastVisit: new Date().toISOString().split('T')[0]
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        dbStore.add("patients", result.value);
        this.renderPatientsTable();
        Swal.fire({ icon: 'success', title: 'Pasien Berhasil Didaftarkan!', text: 'Data langsung disinkronkan ke Google Sheets.', background: '#101B24', color: '#fff' });
      }
    });
  }

  viewPatientQR(patientId) {
    const p = (dbStore.get("patients") || []).find(x => x.id === patientId);
    if (!p) return;

    Swal.fire({
      title: `Patient Card QR - ${p.name}`,
      html: `
        <div class="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-teal-500/30">
          <div id="qrcode-canvas" class="bg-white p-3 rounded-lg mb-3"></div>
          <div class="text-sm font-mono text-teal-400 font-bold">${p.id}</div>
          <div class="text-xs text-slate-300 mt-1">${p.name} | ${p.insurance}</div>
          <div class="text-xs text-rose-400 mt-2 font-semibold"><i class="fas fa-exclamation-triangle"></i> Alergi: ${p.allergy}</div>
        </div>
      `,
      didOpen: () => {
        if (typeof QRCode !== "undefined") {
          new QRCode(document.getElementById("qrcode-canvas"), {
            text: p.id,
            width: 160,
            height: 160
          });
        }
      },
      background: '#101B24',
      color: '#fff',
      confirmButtonColor: '#00C2A8'
    });
  }

  viewMedicalRecord(patientId) {
    const p = (dbStore.get("patients") || []).find(x => x.id === patientId);
    if (!p) return;

    Swal.fire({
      title: `Rekam Medis: ${p.name}`,
      width: '650px',
      html: `
        <div class="text-left space-y-4 max-h-[400px] overflow-y-auto pr-2">
          <div class="p-3 bg-slate-900/80 rounded-lg border border-teal-500/20">
            <h4 class="text-xs font-bold text-teal-400 uppercase">Informasi Klinis Utama</h4>
            <p class="text-xs text-slate-300 mt-1"><strong>Riwayat Penyakit:</strong> ${p.medicalHistory}</p>
            <p class="text-xs text-rose-400 mt-1"><strong>Alergi Kontraindikasi:</strong> ${p.allergy}</p>
          </div>

          <div class="relative border-l-2 border-teal-500/40 ml-3 pl-4 space-y-4">
            <div class="relative">
              <div class="absolute -left-[23px] top-1 w-3 h-3 bg-teal-400 rounded-full"></div>
              <div class="text-xs text-teal-300 font-bold">2026-07-20 - Poli Interna (dr. Andi Wijaya, Sp.PD)</div>
              <p class="text-xs text-slate-200 mt-1">Keluhan tekanan darah naik & leher kaku. TD: 140/90 mmHg. Diberikan Amlodipine 10mg & Paracetamol.</p>
            </div>
            <div class="relative">
              <div class="absolute -left-[23px] top-1 w-3 h-3 bg-sky-400 rounded-full"></div>
              <div class="text-xs text-sky-300 font-bold">2026-06-12 - Telemedisin Consultation</div>
              <p class="text-xs text-slate-200 mt-1">Konsultasi gastritis berulang. Resep Omeprazole 20mg 2x1 cap sebelum makan.</p>
            </div>
          </div>
        </div>
      `,
      background: '#101B24',
      color: '#fff',
      confirmButtonColor: '#00C2A8'
    });
  }

  // --- Doctors Module ---
  renderDoctorsGrid() {
    const grid = document.getElementById("doctors-grid-container");
    if (!grid) return;
    const doctors = dbStore.get("doctors") || [];

    grid.innerHTML = doctors.map(d => `
      <div class="glass-card p-5 relative overflow-hidden group">
        <div class="flex items-start gap-4">
          <img src="${d.photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300'}" class="w-16 h-16 rounded-full object-cover border-2 border-teal-400 shadow-md shrink-0">
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-white text-base truncate">${d.name}</h3>
              <span class="badge-status ${d.availability === 'Online' ? 'badge-success' : 'badge-warning'}">
                <span class="pulse-dot ${d.availability === 'Online' ? 'success' : 'warning'}"></span> ${d.availability}
              </span>
            </div>
            <p class="text-xs text-teal-400 font-medium">${d.specialization}</p>
            <p class="text-xs text-slate-400 mt-1"><i class="fas fa-clinic-medical mr-1"></i> ${d.room}</p>
            <p class="text-xs text-slate-400"><i class="fas fa-clock mr-1"></i> ${d.schedule}</p>
            
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
              <div class="text-xs">
                <span class="text-slate-400">Tarif Konsultasi:</span>
                <span class="font-bold text-teal-300 block">Rp ${Number(d.consultationFee).toLocaleString('id-ID')}</span>
              </div>
              <button onclick="smartApp.bookDoctorAppointment('${d.id}')" class="px-3 py-1.5 glow-teal-btn rounded-lg text-xs font-semibold">
                <i class="fas fa-calendar-plus mr-1"></i> Buat Janji
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  }

  bookDoctorAppointment(doctorId) {
    const d = (dbStore.get("doctors") || []).find(x => x.id === doctorId);
    if (!d) return;

    Swal.fire({
      title: `Buat Janji Temu: ${d.name}`,
      html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="text-xs text-slate-400">Pilih Pasien:</label>
            <select id="swal-apt-patient" class="form-input mt-1">
              ${(dbStore.get("patients") || []).map(p => `<option value="${p.name}">${p.name} (${p.id})</option>`).join("")}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-slate-400">Tanggal Booking:</label>
              <input id="swal-apt-date" type="date" class="form-input mt-1" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div>
              <label class="text-xs text-slate-400">Jam Praktek:</label>
              <select id="swal-apt-time" class="form-input mt-1">
                <option value="09:00 AM">09:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs text-slate-400">Tipe Konsultasi:</label>
            <select id="swal-apt-type" class="form-input mt-1">
              <option value="Tatap Muka">Kunjungan Tatap Muka di Klinik</option>
              <option value="Online Telemedisin">Telemedisin / Virtual Call</option>
            </select>
          </div>
          <textarea id="swal-apt-notes" class="form-input" placeholder="Keluhan Utama / Catatan Tambahan"></textarea>
        </div>
      `,
      background: '#101B24',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Konfirmasi & Sync Google Sheet',
      confirmButtonColor: '#00C2A8',
      preConfirm: () => {
        return {
          id: `APT-${Math.floor(8000 + Math.random() * 999)}`,
          patientName: document.getElementById('swal-apt-patient').value,
          doctorName: d.name,
          date: document.getElementById('swal-apt-date').value,
          time: document.getElementById('swal-apt-time').value,
          type: document.getElementById('swal-apt-type').value,
          notes: document.getElementById('swal-apt-notes').value || "Janji temu medis",
          queueNumber: `Q-${Math.floor(1 + Math.random() * 20)}`,
          status: "Menunggu Antrean"
        };
      }
    }).then((res) => {
      if (res.isConfirmed) {
        dbStore.add("appointments", res.value);
        this.renderAppointmentsTable();
        Swal.fire({
          icon: 'success',
          title: 'Booking Berhasil!',
          text: `Nomor Antrean Anda: ${res.value.queueNumber}. Data disinkronkan ke Google Sheet.`,
          background: '#101B24',
          color: '#fff'
        });
      }
    });
  }

  // --- Appointments Table ---
  renderAppointmentsTable() {
    const tableBody = document.getElementById("appointments-table-body");
    if (!tableBody) return;
    const apts = dbStore.get("appointments") || [];

    tableBody.innerHTML = apts.map(a => `
      <tr>
        <td><span class="font-mono font-bold text-teal-400">${a.queueNumber}</span></td>
        <td>
          <div class="font-bold text-white">${a.patientName}</div>
          <div class="text-xs text-slate-400">${a.notes}</div>
        </td>
        <td>
          <div class="text-xs font-semibold text-teal-300">${a.doctorName}</div>
          <div class="text-xs text-slate-400">${a.date} | ${a.time}</div>
        </td>
        <td><span class="badge-status badge-teal">${a.type}</span></td>
        <td><span class="badge-status badge-success">${a.status}</span></td>
        <td>
          <button onclick="smartApp.sendWhatsAppReminder('${a.patientName}', '${a.date}', '${a.queueNumber}')" class="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs hover:bg-emerald-500/30">
            <i class="fab fa-whatsapp mr-1"></i> Remind WA
          </button>
        </td>
      </tr>
    `).join("");
  }

  sendWhatsAppReminder(name, date, queue) {
    const text = encodeURIComponent(`Halo Budi/Pasien ${name}, ini pengingat dari Smart Clinic untuk jadwal kontrol Anda pada ${date}. Nomor Antrean Anda: ${queue}. Sampai jumpa di Klinik!`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  // --- Medicine / Inventory Module ---
  renderMedicinesTable() {
    const tableBody = document.getElementById("medicines-table-body");
    if (!tableBody) return;
    const medicines = dbStore.get("medicines") || [];

    tableBody.innerHTML = medicines.map(m => {
      const isLow = Number(m.stock) <= Number(m.minStock);
      const isNearExp = new Date(m.expiredDate) < new Date("2026-10-01");
      return `
        <tr>
          <td>
            <div class="flex items-center gap-3">
              <img src="${m.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'}" class="w-10 h-10 rounded-lg object-cover border border-slate-700">
              <div>
                <div class="font-bold text-white text-sm">${m.name}</div>
                <div class="text-xs text-slate-400">${m.category} | ${m.brand}</div>
              </div>
            </div>
          </td>
          <td><span class="font-mono text-xs text-slate-300">${m.batchNumber}</span></td>
          <td>
            <span class="text-xs font-bold ${isNearExp ? 'text-rose-400' : 'text-slate-300'}">
              ${m.expiredDate} ${isNearExp ? '<i class="fas fa-exclamation-circle ml-1"></i>' : ''}
            </span>
          </td>
          <td>
            <div class="font-bold text-teal-300">Rp ${Number(m.sellingPrice).toLocaleString('id-ID')}</div>
            <div class="text-xs text-slate-500">Beli: Rp ${Number(m.purchasePrice).toLocaleString('id-ID')}</div>
          </td>
          <td>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm ${isLow ? 'text-rose-400 font-extrabold' : 'text-emerald-400'}">${m.stock}</span>
              ${isLow ? '<span class="badge-status badge-danger">LOW STOCK</span>' : '<span class="badge-status badge-success">OK</span>'}
            </div>
          </td>
          <td><span class="text-xs text-slate-400">${m.location}</span></td>
          <td>
            <div class="flex gap-2">
              <button onclick="smartApp.generateMedicineQR('${m.id}', '${m.name}')" class="px-2 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded hover:bg-teal-500/40 text-xs">
                <i class="fas fa-barcode"></i> Code
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  // --- Pharmacist Form: Add New Medicine Batch ---
  addNewMedicineModal() {
    Swal.fire({
      title: 'Input Obat Baru (Stok Apotek)',
      width: '650px',
      html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="text-xs text-slate-400">Nama Obat & Sediaan:</label>
            <input id="swal-med-name" class="form-input mt-1" placeholder="Misal: Paracetamol 500mg Forte">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-slate-400">Kategori Obat:</label>
              <select id="swal-med-cat" class="form-input mt-1">
                <option value="Obat Bebas">Obat Bebas (Hijau)</option>
                <option value="Obat Bebas Terbatas">Obat Bebas Terbatas (Biru)</option>
                <option value="Obat Keras / Resep">Obat Keras / Resep (Merah K)</option>
                <option value="Antibiotik">Antibiotik</option>
                <option value="Vitamin & Suplemen">Vitamin & Suplemen</option>
                <option value="Alat Kesehatan">Alat Kesehatan & BMHP</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-slate-400">Brand / Pabrikan:</label>
              <input id="swal-med-brand" class="form-input mt-1" placeholder="Misal: Kimia Farma / Sanbe">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-slate-400">No. Batch Produksi:</label>
              <input id="swal-med-batch" class="form-input mt-1" placeholder="BCH-2026-901">
            </div>
            <div>
              <label class="text-xs text-slate-400">Tanggal Kadaluarsa (Expired):</label>
              <input id="swal-med-exp" type="date" class="form-input mt-1" value="2028-12-31">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="text-xs text-slate-400">Harga Beli (Rp):</label>
              <input id="swal-med-purchase" type="number" class="form-input mt-1" placeholder="10000">
            </div>
            <div>
              <label class="text-xs text-slate-400">Harga Jual (Rp):</label>
              <input id="swal-med-selling" type="number" class="form-input mt-1" placeholder="15000">
            </div>
            <div>
              <label class="text-xs text-slate-400">Stok Awal (Unit):</label>
              <input id="swal-med-stock" type="number" class="form-input mt-1" placeholder="100">
            </div>
          </div>
          <div>
            <label class="text-xs text-slate-400">Lokasi Rak Simpan:</label>
            <input id="swal-med-location" class="form-input mt-1" placeholder="Rak A-02 / Lemari Pendingin 4°C">
          </div>
        </div>
      `,
      background: '#101B24',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Simpan & Sync Google Sheet',
      confirmButtonColor: '#00C2A8',
      preConfirm: () => {
        const name = document.getElementById('swal-med-name').value;
        const sellingPrice = document.getElementById('swal-med-selling').value;
        if (!name || !sellingPrice) {
          Swal.showValidationMessage('Nama Obat dan Harga Jual wajib diisi!');
          return false;
        }
        return {
          id: `MED-${Math.floor(1000 + Math.random() * 9000)}`,
          name: name,
          category: document.getElementById('swal-med-cat').value,
          brand: document.getElementById('swal-med-brand').value || "Generik",
          batchNumber: document.getElementById('swal-med-batch').value || `BCH-${Date.now().toString().slice(-6)}`,
          expiredDate: document.getElementById('swal-med-exp').value || "2028-12-31",
          purchasePrice: Number(document.getElementById('swal-med-purchase').value || 10000),
          sellingPrice: Number(sellingPrice),
          stock: Number(document.getElementById('swal-med-stock').value || 50),
          minStock: 10,
          location: document.getElementById('swal-med-location').value || "Rak Umum A1",
          image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300"
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        dbStore.add("medicines", result.value);
        this.renderMedicinesTable();
        this.renderPharmacistDispensing();
        Swal.fire({
          icon: 'success',
          title: 'Obat Baru Berhasil Ditambahkan!',
          text: 'Data langsung disinkronkan ke Google Sheets Database.',
          background: '#101B24',
          color: '#fff'
        });
      }
    });
  }

  generateMedicineQR(medId, medName) {
    Swal.fire({
      title: `QR & Barcode: ${medName}`,
      html: `
        <div class="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-teal-500/30">
          <div id="med-qrcode-canvas" class="bg-white p-3 rounded-lg mb-3"></div>
          <div class="font-mono text-teal-400 font-bold text-sm">${medId}</div>
        </div>
      `,
      didOpen: () => {
        if (typeof QRCode !== "undefined") {
          new QRCode(document.getElementById("med-qrcode-canvas"), {
            text: medId,
            width: 140,
            height: 140
          });
        }
      },
      background: '#101B24',
      color: '#fff',
      confirmButtonColor: '#00C2A8'
    });
  }

  // --- Telemedicine Room ---
  renderConsultationRoom() {
    const chatContainer = document.getElementById("telemedicine-chat-body");
    if (!chatContainer) return;
  }

  sendConsultationMessage() {
    const input = document.getElementById("telemedicine-chat-input");
    const container = document.getElementById("telemedicine-chat-body");
    if (!input || !input.value.trim() || !container) return;

    const msg = input.value.trim();
    input.value = "";

    container.innerHTML += `
      <div class="flex flex-col items-end mb-4">
        <div class="chat-bubble-user">
          <p class="text-sm">${msg}</p>
        </div>
        <span class="text-[10px] text-slate-400 mt-1">${new Date().toLocaleTimeString('id-ID')}</span>
      </div>
    `;
    container.scrollTop = container.scrollHeight;

    setTimeout(async () => {
      const response = await aiService.askHealthAssistant(msg);
      container.innerHTML += `
        <div class="flex flex-col items-start mb-4">
          <div class="chat-bubble-ai">
            <div class="flex items-center gap-2 mb-2 pb-1 border-b border-slate-700">
              <i class="fas fa-user-md text-teal-400"></i>
              <span class="text-xs font-bold text-teal-300">dr. Andi Wijaya, Sp.PD (AI Clinical Support)</span>
            </div>
            <p class="text-sm whitespace-pre-line">${response}</p>
          </div>
          <span class="text-[10px] text-slate-400 mt-1">${new Date().toLocaleTimeString('id-ID')}</span>
        </div>
      `;
      container.scrollTop = container.scrollHeight;
    }, 1000);
  }

  // --- AI Health Assistant Chat ---
  sendAiAssistantMessage(queryOverride = null) {
    const input = document.getElementById("ai-assistant-input");
    const container = document.getElementById("ai-chat-body");
    
    const userQuery = queryOverride || (input ? input.value.trim() : "");
    if (!userQuery || !container) return;

    if (input) input.value = "";

    container.innerHTML += `
      <div class="flex flex-col items-end mb-4">
        <div class="chat-bubble-user">
          <p class="text-sm">${userQuery}</p>
        </div>
      </div>
    `;
    container.scrollTop = container.scrollHeight;

    setTimeout(async () => {
      const answer = await aiService.askHealthAssistant(userQuery);
      container.innerHTML += `
        <div class="flex flex-col items-start mb-4">
          <div class="chat-bubble-ai">
            <div class="flex items-center gap-2 mb-1">
              <i class="fas fa-robot text-teal-400"></i>
              <span class="text-xs font-bold text-teal-400">Smart Health Assistant AI</span>
            </div>
            <p class="text-sm whitespace-pre-line">${answer}</p>
          </div>
        </div>
      `;
      container.scrollTop = container.scrollHeight;
    }, 800);
  }

  // --- Nurse Workstation ---
  renderNurseQueue() {
    const queueList = document.getElementById("nurse-queue-list");
    if (!queueList) return;
    const apts = dbStore.get("appointments") || [];

    queueList.innerHTML = apts.map(a => `
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono text-teal-400 font-bold">${a.queueNumber}</span>
            <span class="font-bold text-white text-sm">${a.patientName}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Dokter: ${a.doctorName}</p>
        </div>
        <button onclick="smartApp.openVitalSignsModal('${a.patientName}')" class="px-3 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-xs hover:bg-teal-500/30">
          <i class="fas fa-heartbeat mr-1"></i> Input Tanda Vital
        </button>
      </div>
    `).join("");
  }

  openVitalSignsModal(patientName) {
    Swal.fire({
      title: `Input Tanda Vital: ${patientName}`,
      html: `
        <div class="grid grid-cols-2 gap-3 text-left">
          <div>
            <label class="text-xs text-slate-400">Tekanan Darah (mmHg):</label>
            <input id="v-bp" class="form-input mt-1" placeholder="120/80">
          </div>
          <div>
            <label class="text-xs text-slate-400">Nadi (bpm):</label>
            <input id="v-pulse" class="form-input mt-1" placeholder="80">
          </div>
          <div>
            <label class="text-xs text-slate-400">Suhu (°C):</label>
            <input id="v-temp" class="form-input mt-1" placeholder="36.5">
          </div>
          <div>
            <label class="text-xs text-slate-400">SpO2 (%):</label>
            <input id="v-spo2" class="form-input mt-1" placeholder="98%">
          </div>
        </div>
      `,
      background: '#101B24',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Simpan Vital Signs',
      confirmButtonColor: '#00C2A8'
    }).then(res => {
      if (res.isConfirmed) {
        dbStore.logAction("Nurse Workstation", `Tanda vital tercatat untuk ${patientName}`);
        Swal.fire({ icon: 'success', title: 'Tanda Vital Berhasil Disimpan!', background: '#101B24', color: '#fff' });
      }
    });
  }

  // --- Pharmacist Dispensing ---
  renderPharmacistDispensing() {
    const list = document.getElementById("pharmacist-dispense-list");
    if (!list) return;

    list.innerHTML = `
      <div class="p-4 bg-slate-900 rounded-xl border border-teal-500/20 space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h4 class="font-bold text-white text-sm">Resep: PAT-2026-001 (Budi Santoso)</h4>
            <span class="text-xs text-teal-400">Dokter: dr. Andi Wijaya, Sp.PD</span>
          </div>
          <span class="badge-status badge-warning">Siap Dispensing</span>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-xs text-slate-300">
            <span>1. Paracetamol 500mg Forte (2 Strip)</span>
            <span class="text-emerald-400 font-bold">Aturan: 3x1 Sesudah Makan</span>
          </div>
          <div class="flex justify-between text-xs text-slate-300">
            <span>2. Amlodipine Besylate 10mg (1 Strip)</span>
            <span class="text-emerald-400 font-bold">Aturan: 1x1 Pagi Hari</span>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button onclick="smartApp.printMedicineLabel()" class="px-3 py-1.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-xs">
            <i class="fas fa-print mr-1"></i> Cetak Etiket Label
          </button>
          <button onclick="smartApp.dispenseConfirm()" class="px-3 py-1.5 glow-teal-btn rounded text-xs font-bold">
            <i class="fas fa-check-circle mr-1"></i> Konfirmasi Dispensing
          </button>
        </div>
      </div>
    `;
  }

  printMedicineLabel() {
    Swal.fire({
      title: 'Pratinjau Etiket Label Obat',
      html: `
        <div class="p-4 bg-white text-black rounded-lg text-left text-xs font-mono border-2 border-dashed border-slate-400 space-y-2">
          <div class="text-center font-bold border-b border-black pb-1">KLINIK & APOTEK SMART CARE</div>
          <div><strong>No. Resep:</strong> RSP-88012</div>
          <div><strong>Pasien:</strong> Budi Santoso (PAT-2026-001)</div>
          <div><strong>Obat:</strong> Paracetamol 500mg Forte</div>
          <div class="text-sm font-bold border-y border-black py-1 text-center">3 X SEHARI 1 KAPLET (SESUDAH MAKAN)</div>
          <div class="text-[10px] text-right">Tgl: 24/07/2026 | Exp: 12/2028</div>
        </div>
      `,
      background: '#101B24',
      color: '#fff',
      confirmButtonText: 'Cetak Sekarang',
      confirmButtonColor: '#00C2A8'
    });
  }

  dispenseConfirm() {
    dbStore.logAction("Pharmacist", "Penyerahan resep & obat selesai diserahkan ke pasien Budi Santoso");
    Swal.fire({ icon: 'success', title: 'Dispensing Berhasil!', background: '#101B24', color: '#fff' });
  }

  // --- Cashier POS Billing & Multi-Payment System ---
  renderCashierPOS() {
    const rbacDenied = document.getElementById("cashier-rbac-denied");
    const posContainer = document.getElementById("cashier-pos-container");

    // RBAC Guard Check: Only Cashier and Admin are allowed!
    const role = this.currentUser ? this.currentUser.role : "";
    if (role !== "cashier" && role !== "admin") {
      if (rbacDenied) rbacDenied.classList.remove("hidden");
      if (posContainer) posContainer.classList.add("hidden");
      return;
    } else {
      if (rbacDenied) rbacDenied.classList.add("hidden");
      if (posContainer) posContainer.classList.remove("hidden");
    }

    const itemsContainer = document.getElementById("pos-items-list");
    if (!itemsContainer) return;
    const meds = dbStore.get("medicines") || [];

    itemsContainer.innerHTML = meds.map(m => `
      <div onclick="smartApp.addToPOSCart('${m.name}', ${m.sellingPrice}, 'Obat Apotek')" class="p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-teal-500/50 cursor-pointer transition">
        <h4 class="font-bold text-white text-xs truncate">${m.name}</h4>
        <p class="text-xs text-slate-400 mt-0.5">${m.category}</p>
        <div class="flex justify-between items-center mt-2">
          <span class="text-xs font-bold text-teal-300 font-mono">Rp ${Number(m.sellingPrice).toLocaleString('id-ID')}</span>
          <span class="text-[10px] text-emerald-400">Stok: ${m.stock}</span>
        </div>
      </div>
    `).join("");

    this.updatePOSTotal();
  }

  addClinicalFee(feeName, feeAmount) {
    this.addToPOSCart(feeName, feeAmount, 'Layanan Klinik');
  }

  addToPOSCart(name, price, category = 'Obat') {
    const existing = this.posCart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      this.posCart.push({ name, price, qty: 1, category });
    }
    this.updatePOSTotal();
  }

  clearPOSCart() {
    this.posCart = [];
    this.updatePOSTotal();
  }

  updatePOSTotal() {
    const cartContainer = document.getElementById("pos-cart-items");
    const subtotalEl = document.getElementById("pos-subtotal");
    const totalEl = document.getElementById("pos-grand-total");

    if (cartContainer) {
      if (this.posCart.length === 0) {
        cartContainer.innerHTML = `
          <div class="text-center p-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            <i class="fas fa-shopping-cart text-2xl mb-2 block"></i> Keranjang Kasir Kosong.<br>Pilih obat atau layanan klinik.
          </div>
        `;
      } else {
        cartContainer.innerHTML = this.posCart.map((item, index) => `
          <div class="flex justify-between items-center p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
            <div class="flex-1 min-w-0 pr-2">
              <div class="text-white font-semibold truncate">${item.name}</div>
              <div class="text-[10px] text-teal-400 font-mono">Rp ${Number(item.price).toLocaleString('id-ID')} x ${item.qty}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-teal-300 font-mono">Rp ${Number(item.price * item.qty).toLocaleString('id-ID')}</span>
              <button onclick="smartApp.removePOSItem(${index})" class="text-rose-400 hover:text-rose-300 text-xs px-1">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        `).join("");
      }
    }

    const totalAmount = this.posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (subtotalEl) subtotalEl.textContent = `Rp ${totalAmount.toLocaleString('id-ID')}`;
    if (totalEl) totalEl.textContent = `Rp ${totalAmount.toLocaleString('id-ID')}`;
  }

  removePOSItem(index) {
    this.posCart.splice(index, 1);
    this.updatePOSTotal();
  }

  // Multi-Payment Modal (Debit, QRIS, DANA, OVO, ShopeePay, Cash)
  processPOSPayment() {
    const totalAmount = this.posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (totalAmount <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Keranjang Kosong',
        text: 'Silakan pilih obat atau biaya layanan klinik terlebih dahulu!',
        background: '#101B24',
        color: '#fff'
      });
      return;
    }

    Swal.fire({
      title: 'Pilih Metode Pembayaran Kasir',
      width: '600px',
      html: `
        <div class="space-y-4 text-left">
          <div class="p-3 bg-slate-900 rounded-xl border border-teal-500/30 text-center">
            <span class="text-xs text-slate-400">Total Yang Harus Dibayar:</span>
            <div class="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">Rp ${totalAmount.toLocaleString('id-ID')}</div>
          </div>

          <div>
            <label class="text-xs text-slate-400 block mb-1">Metode Pembayaran:</label>
            <select id="swal-payment-method" class="form-input text-xs" onchange="smartApp.togglePaymentFields(this.value, ${totalAmount})">
              <option value="QRIS">📲 QRIS Dynamic (Semua Bank & E-Wallet)</option>
              <option value="Debit">💳 Kartu Debit / Kredit (Mesin EDC)</option>
              <option value="DANA">💙 E-Wallet DANA</option>
              <option value="OVO">💜 E-Wallet OVO</option>
              <option value="ShopeePay">🧡 ShopeePay / GoPay</option>
              <option value="Tunai">💵 Tunai / Cash</option>
            </select>
          </div>

          <!-- Payment Specific Fields -->
          <div id="payment-dynamic-area" class="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div class="text-center">
              <div id="qris-canvas-pos" class="bg-white p-2.5 rounded-lg inline-block my-1"></div>
              <p class="text-[11px] text-teal-300 font-semibold mt-1">Scan QRIS dengan aplikasi BCA, Mandiri, DANA, OVO, ShopeePay & GoPay</p>
            </div>
          </div>
        </div>
      `,
      background: '#101B24',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Konfirmasi Lunas & Sync Google Sheet',
      confirmButtonColor: '#00C2A8',
      didOpen: () => {
        this.togglePaymentFields('QRIS', totalAmount);
      },
      preConfirm: () => {
        const method = document.getElementById('swal-payment-method').value;
        let change = 0;
        let cashReceived = totalAmount;

        if (method === "Tunai") {
          const cashVal = Number(document.getElementById('swal-cash-input')?.value || 0);
          if (cashVal < totalAmount) {
            Swal.showValidationMessage(`Uang tunai kurang! Nominal harus minimal Rp ${totalAmount.toLocaleString('id-ID')}`);
            return false;
          }
          cashReceived = cashVal;
          change = cashVal - totalAmount;
        }

        return {
          id: `TRX-${Date.now()}`,
          date: new Date().toLocaleString('id-ID'),
          patientName: "Budi Santoso (PAT-2026-001)",
          items: this.posCart,
          totalPaid: totalAmount,
          cashReceived: cashReceived,
          changeAmount: change,
          paymentMethod: method,
          cashierName: this.currentUser ? this.currentUser.name : "Staf Kasir",
          status: "Lunas"
        };
      }
    }).then(res => {
      if (res.isConfirmed) {
        dbStore.add("transactions", res.value);
        this.printThermalReceipt(res.value);
        this.clearPOSCart();
        Swal.fire({ 
          icon: 'success', 
          title: 'Transaksi Lunas!', 
          text: `Pembayaran via ${res.value.paymentMethod} berhasil dicatat & disinkronkan ke Google Sheets.`, 
          background: '#101B24', 
          color: '#fff' 
        });
      }
    });
  }

  togglePaymentFields(method, totalAmount) {
    const area = document.getElementById("payment-dynamic-area");
    if (!area) return;

    if (method === "QRIS" || method === "DANA" || method === "OVO" || method === "ShopeePay") {
      area.innerHTML = `
        <div class="text-center space-y-2">
          <div id="qris-canvas-pos" class="bg-white p-3 rounded-lg inline-block"></div>
          <div class="text-xs font-bold text-teal-400">${method} Instant QR Code</div>
          <div class="text-[11px] text-slate-300">Scan QR di atas untuk membayar <strong class="text-emerald-400">Rp ${totalAmount.toLocaleString('id-ID')}</strong></div>
        </div>
      `;
      setTimeout(() => {
        const qrEl = document.getElementById("qris-canvas-pos");
        if (qrEl && typeof QRCode !== "undefined") {
          qrEl.innerHTML = "";
          new QRCode(qrEl, {
            text: `00020101021126580016ID.CO.SMARTCLINIC520459995303360540${totalAmount}5802ID5912SMART CLINIC6007JAKARTA6304ABCD`,
            width: 140,
            height: 140
          });
        }
      }, 50);
    } else if (method === "Debit") {
      area.innerHTML = `
        <div class="space-y-2">
          <div class="font-bold text-teal-400 text-xs">Informasi Mesin EDC / Kartu Debit:</div>
          <input id="swal-card-bank" class="form-input text-xs" placeholder="Nama Bank (misal: BCA / Mandiri / BRI)">
          <input id="swal-card-num" class="form-input text-xs" placeholder="4 Digit Terakhir Kartu (misal: 8812)">
        </div>
      `;
    } else if (method === "Tunai") {
      area.innerHTML = `
        <div class="space-y-2">
          <label class="font-bold text-teal-400 text-xs block">Nominal Uang Tunai Diterima (Rp):</label>
          <input id="swal-cash-input" type="number" class="form-input text-xs font-mono text-lg text-emerald-300" value="${totalAmount}" oninput="smartApp.calcCashChange(this.value, ${totalAmount})">
          <div class="flex justify-between text-xs pt-1">
            <span class="text-slate-400">Kembalian:</span>
            <span id="swal-change-text" class="font-bold text-teal-300 font-mono">Rp 0</span>
          </div>
        </div>
      `;
    }
  }

  calcCashChange(val, total) {
    const changeEl = document.getElementById("swal-change-text");
    const diff = Number(val || 0) - total;
    if (changeEl) {
      changeEl.textContent = `Rp ${diff >= 0 ? diff.toLocaleString('id-ID') : 0}`;
      changeEl.className = diff >= 0 ? "font-bold text-teal-300 font-mono" : "font-bold text-rose-400 font-mono";
    }
  }

  printThermalReceipt(txData) {
    Swal.fire({
      title: 'Pratinjau Struk Kasir / Invoice Digital',
      width: '500px',
      html: `
        <div class="p-4 bg-white text-black rounded-lg text-left text-xs font-mono border-2 border-slate-300 space-y-2">
          <div class="text-center font-bold text-sm border-b border-black pb-1">KLINIK & APOTEK SMART CARE</div>
          <div class="text-center text-[10px]">Jl. Sudirman No. 88, Jakarta • Telp: (021) 555-911</div>
          <div class="border-b border-dashed border-black my-1"></div>
          <div><strong>No. Struk:</strong> ${txData.id}</div>
          <div><strong>Tanggal:</strong> ${txData.date}</div>
          <div><strong>Pasien:</strong> ${txData.patientName}</div>
          <div><strong>Kasir:</strong> ${txData.cashierName}</div>
          <div><strong>Metode Bayar:</strong> ${txData.paymentMethod}</div>
          <div class="border-b border-dashed border-black my-1"></div>
          
          <div class="space-y-1">
            ${(txData.items || []).map(i => `
              <div class="flex justify-between">
                <span>${i.name} x${i.qty}</span>
                <span>Rp ${(i.price * i.qty).toLocaleString('id-ID')}</span>
              </div>
            `).join("")}
          </div>

          <div class="border-t border-black pt-1 space-y-0.5">
            <div class="flex justify-between font-bold text-sm">
              <span>TOTAL LUNAS:</span>
              <span>Rp ${txData.totalPaid.toLocaleString('id-ID')}</span>
            </div>
            ${txData.paymentMethod === "Tunai" ? `
              <div class="flex justify-between text-[11px]">
                <span>Tunai Diterima:</span>
                <span>Rp ${txData.cashReceived.toLocaleString('id-ID')}</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span>Kembalian:</span>
                <span>Rp ${txData.changeAmount.toLocaleString('id-ID')}</span>
              </div>
            ` : ''}
          </div>

          <div class="text-center pt-2 text-[10px] border-t border-dashed border-black">
            *** TERIMA KASIH - SEMOGA LEKAS SEMBUH ***
          </div>
        </div>
      `,
      background: '#101B24',
      color: '#fff',
      confirmButtonText: 'Cetak Struk Thermal',
      confirmButtonColor: '#00C2A8'
    });
  }

  // --- Reports & Analytics ---
  renderReports() {
    if (typeof Chart === "undefined") return;
    try {
      const ctxRep = document.getElementById("chart-report-analytics");
      if (ctxRep) {
        if (this.charts.report) this.charts.report.destroy();
        this.charts.report = new Chart(ctxRep, {
          type: 'bar',
          data: {
            labels: ['Konsultasi Umum', 'Poli Gigi', 'Spesialis Kulit', 'Penjualan Obat', 'Laboratorium'],
            datasets: [{
              label: 'Omset per Kategori (Rp)',
              data: [35000000, 22000000, 28000000, 42000000, 15000000],
              backgroundColor: '#00C2A8',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94A3B8' } } },
            scales: {
              x: { ticks: { color: '#94A3B8' } },
              y: { ticks: { color: '#94A3B8' } }
            }
          }
        });
      }
    } catch(e){}
  }

  // --- Settings & Integrations ---
  renderSettings() {
    const gasInput = document.getElementById("setting-gas-url");
    if (gasInput) gasInput.value = dbStore.getGasUrl();
  }

  saveSettings() {
    const url = document.getElementById("setting-gas-url").value;
    dbStore.setGasUrl(url);
    this.initGasSyncStatus();
    this.checkLandingGasConnection();
    Swal.fire({ icon: 'success', title: 'Pengaturan Disimpan!', text: 'Sistem mencoba sinkronisasi dengan Google Sheet...', background: '#101B24', color: '#fff' });
  }

  showGasCodeModal() {
    Swal.fire({
      title: 'Google Apps Script Code.gs Generator',
      width: '700px',
      html: `
        <div class="text-left space-y-2">
          <p class="text-xs text-slate-300">Copy kode berikut ke <strong>Extensions -> Apps Script</strong> di Google Sheets Anda:</p>
          <textarea readonly class="form-input h-64 font-mono text-xs text-teal-300 bg-slate-950">${window.GAS_TEMPLATE_CODE}</textarea>
        </div>
      `,
      background: '#101B24',
      color: '#fff',
      confirmButtonText: 'Salin & Tutup',
      confirmButtonColor: '#00C2A8'
    });
  }

  // --- Display Modes ---
  toggleQueueTV() {
    window.open("index.html?mode=tv", "_blank");
  }

  toggleKioskMode() {
    window.open("index.html?mode=kiosk", "_blank");
  }

  openEmergencyModal() {
    Swal.fire({
      icon: 'warning',
      title: '🚨 PANGGILAN DARURAT KLINIK',
      html: `
        <div class="space-y-3 text-left">
          <p class="text-xs text-rose-300 font-bold">Kontak Cepat Ambulans & Tim Medis Respon Cepat:</p>
          <div class="p-3 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-200 font-mono text-sm font-bold text-center">
            📞 Call Center Darurat: 119 / (021) 555-911-00
          </div>
          <button onclick="Swal.close()" class="w-full py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500">
            Aktifkan Sirine & Notifikasi Dokter Jaga
          </button>
        </div>
      `,
      background: '#101B24',
      color: '#fff'
    });
  }

  bindGlobalEvents() {
    const searchInput = document.getElementById("global-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
      });
    }
  }
}

// Global window instantiation & fallbacks
window.smartApp = new SmartAppController();
window.doLogin = (role) => window.smartApp.login(role);
window.doLoginFromLanding = () => window.smartApp.loginFromLanding();

document.addEventListener("DOMContentLoaded", () => {
  if (!window.smartApp) {
    window.smartApp = new SmartAppController();
  }
});
