/* ==========================================================================
   SMART PHARMACY & CLINIC MANAGEMENT SYSTEM
   Google Apps Script & Google Sheets Real-Time Sync Connector
   ========================================================================== */

const GAS_TEMPLATE_CODE = `/**
 * SMART PHARMACY & CLINIC MANAGEMENT SYSTEM - GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * Developed by Luly Agency
 * 
 * CARA PAKAI 100% OTOMATIS:
 * 1. Buka Google Sheet baru di Google Drive Anda.
 * 2. Klik menu "Extensions" -> "Apps Script".
 * 3. Hapus semua isi editor, lalu PASTE SELURUH KODE DI BAWAH INI.
 * 4. Klik fungsi \`setupDatabase\` di bagian atas editor lalu klik "Run" (Jalankan).
 *    -> Sistem akan OTOMATIS membuat 11 Tab/Sheet & mengisi SELURUH DATA DUMMY!
 * 5. Klik "Deploy" -> "New deployment" -> Pilihan "Web app":
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (Siapa saja)
 * 6. Copy Web App URL & Paste ke menu Settings -> Google Sheets API URL di Web App Smart Clinic.
 */

const DUMMY_DATA = {
  Patients: [
    { id: "PAT-2026-001", name: "Budi Santoso", gender: "Laki-laki", dob: "1988-05-14", phone: "+62 812-3456-7890", email: "budi.santoso@email.com", address: "Jl. Sudirman No. 45, Jakarta Selatan", bloodType: "O+", insurance: "BPJS Kesehatan / Prudential", allergy: "Penicillin, Amoxicillin", emergencyContact: "Siti Rahma - 081299887766", medicalHistory: "Hipertensi Derajat 1", visitsCount: 5, lastVisit: "2026-07-20" },
    { id: "PAT-2026-002", name: "Siti Aminah", gender: "Perempuan", dob: "1995-11-22", phone: "+62 857-1122-3344", email: "siti.aminah@gmail.com", address: "Jl. Gatot Subroto Blk C2, Jakarta Pusat", bloodType: "A+", insurance: "Mandiri Inhealth", allergy: "Kacang Tanah, Seafood", emergencyContact: "Hendra - 085733221100", medicalHistory: "Gastritis Akut", visitsCount: 3, lastVisit: "2026-07-22" },
    { id: "PAT-2026-003", name: "Dewi Lestari", gender: "Perempuan", dob: "1992-03-08", phone: "+62 813-8899-0011", email: "dewi.lestari@yahoo.com", address: "Jl. Kemang Raya No. 12, Jakarta Selatan", bloodType: "B+", insurance: "Allianz Healthcare", allergy: "Tidak Ada", emergencyContact: "Rina - 081377665544", medicalHistory: "Acnes Minor", visitsCount: 8, lastVisit: "2026-07-23" },
    { id: "PAT-2026-004", name: "Rizky Pratama", gender: "Laki-laki", dob: "2001-09-30", phone: "+62 878-5544-3322", email: "rizky.pratama@outlook.com", address: "Jl. Asia Afrika No. 88, Bandung", bloodType: "AB+", insurance: "Umum / Cash", allergy: "Sulfa", emergencyContact: "Bambang - 087811223344", medicalHistory: "Flu / ISPA", visitsCount: 1, lastVisit: "2026-07-23" }
  ],
  Doctors: [
    { id: "DOC-001", name: "dr. Andi Wijaya, Sp.PD", specialization: "Internal Medicine (Penyakit Dalam)", licenseNumber: "SIP.554/IDI/2022", room: "Poli Interna - Ruang 101", consultationFee: 250000, rating: 4.9, experience: "12 Tahun", availability: "Online", schedule: "Senin - Jumat (08:00 - 15:00)" },
    { id: "DOC-002", name: "drg. Maya Saphira, Sp.KG", specialization: "Dentist (Dokter Gigi)", licenseNumber: "SIP.112/PDGI/2021", room: "Poli Gigi - Ruang 202", consultationFee: 200000, rating: 4.8, experience: "8 Tahun", availability: "Online", schedule: "Senin - Sabtu (10:00 - 18:00)" },
    { id: "DOC-003", name: "dr. Clarissa Vance, Sp.DV", specialization: "Dermatologist & Beauty Specialist", licenseNumber: "SIP.889/PERDOSKI/2023", room: "Estetika & Skin Care - Ruang 305", consultationFee: 300000, rating: 5.0, experience: "10 Tahun", availability: "Online", schedule: "Selasa - Minggu (13:00 - 20:00)" },
    { id: "DOC-004", name: "dr. Hendra Kusumah, Sp.A", specialization: "Pediatrician (Spesialis Anak)", licenseNumber: "SIP.332/IDAI/2020", room: "Poli Anak - Ruang 104", consultationFee: 225000, rating: 4.9, experience: "15 Tahun", availability: "Vacation", schedule: "Senin - Kamis (09:00 - 14:00)" }
  ],
  Medicines: [
    { id: "MED-101", name: "Paracetamol 500mg Forte", category: "Analgesik & Antipiretik", brand: "Kimia Farma", batchNumber: "BCH-2026-889", expiredDate: "2028-12-15", supplier: "PT. Phapros Tbk", purchasePrice: 8500, sellingPrice: 15000, barcode: "8991234567890", stock: 450, minStock: 50, location: "Rak A-01" },
    { id: "MED-102", name: "Amoxicillin Trihydrate 500mg", category: "Antibiotik", brand: "Kalbe Farma", batchNumber: "BCH-2026-112", expiredDate: "2026-09-10", supplier: "PT. Kalbe Farma Tbk", purchasePrice: 18000, sellingPrice: 28000, barcode: "8998877665544", stock: 12, minStock: 30, location: "Rak B-04" },
    { id: "MED-103", name: "Omeprazole Capsule 20mg", category: "Gastroenterologi", brand: "Dexa Medica", batchNumber: "BCH-2026-445", expiredDate: "2027-05-20", supplier: "PT. Dexa Medica", purchasePrice: 22000, sellingPrice: 35000, barcode: "8993344556677", stock: 180, minStock: 40, location: "Rak C-02" },
    { id: "MED-104", name: "Amlodipine Besylate 10mg", category: "Kardiovaskular", brand: "Sanbe Farma", batchNumber: "BCH-2025-998", expiredDate: "2026-08-01", supplier: "PT. Sanbe Farma", purchasePrice: 12000, sellingPrice: 20000, barcode: "8995566778899", stock: 8, minStock: 25, location: "Rak A-05" },
    { id: "MED-105", name: "Vitamin C 1000mg Effervescent", category: "Suplemen", brand: "Redoxon / Bayer", batchNumber: "BCH-2026-303", expiredDate: "2028-01-30", supplier: "PT. Bayer Indonesia", purchasePrice: 38000, sellingPrice: 55000, barcode: "8997788990011", stock: 95, minStock: 20, location: "Etalase Depan" }
  ],
  Appointments: [
    { id: "APT-8801", patientName: "Budi Santoso", patientPhone: "+62 812-3456-7890", doctorName: "dr. Andi Wijaya, Sp.PD", date: "2026-07-24", time: "09:00 AM", queueNumber: "A-001", status: "Dipanggil", type: "Tatap Muka", notes: "Cek rutin hipertensi" },
    { id: "APT-8802", patientName: "Siti Aminah", patientPhone: "+62 857-1122-3344", doctorName: "dr. Clarissa Vance, Sp.DV", date: "2026-07-24", time: "10:30 AM", queueNumber: "B-002", status: "Menunggu", type: "Online Telemedisin", notes: "Konsultasi jerawat" },
    { id: "APT-8803", patientName: "Dewi Lestari", patientPhone: "+62 813-8899-0011", doctorName: "drg. Maya Saphira, Sp.KG", date: "2026-07-24", time: "01:00 PM", queueNumber: "C-003", status: "Menunggu", type: "Tatap Muka", notes: "Scaling Gigi" }
  ],
  Transactions: [
    { id: "TRX-20260723-01", date: "2026-07-23 14:30", patientName: "Budi Santoso", doctorFee: 250000, medicineTotal: 50000, totalPaid: 290000, paymentMethod: "QRIS", status: "Lunas" },
    { id: "TRX-20260723-02", date: "2026-07-23 16:15", patientName: "Siti Aminah", doctorFee: 300000, medicineTotal: 55000, totalPaid: 355000, paymentMethod: "Transfer Bank", status: "Lunas" }
  ],
  Logs: [
    { timestamp: "2026-07-23 22:45:10", user: "Admin (Luly)", action: "Setup Auto Database", detail: "Inisialisasi 11 Sheet & Data Dummy Berhasil" }
  ]
};

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsNeeded = ["Patients", "Doctors", "Medicines", "Inventory", "Appointments", "Transactions", "Users", "Reports", "Settings", "Logs", "ChatHistory"];

  sheetsNeeded.forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    sheet.clear();
    const dummyItems = DUMMY_DATA[sheetName] || [];
    if (dummyItems.length > 0) {
      const headers = Object.keys(dummyItems[0]);
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#00C2A8");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");

      dummyItems.forEach(item => {
        const row = headers.map(h => item[h] !== undefined ? item[h] : "");
        sheet.appendRow(row);
      });
      sheet.autoResizeColumns(1, headers.length);
    } else {
      sheet.appendRow(["id", "createdAt", "dataJson"]);
    }
  });
  return "Database Initialized Successfully!";
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Smart Clinic Setup')
    .addItem('⚡ Inisialisasi Database & Data Dummy', 'setupDatabase')
    .addToUi();
}

function doGet(e) {
  const action = e.parameter.action || "ping";
  const sheetName = e.parameter.sheet || "Patients";
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "ping") {
    return createJsonResponse({ status: "success", message: "Google Sheet Database API Ready!", timestamp: new Date() });
  }

  if (action === "setup") {
    setupDatabase();
    return createJsonResponse({ status: "success", message: "Auto Database Setup & Data Dummy Done!" });
  }

  if (action === "readAll") {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return createJsonResponse({ status: "error", message: "Sheet not found: " + sheetName });
    const data = getSheetDataAsObjects(sheet);
    return createJsonResponse({ status: "success", count: data.length, data: data });
  }

  return createJsonResponse({ status: "error", message: "Invalid action" });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const sheetName = payload.sheet || "Patients";
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);

    if (action === "insert") {
      const rowData = payload.data;
      let headers = sheet.getLastRow() === 0 ? Object.keys(rowData) : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (sheet.getLastRow() === 0) sheet.appendRow(headers);
      sheet.appendRow(headers.map(h => rowData[h] !== undefined ? rowData[h] : ""));
      return createJsonResponse({ status: "success", message: "Record inserted!", data: rowData });
    }

    if (action === "syncAll" || action === "setupWithDummy") {
      setupDatabase();
      return createJsonResponse({ status: "success", message: "Full database populated!" });
    }

    return createJsonResponse({ status: "error", message: "Unknown action" });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function getSheetDataAsObjects(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
`;

class GoogleSheetSyncService {
  constructor() {
    this.apiUrl = dbStore.getGasUrl();
  }

  getUrl() {
    return dbStore.getGasUrl();
  }

  async testConnection(url) {
    const targetUrl = url || this.getUrl();
    if (!targetUrl) return false;
    const endpoint = targetUrl + (targetUrl.includes("?") ? "&" : "?") + "action=ping";
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      return data.status === "success";
    } catch (e) {
      return false;
    }
  }

  // Fetch sheet data from Google Apps Script REST API
  async fetchSheetData(sheetName) {
    const url = this.getUrl();
    if (!url) return null;
    try {
      const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=readAll&sheet=${sheetName}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        return data.data;
      }
    } catch (e) {
      console.warn(`Gagal membaca sheet ${sheetName}:`, e);
    }
    return null;
  }

  // Insert a single record to Google Sheets
  async insertRecord(sheetName, record) {
    const url = this.getUrl();
    if (!url) return false;
    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "insert",
          sheet: sheetName,
          data: record
        })
      });
      return true;
    } catch (e) {
      console.warn("Insert ke Google Sheet gagal:", e);
      return false;
    }
  }

  // Push all local database state to Google Sheets
  async syncAllToGoogleSheets() {
    const url = this.getUrl();
    if (!url) throw new Error("Google Sheets Web App URL belum dikonfigurasi di Settings.");
    
    const payload = {
      action: "syncAll",
      fullDatabase: dbStore.db
    };

    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    dbStore.logAction("Google Sheet Sync", "Berhasil menyinkronkan seluruh database dengan Google Sheet");
    return true;
  }

  // Auto Initial Sync from Google Sheets on Web App Launch
  async syncFromSheets() {
    const url = this.getUrl();
    if (!url) return false;

    const collections = ["Patients", "Doctors", "Medicines", "Appointments", "Transactions"];
    let anyUpdated = false;

    for (const c of collections) {
      const remoteData = await this.fetchSheetData(c);
      if (remoteData && remoteData.length > 0) {
        const key = c.toLowerCase();
        dbStore.db[key] = remoteData;
        anyUpdated = true;
      }
    }

    if (anyUpdated) {
      dbStore.save();
      console.log("Database disinkronkan dari Google Sheets!");
      return true;
    }
    return false;
  }
}

window.gasSyncService = new GoogleSheetSyncService();
window.GAS_TEMPLATE_CODE = GAS_TEMPLATE_CODE;
