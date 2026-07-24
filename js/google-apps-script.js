/* ==========================================================================
   SMART PHARMACY & CLINIC MANAGEMENT SYSTEM
   Google Apps Script REST API Connector & Sync Service
   ========================================================================== */

class GoogleAppsScriptService {
  constructor() {
    this.gasUrlKey = "SMART_CLINIC_GAS_URL";
  }

  getUrl() {
    return localStorage.getItem(this.gasUrlKey) || "";
  }

  setUrl(url) {
    if (url) {
      localStorage.setItem(this.gasUrlKey, url.trim());
    }
  }

  async testConnection(customUrl = null) {
    const url = customUrl || this.getUrl();
    if (!url || !url.startsWith("http")) return false;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const resp = await fetch(`${url}?action=ping`, {
        method: "GET",
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!resp.ok) return false;
      const data = await resp.json();
      return data.status === "success" || data.status === "ok";
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn("GAS Ping connection failed or timed out:", e);
      return false;
    }
  }

  async insertRecord(sheetName, recordData) {
    const url = this.getUrl();
    if (!url) return false;

    try {
      const payload = {
        action: "insert",
        sheet: sheetName,
        data: recordData
      };

      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      console.log(`[GAS Sync] Inserted into sheet '${sheetName}' successfully.`);
      return true;
    } catch (err) {
      console.error(`[GAS Sync Error] Failed to insert into '${sheetName}':`, err);
      return false;
    }
  }

  async syncAllToGoogleSheets() {
    const url = this.getUrl();
    if (!url) throw new Error("Google Apps Script URL belum diset!");

    const dbData = {
      Patients: dbStore.get("patients"),
      Doctors: dbStore.get("doctors"),
      Medicines: dbStore.get("medicines"),
      Appointments: dbStore.get("appointments"),
      Transactions: dbStore.get("transactions"),
      Logs: dbStore.get("logs")
    };

    const payload = {
      action: "syncAll",
      data: dbData
    };

    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return true;
  }

  async syncFromSheets() {
    const url = this.getUrl();
    if (!url) return false;

    try {
      const resp = await fetch(`${url}?action=readAll`);
      if (!resp.ok) return false;
      const json = await resp.json();

      if (json.status === "success" && json.data) {
        if (json.data.Patients && json.data.Patients.length > 0) dbStore.set("patients", json.data.Patients);
        if (json.data.Doctors && json.data.Doctors.length > 0) dbStore.set("doctors", json.data.Doctors);
        if (json.data.Medicines && json.data.Medicines.length > 0) dbStore.set("medicines", json.data.Medicines);
        if (json.data.Appointments && json.data.Appointments.length > 0) dbStore.set("appointments", json.data.Appointments);
        if (json.data.Transactions && json.data.Transactions.length > 0) dbStore.set("transactions", json.data.Transactions);
        return true;
      }
    } catch (e) {
      console.warn("[GAS Sync Read Error]:", e);
    }
    return false;
  }
}

window.gasSyncService = new GoogleAppsScriptService();
