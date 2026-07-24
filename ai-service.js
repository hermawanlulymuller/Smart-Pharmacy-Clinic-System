/* ==========================================================================
   SMART PHARMACY & CLINIC MANAGEMENT SYSTEM
   Reusable AI Service (OpenRouter, Gemini, Groq, Cloudflare & Offline Engine)
   ========================================================================== */

class AIService {
  constructor() {
    this.storageKey = "SMART_CLINIC_AI_CONFIG";
    this.initConfig();
  }

  initConfig() {
    const saved = localStorage.getItem(this.storageKey);
    this.config = saved ? JSON.parse(saved) : {
      provider: "fallback", // "openrouter", "gemini", "groq", "cloudflare", "fallback"
      apiKey: "",
      modelName: "google/gemini-flash-1.5-exp:free"
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(this.storageKey, JSON.stringify(this.config));
  }

  async askHealthAssistant(userPrompt, context = {}) {
    // Check if API key is provided and provider selected
    if (this.config.provider === "openrouter" && this.config.apiKey) {
      try {
        return await this.queryOpenRouter(userPrompt);
      } catch (err) {
        console.warn("OpenRouter API error, using smart offline fallback:", err);
      }
    } else if (this.config.provider === "gemini" && this.config.apiKey) {
      try {
        return await this.queryGemini(userPrompt);
      } catch (err) {
        console.warn("Gemini API error, using smart offline fallback:", err);
      }
    } else if (this.config.provider === "groq" && this.config.apiKey) {
      try {
        return await this.queryGroq(userPrompt);
      } catch (err) {
        console.warn("Groq API error, using smart offline fallback:", err);
      }
    }

    // Smart Offline Health Engine Fallback
    return this.generateOfflineResponse(userPrompt, context);
  }

  // OpenRouter Free API
  async queryOpenRouter(prompt) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.modelName || "google/gemini-flash-1.5-exp:free",
        messages: [
          { role: "system", content: "Anda adalah Health Assistant AI resmi dari Smart Pharmacy & Clinic System oleh Luly Agency. Berikan jawaban medis umum yang sopan, akurat, dan membantu." },
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await res.json();
    return data.choices[0]?.message?.content || "Maaf, tidak dapat memproses jawaban dari OpenRouter AI.";
  }

  // Google Gemini API
  async queryGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.config.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await res.json();
    return data.candidates[0]?.content?.parts[0]?.text || "Maaf, tidak dapat memproses jawaban dari Gemini AI.";
  }

  // Groq API
  async queryGroq(prompt) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await res.json();
    return data.choices[0]?.message?.content || "Maaf, tidak dapat memproses jawaban dari Groq AI.";
  }

  // Smart Offline Medical Knowledge & Calculator Engine
  generateOfflineResponse(prompt, context) {
    const lower = prompt.toLowerCase();

    // 1. BMI Calculation Request
    if (lower.includes("bmi") || lower.includes("berat ideal") || lower.includes("indeks massa tubuh")) {
      return `📊 **Kalkulator BMI & Saran Kesehatan**\n\n- **Kategori BMI Normal**: 18.5 - 24.9 kg/m²\n- **Saran**: Pertahankan pola makan gizi seimbang (4 sehat 5 sempurna), penuhi hidrasi 2-2.5 Liter air/hari, dan olahraga aerobik sedang minimal 150 menit per minggu.\n\n*Gunakan tab tools di atas untuk menghitung BMI presisi Anda!*`;
    }

    // 2. Medicine Info / Interaksi Obat
    if (lower.includes("paracetamol") || lower.includes("obat") || lower.includes("dosis") || lower.includes("efek samping")) {
      return `💊 **Informasi Medis Obat & Farmakologi**\n\n- **Paracetamol 500mg**: Dosis dewasa 500mg - 1000mg setiap 4-6 jam jika perlu (Maksimal 4000mg/hari).\n- **Peringatan**: Hati-hati pada pasien dengan gangguan fungsi hati berat.\n- **Interaksi**: Hindari penggunaan bersama alkohol berlebih atau kombinasi dengan obat lain yang mengandung paracetamol (mencegah overdosis tak disengaja).`;
    }

    // 3. Hipertensi & Penyakit Dalam
    if (lower.includes("hipertensi") || lower.includes("tensi") || lower.includes("darah tinggi")) {
      return `🫀 **Panduan Klinis Hipertensi (Tekanan Darah Tinggi)**\n\n- **Target Tensi Normal**: < 120/80 mmHg\n- **Penanganan Awal**: Kurangi asupan garam/natrium (< 2 gram garam dapur/hari), hindari merokok dan stres.\n- **Rekomendasi Dokter**: Disarankan berkonsultasi dengan **dr. Andi Wijaya, Sp.PD** di Poli Interna Klinik kami.`;
    }

    // 4. Jadwal Dokter
    if (lower.includes("jadwal") || lower.includes("dokter") || lower.includes("jam buka")) {
      return `👨‍⚕️ **Jadwal Dokter Praktek Hari Ini**:
1. **dr. Andi Wijaya, Sp.PD** (Penyakit Dalam): 08:00 - 15:00 (Poli Interna 101)
2. **drg. Maya Saphira, Sp.KG** (Gigi): 10:00 - 18:00 (Poli Gigi 202)
3. **dr. Clarissa Vance, Sp.DV** (Kulit & Estetika): 13:00 - 20:00 (Ruang 305)

*Buka Tab 'Appointments' untuk mendaftar antrean secara online!*`;
    }

    // Default Fallback
    return `🤖 **Health Assistant AI (Smart Offline Mode)**\n\nSaya mendeteksi pertanyaan Anda mengenai: *"${prompt}"*.\n\n**Rekomendasi Kesehatan Umum**:\n1. Jaga hidrasi air minum minimal 8 gelas sehari.\n2. Jika mengalami gejala demam >38°C lebih dari 2 hari, segera jadwalkan pemeriksaan langsung di klinik kami.\n3. Anda dapat mendaftarkan rekam medis & reservasi dokter melalui sistem antrean online Smart Clinic.`;
  }
}

window.aiService = new AIService();
