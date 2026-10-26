# Gazi Üniversitesi Tıp Fakültesi Çocuk Alerji Kliniği
## Gazi SFT Klinik Platform (v3.2)
### Pediatrik Solunum Fonksiyon Testi (SFT) Analiz, Telemetri ve Klinik Karar Destek Sistemi

Bu proje, Gazi Üniversitesi Tıp Fakültesi Çocuk İmmünolojisi ve Alerji Bilim Dalı bünyesinde kullanılan **Vyaire Medical (MasterScreen/JAEGER)** Solunum Fonksiyon Testi (SFT) cihazlarından alınan XML çıktılarını ayrıştıran, ilişkisel PostgreSQL veritabanında saklayan; hekimler ve araştırmacılar için kohort analizi, ATS/ERS 2019 reversibilite tespiti, Akış-Hacim (Flow-Volume) eğrisi spektrogramı ve çok sekmeli Excel dışa aktarımı sunan uçtan uca klinik karar destek platformudur.

---

## 🌟 Temel Yetenekler ve Sekmeler

Platform, hekimlerin klinik iş akışına göre tasarlanmış **5 ana çalışma alanından** oluşur:

1. **📊 Kohort Telemetrisi (`telemetry`):**
   - Parametrik filtre paneli (yaş, cinsiyet, FEV₁ %pred, FVC %pred, ölçüm fazı: Pre/Post-BD).
   - Canlı arama (protokol numarası, hasta adı, TC No).
   - Hızlı klinik önayarlar (Reversibilite Pozitif, Ağır Obstrüksiyon <%60, Çocuklar ≤12 yaş).
   - Seçili hasta için anlık künye bandı (yaş, boy, kilo, BSA $m^2$, FEV₁, Tiffeneau, reversibilite).
   - ATS/ERS ciddiyet rozetleri ve sıralanabilir klinik veri matrisi.

2. **📈 Akış-Hacim Spektrogramı (`spectral_curves`):**
   - Vyaire MasterScreen JAEGER koordinat dizilerini (200 örnek noktası) kullanarak **PRE-BD (Bazal - Mavi)** ve **POST-BD (Bronkodilatör - Amber)** ekspirasyon ve inspirasyon eğrilerini aynı koordinat sisteminde üst üste çizdirir.
   - İnteraktif koordinat telemetrisi (hacim L, akış L/s).
   - Yan panelde GLI-2012 referanslı FEV₁, FVC, FEV₁/FVC (Tiffeneau), PEF ve pediatrik reversibilite değerlendirme özeti.
   - Tam ekran modu ve doğrudan klinik rapor oluşturma bağlantısı.

3. **🧠 Klinik Karar Destek & AI İçgörü (`clinical_ai`):**
   - ATS/ERS 2019 kılavuzuna göre otomatik obstrüksiyon derecelendirmesi ve bronkodilatör reversibilite analizi.
   - Teşhis özet kartı (Reversibilite Pozitif Obstrüktif Patern / Astım Uyumlu, Normal Kapasite vb.).
   - Hekim klinik inceleme ve rapor notu şablonu.

4. **⚡ XML İçe Aktar & Cihaz Entegrasyonu (`ingestion_hub`):**
   - Vyaire NIOSH XML dosyaları için sürükle-bırak yükleme konsolu.
   - SHA-256 bütünlük kontrolü ile mükerrer dosyaları engelleme (deduplication).
   - İşlem raporu (başarılı, mükerrer, hatalı dosya sayıları ve süreleri).

5. **📑 Araştırma & Excel Dışa Aktarımı (`research_export`):**
   - Uygulanan filtrelere göre dinamik kohort boyutları ve istatistiksel özetler.
   - `openpyxl` motoru ile çok sekmeli formatlı Excel (`.xlsx`) raporu:
     - **Kohort_Ozet:** Hasta demografikleri, ziyaret tarihleri, en iyi deneme FEV₁, FVC, PEF değerleri ve reversibilite etiketleri.
     - **Parametre_Sozlugu:** ATS/ERS standartlarındaki klinik değişken tanımları ve birim kütüphanesi (SPSS ve R uyumlu).

6. **📄 Tıbbi Karar Destek Raporu & Yazdırma (PDF):**
   - Tek tıkla resmi klinik standartlarda A4 yazdırma / PDF kaydetme desteği.
   - Hekim muayene notları ve dijital doğrulama alanı.

7. **🌓 Açık / Koyu Mod Desteği (Dark / Light Theme):**
   - Poliklinik ortamındaki parlak ışıkta yüksek kontrastlı **Açık Tema** veya gece nöbetlerinde gözü yormayan **Koyu Tema**.

---

## 🏗️ Sistem Mimarisi

```
├── sft_ingestion/             # Backend & Ingestion Katmanı (Python, FastAPI, PostgreSQL)
│   ├── sql/
│   │   └── init_schema.sql    # PostgreSQL DDL, indeksler & mv_spirometry_best_trial view
│   ├── mock_xmls/             # 5 pediatrik klinik senaryoyu içeren sentetik Vyaire XML'leri
│   ├── parser.py              # lxml tabanlı modüler XML ayrıştırıcı & DBWriter
│   ├── run_ingest.py          # CLI toplu dosya işleme (SHA-256 idempotens & karantina)
│   ├── setup_db.py            # Otomatik veritabanı oluşturma ve şema kurma betiği
│   ├── api.py                 # FastAPI klinik sorgulama, Excel export ve upload API'si
│   ├── mock_data_generator.py # Sentetik Vyaire NIOSH XML üretici (GLI-2012 uyumlu)
│   └── requirements.txt       # Python bağımlılıkları (FastAPI, lxml, psycopg2, openpyxl)
├── frontend/                  # Hekim Karar Destek Paneli (Vite, React 18, TypeScript, Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx             # Üst marka barı, navigasyon sekmeleri & canlı durum
│   │   │   ├── FilterPanel.tsx        # Parametrik kohort filtre matrisi & canlı arama
│   │   │   ├── CohortTable.tsx        # Sıralanabilir dinamik hasta tablosu & ciddiyet rozetleri
│   │   │   ├── PatientBanner.tsx      # Seçili hasta özet künyesi & hızlı metrik kartları
│   │   │   ├── CurvePanel.tsx         # Recharts Akış-Hacim Pre/Post spektrogram paneli
│   │   │   ├── ClinicalAIView.tsx     # ATS/ERS 2019 klinik karar destek ve AI içgörü sekmesi
│   │   │   ├── IngestionHubView.tsx   # XML içe aktarma ve pipeline konsolu
│   │   │   ├── ResearchExportView.tsx # Araştırma veri havuzu & Excel dışa aktarım sekmesi
│   │   │   ├── ReportModal.tsx        # Yazdırılabilir tıbbi rapor modalı
│   │   │   └── UploadModal.tsx        # Hızlı XML sürükle-bırak yükleme modalı
│   │   ├── api/client.ts              # Axios tabanlı merkezi API istemcisi
│   │   ├── types/index.ts             # TypeScript tip tanımları & klinik hesaplama yardımcıları
│   │   ├── App.tsx                    # Ana sayfa layout ve durum yönetimi
│   │   └── index.css                  # Açık/koyu tema klinik tasarım sistemi
│   ├── package.json                   # React, Tailwind, Recharts, Lucide, Axios
│   └── vite.config.ts                 # Proxy yapılandırması (Port 3000 -> Port 8000)
├── Gazi Rapor Ornekleri/      # Vyaire cihaz çıktı örnekleri (PDF, XML, GDT, JPG)
├── PROJECT_SPEC.md            # Ayrıntılı mimari ve veri modeli şartnamesi
└── README.md                  # Proje ana tanıtım ve kurulum kılavuzu
```

---

## ⚡ Veri Modeli ve Tıbbi Standartlar

* **İlişkisel Saklama & EAV Bypass:** Sık filtrelenen klinik parametreler (`fev1_val`, `fvc_val`, `fev1_fvc_ratio`, `pef_val`, `fev1_pred_percent`, `fvc_pred_percent`) fiziksel kolon olarak saklanır.
* **Eğri Koordinatları:** Satır patlamasını önlemek için `REAL[]` dizileri olarak saklanır (200 nokta ekspirasyon + 200 nokta inspirasyon).
* **Materyalize Görünüm:** Hızlı kohort taraması için `mv_spirometry_best_trial` materialized view'ı kullanılır.
* **Reversibilite Kriteri:** ATS/ERS 2019 Pediatrik kılavuzu gereğince salbutamol sonrası $\Delta FEV_1 \ge \%12$ ve $\ge 200\text{ mL}$ mutlak artış pozitif olarak etiketlenir.
* **Referans Eşitlikleri:** GLI-2012 (Global Lung Function Initiative) pediatrik referans normları.

---

## 🚀 Kurulum ve Çalıştırma

### 1. Sistem Gereksinimleri
* **Python:** 3.10 veya üzeri
* **PostgreSQL:** 14 veya üzeri (varsayılan port `5432`)
* **Node.js:** 18 veya üzeri & npm

### 2. Veritabanı ve Şema Kurulumu
```bash
# Ingestion dizinine geçin
cd sft_ingestion

# Sanal ortamı oluşturun ve paketleri yükleyin
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# .env dosyasını oluşturun (DATABASE_URL=postgresql://postgres:parola@localhost:5432/sft_db)
# Veritabanını ve tabloları otomatik oluşturun:
python setup_db.py

# Test amaçlı sentetik pediatrik XML verilerini içe aktarın:
python run_ingest.py --input-dir ./mock_xmls
```

### 3. Backend API'yi Başlatma
```bash
cd sft_ingestion
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```
* **Swagger API Dokümantasyonu:** `http://localhost:8000/docs`
* **Sağlık Kontrolü:** `http://localhost:8000/health`

### 4. Frontend Kullanıcı Arayüzünü Başlatma
```bash
cd frontend
npm install
npm run dev
```
* **Web Portalı:** `http://localhost:3000`

---

## 🔒 Güvenlik ve Gizlilik
* Cihaz çıktılarındaki TC Kimlik Numarası ve hasta adı gibi kişisel veriler KVKK / HIPAA standartlarına uygun olarak sadece yetkili klinik ağında saklanır.
* Repository içerisinde hiçbir `.env`, gizli anahtar veya veritabanı parolası saklanmaz.
* Mükerrer dosya yüklemeleri SHA-256 hash kısıtı ile engellenir.

---

## 👨‍⚕️ Proje ve Klinik İletişim
* **Gazi Üniversitesi Tıp Fakültesi Çocuk İmmünolojisi ve Alerji Bilim Dalı**
* **SFT Cihazı:** Vyaire Medical MasterScreen / JAEGER SFT Laboratuvarı
