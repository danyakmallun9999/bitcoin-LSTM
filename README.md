# AI Algorithmic Trading System

## Pendahuluan

Selamat datang di **AI Algorithmic Trading System**. Proyek ini adalah sistem perdagangan otomatis canggih yang dirancang untuk melakukan perdagangan di pasar keuangan menggunakan algoritma kecerdasan buatan (AI). Sistem ini dibangun dengan arsitektur *microservices* yang digerakkan oleh peristiwa (event-driven), memastikan skalabilitas dan responsivitas tinggi terhadap data pasar waktu nyata (real-time).

Sistem ini terdiri dari backend yang kuat berbasis Python untuk logika perdagangan dan analisis data, serta frontend modern berbasis Next.js untuk pemantauan dan manajemen strategi perdagangan secara real-time.

## Tech Stack

Proyek ini menggunakan teknologi terkini untuk memastikan performa yang optimal:

### Backend (Trading Logic & API)
*   **Bahasa Pemrograman**: Python 3.10+
*   **Framework API**: FastAPI (untuk performa tinggi dan asinkron)
*   **Server**: Uvicorn
*   **Data Processing**: Polars (untuk manipulasi data cepat), NumPy
*   **Database ORM**: SQLAlchemy (Async)
*   **Database Driver**: AsyncPG
*   **External API**: python-binance (untuk koneksi ke bursa Binance)
*   **Dependency Management**: Poetry

### Frontend (Dashboard)
*   **Framework**: Next.js 16.1.6 (App Router)
*   **Library UI**: React 19
*   **Styling**: Tailwind CSS v4
*   **Komponen UI**: Radix UI, Lucide React (ikon)
*   **State Management/Data Fetching**: React Use Websocket
*   **Visualisasi Data**: Recharts, Framer Motion (animasi)

### Infrastruktur & Database
*   **Database**: PostgreSQL dengan ekstensi TimescaleDB (untuk data time-series)
*   **Containerization**: Docker & Docker Compose

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal perangkat lunak berikut di komputer Anda:

1.  **Docker Desktop** (untuk menjalankan database dan infrastruktur)
2.  **Python 3.10** atau lebih baru
3.  **Node.js 20** atau lebih baru
4.  **Poetry** (untuk manajemen paket Python)
    ```bash
    curl -sSL https://install.python-poetry.org | python3 -
    ```

## Cara Instalasi

Ikuti langkah-langkah berikut untuk menginstal dan menyiapkan proyek di lingkungan lokal Anda.

### 1. Clone Repository

```bash
git clone <repository-url>
cd trading
```

### 2. Menyiapkan Infrastruktur (Database)

Jalankan container database menggunakan Docker Compose:

```bash
docker-compose up -d
```

Ini akan menjalankan PostgreSQL dengan TimescaleDB di latar belakang.

### 3. Instalasi Backend

Masuk ke direktori backend dan instal dependensi menggunakan Poetry:

```bash
cd backend
poetry install
```

### 4. Instalasi Frontend

Buka terminal baru, masuk ke direktori frontend, dan instal dependensi menggunakan npm:

```bash
cd frontend
npm install
```

## Cara Pemakaian

Setelah instalasi selesai, Anda dapat menjalankan sistem secara lokal.

### Menjalankan Backend

Dari direktori `backend`, jalankan server pengembangan:

```bash
# Pastikan virtual environment aktif jika tidak otomatis
poetry shell

# Jalankan server
uvicorn app.main:app --reload
```

Backend akan berjalan di `http://localhost:8000`.

### Menjalankan Frontend

Dari direktori `frontend`, jalankan server pengembangan Next.js:

```bash
npm run dev
```

Frontend akan dapat diakses di `http://localhost:3000`.

## Fitur Saat Ini

Sistem saat ini memiliki kapabilitas sebagai berikut:

*   **Dashboard Real-time**: Visualisasi pergerakan harga dan indikator teknikal secara langsung menggunakan WebSocket.
*   **AI-Driven Strategy**: Implementasi strategi trading berbasis **LSTM (Long Short-Term Memory)** untuk memprediksi tren pasar.
*   **Backtesting Engine**: Modul simulasi untuk menguji performa strategi menggunakan data historis sebelum digunakan secara live.
*   **Manajemen Aset**: Pemantauan saldo, alokasi aset, dan estimasi PnL (Profit and Loss) secara real-time.
*   **Sistem Event-Driven**: Arsitektur yang responsif terhadap setiap perubahan data pasar (tick-by-tick).

## Roadmap (Rencana Pengembangan)

Kami terus mengembangkan sistem ini. Berikut adalah fitur yang direncanakan untuk masa depan:

*   **Multi-Exchange Support**: Menambahkan integrasi dengan bursa lain seperti Coinbase, Kraken, dan Bybit.
*   **Advanced AI Models**: Eksperimen dengan arsitektur **Transformer** dan **Reinforcement Learning (RL)** untuk pengambilan keputusan yang lebih adaptif.
*   **Live Trading Execution**: Transisi dari paper trading ke eksekusi order otomatis di mainnet dengan manajemen risiko yang ketat.
*   **Notifikasi Cerdas**: Integrasi bot Telegram/Discord untuk mengirimkan sinyal trading dan laporan kinerja harian.
*   **User Authentication**: Sistem login aman untuk mendukung multi-user dan preferensi personal.
*   **Mobile App Support**: Pengembangan aplikasi mobile (React Native) untuk pemantauan portofolio saat bepergian.

## Struktur Proyek


Berikut adalah gambaran singkat struktur folder proyek:

*   **`backend/`**: Berisi seluruh kode sumber untuk API, model ML, dan logika perdagangan otomatis.
    *   `app/`: Kode aplikasi utama.
    *   `alembic/`: Skrip migrasi database.
    *   `tests/`: Unit test dan integration test.
*   **`frontend/`**: Berisi kode sumber untuk antarmuka pengguna (Dashboard).
    *   `app/`: Halaman dan routing Next.js.
    *   `components/`: Komponen React yang dapat digunakan kembali.
    *   `hooks/`: Custom React Hooks.
*   **`database/`**: Skrip inisialisasi dan skema database.
*   **`notebooks/`**: Jupyter Notebooks untuk eksperimen data dan riset strategi.
*   **`docker-compose.yml`**: Konfigurasi untuk menjalankan layanan infrastruktur lokal.

---
*Dibuat dengan ❤️ oleh danyakmallun (vibe coding).*
