/* ==========================================================================
   SMART PHARMACY & CLINIC MANAGEMENT SYSTEM
   Initial Database & LocalStorage Data Engine with Real-Time Google Sheet Sync
   ========================================================================== */

const INITIAL_DB = {
  // 1. PATIENTS
  patients: [
    {
      id: "PAT-2026-001",
      name: "Budi Santoso",
      gender: "Laki-laki",
      dob: "1988-05-14",
      phone: "+62 812-3456-7890",
      email: "budi.santoso@email.com",
      address: "Jl. Sudirman No. 45, Jakarta Selatan",
      bloodType: "O+",
      insurance: "BPJS Kesehatan / Prudential",
      allergy: "Penicillin, Amoxicillin",
      emergencyContact: "Siti Rahma (Istri) - 081299887766",
      medicalHistory: "Hipertensi Derajat 1, Riwayat Asma Ringan",
      visitsCount: 5,
      lastVisit: "2026-07-20",
      qrCode: "PAT-2026-001"
    },
    {
      id: "PAT-2026-002",
      name: "Siti Aminah",
      gender: "Perempuan",
      dob: "1995-11-22",
      phone: "+62 857-1122-3344",
      email: "siti.aminah@gmail.com",
      address: "Jl. Gatot Subroto Blk C2, Jakarta Pusat",
      bloodType: "A+",
      insurance: "Mandiri Inhealth",
      allergy: "Kacang Tanah, Seafood",
      emergencyContact: "Hendra (Suami) - 085733221100",
      medicalHistory: "Gastritis Akut, Migrain Kronis",
      visitsCount: 3,
      lastVisit: "2026-07-22",
      qrCode: "PAT-2026-002"
    },
    {
      id: "PAT-2026-003",
      name: "Dewi Lestari",
      gender: "Perempuan",
      dob: "1992-03-08",
      phone: "+62 813-8899-0011",
      email: "dewi.lestari@yahoo.com",
      address: "Jl. Kemang Raya No. 12, Jakarta Selatan",
      bloodType: "B+",
      insurance: "Allianz Healthcare",
      allergy: "Tidak Ada",
      emergencyContact: "Rina (Kakak) - 081377665544",
      medicalHistory: "Pemeriksaan Kulit Routine, Acnes Minor",
      visitsCount: 8,
      lastVisit: "2026-07-23",
      qrCode: "PAT-2026-003"
    },
    {
      id: "PAT-2026-004",
      name: "Rizky Pratama",
      gender: "Laki-laki",
      dob: "2001-09-30",
      phone: "+62 878-5544-3322",
      email: "rizky.pratama@outlook.com",
      address: "Jl. Asia Afrika No. 88, Bandung",
      bloodType: "AB+",
      insurance: "Umum / Cash",
      allergy: "Sulfa",
      emergencyContact: "Bambang (Ayah) - 087811223344",
      medicalHistory: "Flu / ISPA, Demam ringan",
      visitsCount: 1,
      lastVisit: "2026-07-23",
      qrCode: "PAT-2026-004"
    }
  ],

  // 2. DOCTORS
  doctors: [
    {
      id: "DOC-001",
      name: "dr. Andi Wijaya, Sp.PD",
      specialization: "Internal Medicine (Penyakit Dalam)",
      licenseNumber: "SIP.554/IDI/2022",
      room: "Poli Interna - Ruang 101",
      consultationFee: 250000,
      rating: 4.9,
      experience: "12 Tahun",
      availability: "Online",
      photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
      schedule: "Senin - Jumat (08:00 - 15:00)"
    },
    {
      id: "DOC-002",
      name: "drg. Maya Saphira, Sp.KG",
      specialization: "Dentist (Dokter Gigi)",
      licenseNumber: "SIP.112/PDGI/2021",
      room: "Poli Gigi - Ruang 202",
      consultationFee: 200000,
      rating: 4.8,
      experience: "8 Tahun",
      availability: "Online",
      photo: "https://images.unsplash.com/photo-1594824813566-88855ce78347?w=300&auto=format&fit=crop&q=80",
      schedule: "Senin - Sabtu (10:00 - 18:00)"
    },
    {
      id: "DOC-003",
      name: "dr. Clarissa Vance, Sp.DV",
      specialization: "Dermatologist & Beauty Specialist",
      licenseNumber: "SIP.889/PERDOSKI/2023",
      room: "Estetika & Skin Care - Ruang 305",
      consultationFee: 300000,
      rating: 5.0,
      experience: "10 Tahun",
      availability: "Online",
      photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80",
      schedule: "Selasa - Minggu (13:00 - 20:00)"
    },
    {
      id: "DOC-004",
      name: "dr. Hendra Kusumah, Sp.A",
      specialization: "Pediatrician (Spesialis Anak)",
      licenseNumber: "SIP.332/IDAI/2020",
      room: "Poli Anak - Ruang 104",
      consultationFee: 225000,
      rating: 4.9,
      experience: "15 Tahun",
      availability: "Vacation",
      photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80",
      schedule: "Senin - Kamis (09:00 - 14:00)"
    }
  ],

  // 3. MEDICINES / INVENTORY
  medicines: [
    {
      id: "MED-101",
      name: "Paracetamol 500mg Forte",
      category: "Analgesik & Antipiretik",
      brand: "Kimia Farma",
      batchNumber: "BCH-2026-889",
      expiredDate: "2028-12-15",
      supplier: "PT. Phapros Tbk",
      purchasePrice: 8500,
      sellingPrice: 15000,
      barcode: "8991234567890",
      stock: 450,
      minStock: 50,
      location: "Rak A-01 / Strip",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80"
    },
    {
      id: "MED-102",
      name: "Amoxicillin Trihydrate 500mg",
      category: "Antibiotik",
      brand: "Kalbe Farma",
      batchNumber: "BCH-2026-112",
      expiredDate: "2026-09-10",
      supplier: "PT. Kalbe Farma Tbk",
      purchasePrice: 18000,
      sellingPrice: 28000,
      barcode: "8998877665544",
      stock: 12,
      minStock: 30,
      location: "Rak B-04 / Botol 100 Kap",
      image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80"
    },
    {
      id: "MED-103",
      name: "Omeprazole Capsule 20mg",
      category: "Gastroenterologi",
      brand: "Dexa Medica",
      batchNumber: "BCH-2026-445",
      expiredDate: "2027-05-20",
      supplier: "PT. Dexa Medica",
      purchasePrice: 22000,
      sellingPrice: 35000,
      barcode: "8993344556677",
      stock: 180,
      minStock: 40,
      location: "Rak C-02 / Strip",
      image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&auto=format&fit=crop&q=80"
    },
    {
      id: "MED-104",
      name: "Amlodipine Besylate 10mg",
      category: "Kardiovaskular / Antihipertensi",
      brand: "Sanbe Farma",
      batchNumber: "BCH-2025-998",
      expiredDate: "2026-08-01",
      supplier: "PT. Sanbe Farma",
      purchasePrice: 12000,
      sellingPrice: 20000,
      barcode: "8995566778899",
      stock: 8,
      minStock: 25,
      location: "Rak A-05 / Strip",
      image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&auto=format&fit=crop&q=80"
    },
    {
      id: "MED-105",
      name: "Vitamin C 1000mg Effervescent",
      category: "Suplemen & Multivitamin",
      brand: "Redoxon / Bayer",
      batchNumber: "BCH-2026-303",
      expiredDate: "2028-01-30",
      supplier: "PT. Bayer Indonesia",
      purchasePrice: 38000,
      sellingPrice: 55000,
      barcode: "8997788990011",
      stock: 95,
      minStock: 20,
      location: "Etalase Depan / Tube",
      image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80"
    }
  ],

  // 4. APPOINTMENTS
  appointments: [
    {
      id: "APT-8801",
      patientName: "Budi Santoso",
      patientPhone: "+62 812-3456-7890",
      doctorName: "dr. Andi Wijaya, Sp.PD",
      date: "2026-07-24",
      time: "09:00 AM",
      queueNumber: "A-001",
      status: "Dipanggil / Dalam Konsultasi",
      type: "Tatap Muka",
      notes: "Cek rutin hipertensi & keluhan asam lambung"
    },
    {
      id: "APT-8802",
      patientName: "Siti Aminah",
      patientPhone: "+62 857-1122-3344",
      doctorName: "dr. Clarissa Vance, Sp.DV",
      date: "2026-07-24",
      time: "10:30 AM",
      queueNumber: "B-002",
      status: "Menunggu Antrean",
      type: "Online Telemedisin",
      notes: "Konsultasi masalah jerawat & resep skincare"
    },
    {
      id: "APT-8803",
      patientName: "Dewi Lestari",
      patientPhone: "+62 813-8899-0011",
      doctorName: "drg. Maya Saphira, Sp.KG",
      date: "2026-07-24",
      time: "01:00 PM",
      queueNumber: "C-003",
      status: "Menunggu Antrean",
      type: "Tatap Muka",
      notes: "Pembersihan Karang Gigi (Scaling)"
    }
  ],

  // 5. TRANSACTIONS / POS
  transactions: [
    {
      id: "TRX-20260723-01",
      date: "2026-07-23 14:30",
      patientName: "Budi Santoso",
      doctorFee: 250000,
      medicineTotal: 50000,
      discount: 10000,
      totalPaid: 290000,
      paymentMethod: "QRIS",
      status: "Lunas"
    },
    {
      id: "TRX-20260723-02",
      date: "2026-07-23 16:15",
      patientName: "Siti Aminah",
      doctorFee: 300000,
      medicineTotal: 55000,
      discount: 0,
      totalPaid: 355000,
      paymentMethod: "Transfer Bank",
      status: "Lunas"
    }
  ],

  // 6. SYSTEM LOGS
  logs: [
    { timestamp: "2026-07-23 22:45:10", user: "Admin (Luly)", action: "Login System", detail: "Berhasil masuk via Multi-Factor OAuth" }
  ]
};

// Data Store Manager with LocalStorage & Automatic Google Sheet Real-time Sync
class DataStore {
  constructor() {
    this.storageKey = "SMART_CLINIC_DB_V3";
    this.gasUrlKey = "SMART_CLINIC_GAS_URL";
    this.initData();
  }

  initData() {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      localStorage.setItem(this.storageKey, JSON.stringify(INITIAL_DB));
      this.db = INITIAL_DB;
    } else {
      try {
        this.db = JSON.parse(existing);
      } catch (e) {
        this.db = INITIAL_DB;
      }
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.db));
  }

  get(collection) {
    return this.db[collection] || [];
  }

  add(collection, item) {
    if (!this.db[collection]) this.db[collection] = [];
    this.db[collection].unshift(item);
    this.save();
    this.logAction("Create Item", `Added new item to ${collection}: ${item.name || item.id}`);

    // Realtime Background Sync to Google Sheets if configured
    if (window.gasSyncService && window.gasSyncService.getUrl()) {
      const sheetCapitalized = collection.charAt(0).toUpperCase() + collection.slice(1);
      window.gasSyncService.insertRecord(sheetCapitalized, item);
    }
  }

  update(collection, id, updatedData) {
    if (!this.db[collection]) return;
    const index = this.db[collection].findIndex(i => i.id === id);
    if (index !== -1) {
      this.db[collection][index] = { ...this.db[collection][index], ...updatedData };
      this.save();
      this.logAction("Update Item", `Updated ${collection} ID: ${id}`);

      // Realtime Sync to Google Sheets
      if (window.gasSyncService && window.gasSyncService.getUrl()) {
        window.gasSyncService.syncAllToGoogleSheets().catch(err => console.warn(err));
      }
    }
  }

  delete(collection, id) {
    if (!this.db[collection]) return;
    this.db[collection] = this.db[collection].filter(i => i.id !== id);
    this.save();
    this.logAction("Delete Item", `Deleted from ${collection} ID: ${id}`);

    // Realtime Sync to Google Sheets
    if (window.gasSyncService && window.gasSyncService.getUrl()) {
      window.gasSyncService.syncAllToGoogleSheets().catch(err => console.warn(err));
    }
  }

  logAction(action, detail) {
    const user = JSON.parse(sessionStorage.getItem("SMART_USER") || "{}").name || "User System";
    const newLog = {
      timestamp: new Date().toLocaleString("id-ID"),
      user: user,
      action: action,
      detail: detail
    };
    if (!this.db.logs) this.db.logs = [];
    this.db.logs.unshift(newLog);
    if (this.db.logs.length > 50) this.db.logs.pop();
    this.save();
  }

  getGasUrl() {
    return localStorage.getItem(this.gasUrlKey) || "";
  }

  setGasUrl(url) {
    localStorage.setItem(this.gasUrlKey, url);
  }
}

window.dbStore = new DataStore();
