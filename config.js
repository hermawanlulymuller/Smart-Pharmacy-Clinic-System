/* ==========================================================================
   SMART PHARMACY & CLINIC MANAGEMENT SYSTEM
   Configuration, Dictionaries, and System Constants
   ========================================================================== */

const APP_CONFIG = {
  appName: "Smart Pharmacy & Clinic",
  appVersion: "3.5.0 Enterprise",
  vendor: "Luly Agency",
  defaultLanguage: "id", // "id" or "en"
  defaultTheme: "dark",  // "dark" or "light"
  currency: "IDR",
  locale: "id-ID",
  
  // Multi-Cabang / Multi-Branch Clinic Locations
  branches: [
    { id: "BR-01", name: "Klinik Utama Sudirman (Pusat)", city: "Jakarta Selatan", isDefault: true },
    { id: "BR-02", name: "Klinik & Apotik Medika Barat", city: "Jakarta Barat", isDefault: false },
    { id: "BR-03", name: "Smart Care Centre BSD", city: "Tangerang Selatan", isDefault: false }
  ],

  // Role-Based Access Control Matrix
  roles: {
    admin: { label: "Administrator", badge: "badge-danger", icon: "fa-user-shield" },
    doctor: { label: "Dokter Sp. / GP", badge: "badge-teal", icon: "fa-user-md" },
    pharmacist: { label: "Apoteker", badge: "badge-warning", icon: "fa-pills" },
    nurse: { label: "Perawat / Asisten", badge: "badge-info", icon: "fa-user-nurse" },
    cashier: { label: "Kasir / Keuangan", badge: "badge-success", icon: "fa-cash-register" },
    patient: { label: "Pasien Portal", badge: "badge-info", icon: "fa-user" }
  },

  // Language Dictionaries
  translations: {
    id: {
      navDashboard: "Dashboard Utama",
      navPatients: "Pasien & Rekam Medis",
      navDoctors: "Dokter & Jadwal",
      navAppointments: "Pendaftaran & Antrean",
      navMedicine: "Apotek & Stok Obat",
      navConsultation: "Telemedisin & Konsultasi",
      navAiAssistant: "AI Health Assistant",
      navNurse: "Stasiun Perawat",
      navPharmacist: "Dispensing Apoteker",
      navCashier: "Kasir & Billing (POS)",
      navReports: "Laporan & Keuangan",
      navSettings: "Pengaturan & Integrasi",
      navQueueTv: "Layar Antrean TV",
      navKiosk: "Mandiri Patient Check-in",
      searchPlaceholder: "Cari pasien, obat, dokter, rekam medis...",
      emergencyBtn: "Panggilan Darurat",
      branchSelect: "Cabang Klinik",
      welcomeBack: "Selamat Datang Kembali",
      todayPatients: "Pasien Hari Ini",
      activeDoctors: "Dokter Praktek",
      medicineStock: "Total Jenis Obat",
      lowStockAlert: "Alert Stok Menipis",
      revenueToday: "Omset Hari Ini",
      onlineConsultations: "Konsultasi Online",
      pendingPrescriptions: "Resep Menunggu",
      quickActions: "Aksi Cepat",
      recentActivities: "Aktivitas Terakhir System",
      saveChanges: "Simpan Perubahan",
      cancel: "Batal",
      delete: "Hapus",
      edit: "Edit",
      addPatient: "+ Tambah Pasien Baru",
      addMedicine: "+ Tambah Obat",
      bookAppointment: "+ Buat Janji Temu",
      newTransaction: "+ Transaksi Kasir"
    },
    en: {
      navDashboard: "Main Dashboard",
      navPatients: "Patients & EHR",
      navDoctors: "Doctors & Schedule",
      navAppointments: "Appointments & Queue",
      navMedicine: "Pharmacy & Inventory",
      navConsultation: "Telemedicine Room",
      navAiAssistant: "AI Health Assistant",
      navNurse: "Nurse Workstation",
      navPharmacist: "Pharmacist Dispensing",
      navCashier: "Cashier & Billing (POS)",
      navReports: "Reports & Analytics",
      navSettings: "Settings & API",
      navQueueTv: "Queue TV Display",
      navKiosk: "Self Check-in Kiosk",
      searchPlaceholder: "Search patient, medicine, doctor, medical record...",
      emergencyBtn: "Emergency Call",
      branchSelect: "Clinic Branch",
      welcomeBack: "Welcome Back",
      todayPatients: "Today's Patients",
      activeDoctors: "Doctors Active",
      medicineStock: "Medicine Stock Items",
      lowStockAlert: "Low Stock Alert",
      revenueToday: "Revenue Today",
      onlineConsultations: "Online Consultations",
      pendingPrescriptions: "Pending Prescriptions",
      quickActions: "Quick Actions",
      recentActivities: "Recent System Activities",
      saveChanges: "Save Changes",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      addPatient: "+ Add New Patient",
      addMedicine: "+ Add Medicine",
      bookAppointment: "+ Book Appointment",
      newTransaction: "+ POS Checkout"
    }
  }
};
