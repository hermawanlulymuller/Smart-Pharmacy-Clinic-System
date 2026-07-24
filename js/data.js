/* ==========================================================================
   SMART PHARMACY & CLINIC MANAGEMENT SYSTEM
   Commercial SaaS Initial Data Engine & LocalStorage Manager
   ========================================================================== */

class LocalDataStore {
  constructor() {
    this.storagePrefix = "SMART_CLINIC_";
    this.gasUrlKey = "SMART_CLINIC_GAS_URL";

    // 25% Profit Margin Calculation Helper (Harga Jual = Harga Beli + 25%)
    this.calculateSellingPrice = (purchasePrice) => {
      const buy = Number(purchasePrice || 0);
      return Math.round(buy * 1.25);
    };

    // Initial Commercial SaaS Dummy Dataset
    this.initialData = {
      patients: [
        {
          id: "PAT-2026-001",
          name: "Budi Santoso",
          gender: "Laki-laki",
          dob: "1988-05-14",
          phone: "081234567890",
          email: "budi.santoso@gmail.com",
          insurance: "BPJS Kesehatan (Kelas 1)",
          bloodType: "O+",
          allergy: "Penicillin",
          medicalHistory: "Hipertensi Derajat 1, Gastritis Akut",
          visitsCount: 4,
          lastVisit: "2026-07-20"
        },
        {
          id: "PAT-2026-002",
          name: "Siti Rahmawati",
          gender: "Perempuan",
          dob: "1993-11-22",
          phone: "085711223344",
          email: "siti.rahma@yahoo.com",
          insurance: "Asuransi Mandiri Inhealth",
          bloodType: "A+",
          allergy: "Sulfa, Seafood",
          medicalHistory: "Asma Bronkial Kontrol Ringan",
          visitsCount: 2,
          lastVisit: "2026-07-18"
        },
        {
          id: "PAT-2026-003",
          name: "Hendrik Wijaya",
          gender: "Laki-laki",
          dob: "1975-03-30",
          phone: "081988776655",
          email: "hendrik.w@outlook.com",
          insurance: "Umum / Swasta",
          bloodType: "B+",
          allergy: "Tidak Ada",
          medicalHistory: "Diabetes Mellitus Tipe 2",
          visitsCount: 6,
          lastVisit: "2026-07-22"
        }
      ],

      doctors: [
        {
          id: "DOC-001",
          name: "dr. Andi Wijaya, Sp.PD",
          specialization: "Spesialis Penyakit Dalam",
          room: "Poli Interna (R-102)",
          schedule: "Senin - Jumat (08:00 - 15:00)",
          consultationFee: 100000, // Rp 100.000 Default Biaya Periksa Dokter
          availability: "Online",
          photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300"
        },
        {
          id: "DOC-002",
          name: "dr. Maya Putri, Sp.A",
          specialization: "Spesialis Anak",
          room: "Poli Anak (R-105)",
          schedule: "Senin - Sabtu (09:00 - 14:00)",
          consultationFee: 100000, // Rp 100.000 Default Biaya Periksa Dokter
          availability: "Online",
          photo: "https://images.unsplash.com/photo-1594824813566-88855ce78347?w=300"
        },
        {
          id: "DOC-003",
          name: "drg. Rizky Kurniawan",
          specialization: "Dokter Gigi & Mulut",
          room: "Poli Gigi (R-108)",
          schedule: "Selasa, Kamis, Sabtu (13:00 - 18:00)",
          consultationFee: 100000, // Rp 100.000 Default Biaya Periksa Dokter
          availability: "Offline",
          photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300"
        }
      ],

      // Stock Gudang & Harga Jual Toko Obat (+25% Keuntungan)
      medicines: [
        {
          id: "MED-1001",
          name: "Paracetamol 500mg Forte",
          category: "Obat Bebas",
          brand: "Kimia Farma",
          batchNumber: "BCH-2026-001",
          expiredDate: "2028-12-31",
          purchasePrice: 10000, // Harga Beli Pokok Gudang
          sellingPrice: 12500,  // Harga Jual Retail Toko Obat (+25% Profit)
          profitMargin: "25%",
          stock: 250,
          minStock: 20,
          location: "Rak A-01 (Generik)",
          image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300"
        },
        {
          id: "MED-1002",
          name: "Amoxicillin Trihydrate 500mg",
          category: "Antibiotik / Resep",
          brand: "Sanbe Farma",
          batchNumber: "BCH-2026-042",
          expiredDate: "2027-09-15",
          purchasePrice: 16000, // Harga Beli Pokok Gudang
          sellingPrice: 20000,  // Harga Jual Retail Toko Obat (+25% Profit)
          profitMargin: "25%",
          stock: 120,
          minStock: 15,
          location: "Rak B-03 (Antibiotik)",
          image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300"
        },
        {
          id: "MED-1003",
          name: "Omeprazole Capsules 20mg",
          category: "Obat Keras",
          brand: "Dexa Medica",
          batchNumber: "BCH-2026-088",
          expiredDate: "2028-04-20",
          purchasePrice: 28000, // Harga Beli Pokok Gudang
          sellingPrice: 35000,  // Harga Jual Retail Toko Obat (+25% Profit)
          profitMargin: "25%",
          stock: 85,
          minStock: 10,
          location: "Rak C-02 (Kardiologi/Lambung)",
          image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300"
        },
        {
          id: "MED-1004",
          name: "Amlodipine Besylate 10mg",
          category: "Obat Keras / Hipertensi",
          brand: "Kalbe Farma",
          batchNumber: "BCH-2026-105",
          expiredDate: "2026-10-10", // Alert Kadaluarsa mendekati <60 hari
          purchasePrice: 12000, // Harga Beli Pokok Gudang
          sellingPrice: 15000,  // Harga Jual Retail Toko Obat (+25% Profit)
          profitMargin: "25%",
          stock: 18, // Alert stok menipis
          minStock: 30,
          location: "Rak C-05 (Hipertensi)",
          image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300"
        },
        {
          id: "MED-1005",
          name: "Vitamin C 1000mg + Zinc Supplement",
          category: "Vitamin & Suplemen",
          brand: "Enervon / Sido Muncul",
          batchNumber: "BCH-2026-302",
          expiredDate: "2029-01-01",
          purchasePrice: 40000, // Harga Beli Pokok Gudang
          sellingPrice: 50000,  // Harga Jual Retail Toko Obat (+25% Profit)
          profitMargin: "25%",
          stock: 300,
          minStock: 25,
          location: "Rak Display Depan A-01",
          image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300"
        }
      ],

      appointments: [
        {
          id: "APT-8801",
          patientName: "Budi Santoso",
          doctorName: "dr. Andi Wijaya, Sp.PD",
          date: "2026-07-24",
          time: "09:30 AM",
          type: "Tatap Muka",
          status: "Menunggu Antrean",
          queueNumber: "Q-01",
          notes: "Kontrol tensi & hipertensi rutin"
        },
        {
          id: "APT-8802",
          patientName: "Siti Rahmawati",
          doctorName: "dr. Maya Putri, Sp.A",
          date: "2026-07-24",
          time: "10:15 AM",
          type: "Online Telemedisin",
          status: "Sedang Berlangsung",
          queueNumber: "Q-02",
          notes: "Konsultasi demam anak 38.5 C"
        }
      ],

      transactions: [
        {
          id: "TRX-17217890001",
          date: "2026-07-24 08:30",
          patientName: "Budi Santoso",
          doctorFee: 100000, // Rp 100.000 Biaya Periksa Dokter
          medicineTotal: 35000,
          totalPaid: 135000,
          paymentMethod: "QRIS",
          cashierName: "Staf Kasir Utama",
          status: "Lunas"
        }
      ],

      logs: [
        {
          id: "LOG-001",
          timestamp: "2026-07-24 08:00",
          user: "Administrator System",
          action: "System Startup",
          detail: "Commercial SaaS Platform Ready for Pharmacy & Clinic Operations."
        }
      ]
    };

    this.init();
  }

  init() {
    Object.keys(this.initialData).forEach(key => {
      const storageKey = `${this.storagePrefix}${key.toUpperCase()}`;
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify(this.initialData[key]));
      }
    });
  }

  get(key) {
    try {
      const storageKey = `${this.storagePrefix}${key.toUpperCase()}`;
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : (this.initialData[key] || []);
    } catch(e) {
      return this.initialData[key] || [];
    }
  }

  set(key, data) {
    try {
      const storageKey = `${this.storagePrefix}${key.toUpperCase()}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch(e) {}
  }

  add(key, item) {
    // If adding a medicine, ensure selling price has 25% profit margin
    if (key.toLowerCase() === "medicines") {
      if (item.purchasePrice && !item.sellingPrice) {
        item.sellingPrice = this.calculateSellingPrice(item.purchasePrice);
      }
      item.profitMargin = "25%";
    }

    const list = this.get(key);
    list.unshift(item);
    this.set(key, list);

    this.logAction("Database Add", `Menambahkan data baru ke tabel ${key}`);
    try {
      if (window.gasSyncService) {
        const sheetTabName = key.charAt(0).toUpperCase() + key.slice(1);
        window.gasSyncService.insertRecord(sheetTabName, item);
      }
    } catch (err) {
      console.warn("Auto-sync to Google Sheets warning:", err);
    }
  }

  logAction(action, detail) {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("SMART_USER") || "{}");
      const logs = this.get("logs");
      const newLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString('id-ID'),
        user: currentUser.name || "System User",
        action: action,
        detail: detail
      };
      logs.unshift(newLog);
      this.set("logs", logs.slice(0, 50));
    } catch(e) {}
  }

  getGasUrl() {
    try {
      return localStorage.getItem(this.gasUrlKey) || "";
    } catch(e) { return ""; }
  }

  setGasUrl(url) {
    try {
      if (url) {
        localStorage.setItem(this.gasUrlKey, url.trim());
      }
    } catch(e) {}
  }
}

window.dbStore = new LocalDataStore();
