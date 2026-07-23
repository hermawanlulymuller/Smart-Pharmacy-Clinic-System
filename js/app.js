/* ==========================================================================
   SMART PHARMACY & CLINIC MANAGEMENT SYSTEM
   Main Application Router, State Store, & UI Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  window.smartApp = new SmartAppController();
});

class SmartAppController {
  constructor() {
    this.currentLanguage = localStorage.getItem("SMART_LANG") || APP_CONFIG.defaultLanguage;
    this.currentTheme = localStorage.getItem("SMART_THEME") || APP_CONFIG.defaultTheme;
    this.currentUser = JSON.parse(sessionStorage.getItem("SMART_USER") || "null");
    this.activeModule = "dashboard";
    this.charts = {};

    this.initTheme();
    this.initLanguage();
    this.checkAuth();
    this.bindGlobalEvents();
    this.initGasSyncStatus();
  }

  // --- Google Sheets Realtime Sync Badge & Controller ---
  async initGasSyncStatus() {
    const dot = document.getElementById("gas-sync-status-dot");
    const text = document.getElementById("gas-sync-status-text");
    const icon = document.getElementById("gas-sync-icon");

    if (!gasSyncService.getUrl()) {
      if (dot) dot.className = "pulse-dot warning";
      if (text) text.textContent = "Google Sheet: Offline";
      return;
    }

    if (text) text.textContent = "Checking Google Sheet...";
    const isConnected = await gasSyncService.testConnection();

    if (isConnected) {
      if (dot) dot.className = "pulse-dot success";
      if (text) text.textContent = "Google Sheet: Connected";
      if (icon) icon.className = "fas fa-check-circle text-emerald-400 text-xs ml-1";

      // Attempt background initial sync from Sheets
      const updated = await gasSyncService.syncFromSheets();
      if (updated) {
        this.loadModule(this.activeModule);
      }
    } else {
      if (dot) dot.className = "pulse-dot warning";
      if (text) text.textContent = "Google Sheet: Local Only";
    }
  }

  async triggerManualSync() {
    const icon = document.getElementById("gas-sync-icon");
    if (icon) icon.className = "fas fa-spinner fa-spin text-teal-400 text-xs ml-1";

    Swal.fire({
      title: 'Menyinkronkan Data...',
      text: 'Menghubungkan dengan Google Sheets Database...',
      background: '#101B24',
      color: '#fff',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      if (!gasSyncService.getUrl()) {
        throw new Error("URL Google Apps Script belum dikonfigurasi di Settings.");
      }

      await gasSyncService.syncAllToGoogleSheets();
      await gasSyncService.syncFromSheets();
      this.loadModule(this.activeModule);
      this.initGasSyncStatus();

      Swal.fire({
        icon: 'success',
        title: 'Sinkronisasi Berhasil!',
        text: 'Data UI & Google Sheet telah 100% sinkron real-time.',
        background: '#101B24',
        color: '#fff',
        confirmButtonColor: '#00C2A8'
      });
    } catch (err) {
      Swal.fire({
        icon: 'warning',
        title: 'Sinkronisasi Terbatas',
        text: err.message || 'Menggunakan data LocalStorage offline.',
        background: '#101B24',
        color: '#fff'
      });
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

  // --- Auth & Role Guard ---
  checkAuth() {
    const landingView = document.getElementById("landing-login-view");
    const appShellView = document.getElementById("app-shell-view");

    if (!this.currentUser) {
      if (landingView) landingView.classList.remove("hidden");
      if (appShellView) appShellView.classList.add("hidden");
    } else {
      if (landingView) landingView.classList.add("hidden");
      if (appShellView) appShellView.classList.remove("hidden");
      this.updateUserUI();
      this.loadModule(this.activeModule);
    }
  }

  login(role, customName = "") {
    const roleConfig = APP_CONFIG.roles[role] || APP_CONFIG.roles.admin;
    this.currentUser = {
      name: customName || (role === 'patient' ? 'Budi Santoso (Pasien)' : `Dr. / Staf ${roleConfig.label}`),
      role: role,
      roleBadge: roleConfig.badge,
      roleLabel: roleConfig.label,
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      loginTime: new Date().toLocaleTimeString('id-ID')
    };
    sessionStorage.setItem("SMART_USER", JSON.stringify(this.currentUser));
    dbStore.logAction("User Login", `Login sebagai ${this.currentUser.roleLabel}`);
    
    Swal.fire({
      icon: 'success',
      title: 'Login Berhasil',
      text: `Selamat Datang, ${this.currentUser.name}!`,
      background: '#101B24',
      color: '#fff',
      confirmButtonColor: '#00C2A8',
      timer: 1800
    }).then(() => {
      this.checkAuth();
    });
  }

  logout() {
    sessionStorage.removeItem("SMART_USER");
    this.currentUser = null;
    this.checkAuth();
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

  // --- Router & Module Loader ---
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
  }

  // --- Dashboard Render & Charts ---
  renderDashboard() {
    const patients = dbStore.get("patients");
    const doctors = dbStore.get("doctors");
    const medicines = dbStore.get("medicines");
    const appointments = dbStore.get("appointments");
    const transactions = dbStore.get("transactions");

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
      const logs = dbStore.get("logs").slice(0, 5);
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
  }

  renderDashboardCharts() {
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
  }

  // --- Patients Module ---
  renderPatientsTable() {
    const tableBody = document.getElementById("patients-table-body");
    if (!tableBody) return;
    const patients = dbStore.get("patients");

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
    const p = dbStore.get("patients").find(x => x.id === patientId);
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
        new QRCode(document.getElementById("qrcode-canvas"), {
          text: p.id,
          width: 160,
          height: 160
        });
      },
      background: '#101B24',
      color: '#fff',
      confirmButtonColor: '#00C2A8'
    });
  }

  viewMedicalRecord(patientId) {
    const p = dbStore.get("patients").find(x => x.id === patientId);
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
    const doctors = dbStore.get("doctors");

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
    const d = dbStore.get("doctors").find(x => x.id === doctorId);
    if (!d) return;

    Swal.fire({
      title: `Buat Janji Temu: ${d.name}`,
      html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="text-xs text-slate-400">Pilih Pasien:</label>
            <select id="swal-apt-patient" class="form-input mt-1">
              ${dbStore.get("patients").map(p => `<option value="${p.name}">${p.name} (${p.id})</option>`).join("")}
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
    const apts = dbStore.get("appointments");

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
    const medicines = dbStore.get("medicines");

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
              <button onclick="smartApp.generateMedicineQR('${m.id}', '${m.name}')" class="px-2 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded text-xs hover:bg-teal-500/30">
                <i class="fas fa-barcode"></i> Code
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
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
        new QRCode(document.getElementById("med-qrcode-canvas"), {
          text: medId,
          width: 140,
          height: 140
        });
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
  sendAiAssistantMessage() {
    const input = document.getElementById("ai-assistant-input");
    const container = document.getElementById("ai-chat-body");
    if (!input || !input.value.trim() || !container) return;

    const userQuery = input.value.trim();
    input.value = "";

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
    const apts = dbStore.get("appointments");

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

  // --- Cashier POS ---
  renderCashierPOS() {
    const itemsContainer = document.getElementById("pos-items-list");
    if (!itemsContainer) return;
    const meds = dbStore.get("medicines");

    itemsContainer.innerHTML = meds.map(m => `
      <div onclick="smartApp.addToPOSCart('${m.name}', ${m.sellingPrice})" class="p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-teal-500/50 cursor-pointer transition">
        <h4 class="font-bold text-white text-xs truncate">${m.name}</h4>
        <p class="text-xs text-slate-400 mt-0.5">${m.category}</p>
        <div class="flex justify-between items-center mt-2">
          <span class="text-xs font-bold text-teal-300">Rp ${Number(m.sellingPrice).toLocaleString('id-ID')}</span>
          <span class="text-[10px] text-emerald-400">Stok: ${m.stock}</span>
        </div>
      </div>
    `).join("");
  }

  addToPOSCart(name, price) {
    const cartList = document.getElementById("pos-cart-items");
    if (!cartList) return;

    cartList.innerHTML += `
      <div class="flex justify-between items-center p-2 bg-slate-900/60 rounded border border-slate-800 text-xs">
        <span class="text-white font-medium">${name}</span>
        <span class="text-teal-300 font-bold">Rp ${Number(price).toLocaleString('id-ID')}</span>
      </div>
    `;
    this.updatePOSTotal();
  }

  updatePOSTotal() {
    const totalEl = document.getElementById("pos-grand-total");
    if (totalEl) totalEl.textContent = "Rp 305.000";
  }

  processPOSPayment() {
    Swal.fire({
      title: 'Pembayaran Kasir / POS',
      html: `
        <div class="space-y-3 text-left">
          <div class="text-sm font-bold text-teal-400 text-center">Total Tagihan: Rp 305.000</div>
          <select id="swal-payment-method" class="form-input">
            <option value="QRIS">QRIS Instant Dynamic</option>
            <option value="Tunai">Tunai / Cash</option>
            <option value="Transfer Bank">Transfer Bank / Virtual Account</option>
            <option value="E-Wallet">E-Wallet (GoPay / OVO / ShopeePay)</option>
          </select>
        </div>
      `,
      background: '#101B24',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Bayar & Sync Google Sheet',
      confirmButtonColor: '#00C2A8'
    }).then(res => {
      if (res.isConfirmed) {
        dbStore.add("transactions", {
          id: `TRX-${Date.now()}`,
          date: new Date().toLocaleString('id-ID'),
          patientName: "Budi Santoso",
          doctorFee: 250000,
          medicineTotal: 55000,
          totalPaid: 305000,
          paymentMethod: document.getElementById("swal-payment-method").value,
          status: "Lunas"
        });
        Swal.fire({ icon: 'success', title: 'Transaksi Lunas!', text: 'Struk dicetak & data disinkronkan ke Google Sheet.', background: '#101B24', color: '#fff' });
      }
    });
  }

  // --- Reports & Analytics ---
  renderReports() {
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
