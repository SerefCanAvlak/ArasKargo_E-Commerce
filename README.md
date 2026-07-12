# 📦 Aras İşletmem — Entegre E-Ticaret ve Lojistik Platformu

> Küçük işletmeler ve kadın girişimciler için yüksek komisyonlardan uzak, doğrudan **Aras Kargo** entegrasyonlu ve lojistik kolaylığı sunan yeni nesil e-ticaret platformu.

---

## 🎯 Projenin Amacı (Problem & Çözüm)

* **Problem:** Günümüzdeki dev e-ticaret platformlarının kendi lojistik ağlarını kurup tekelleşmesi, yüksek komisyon oranları ve satıcı aleyhine katı kuralları, birçok küçük işletmenin ve girişimcinin kepenk indirmesine neden olmaktadır.
* **Çözüm:** **ARAS İşletmem**, satıcı ve müşteri dostu yeni bir ticaret alanı yaratır. Girişimcilere çok daha uygun maliyetlerle satış altyapısı sağlarken, siparişlerin lojistik aşamasını doğrudan Aras Kargo otomasyonuyla çözerek kurye çağırmadan teslimata kadar olan tüm süreçleri asenkron olarak otomatikleştirir.

---

## ⚡ Temel Özellikler (Core Features)

### 🛒 Müşteri Deneyimi
* **Merkezi Sepet & Favoriler:** Hızlı ve pürüzsüz alışveriş akışı sağlayan anlık bildirim (Toast) geri bildirimleri.
* **Entegre Kargo Takibi:** Sanal harita/zaman çizelgesi simülasyonu ile kargonun o anki durumunu anlık izleme.
* **Gelişmiş Filtreleme & Arama:** Kategorilere ve satıcılara göre detaylı listeleme.

### 💼 Satıcı Yönetim Paneli
* **Dashboard ve Finansal Analiz:** Toplam satış, aktif siparişler ve kazanç istatistiklerinin takibi.
* **Akıllı Cüzdan Sistemi:** Satıcının biriken bakiyesini banka hesabına aktarabilmesini sağlayan talep yönetimi.
* **Entegre Kurye Çağırma:** Gelen siparişler için tek tıkla kurye çağırma ve kargo takip numarası oluşturma.

---

## 🏗️ Teknik Mimari (Tech Stack & Architecture)

Proje, kurumsal standartlarda **Clean Architecture** (Katmanlı Mimari) prensiplerine uygun olarak geliştirilmiş olup, **Polyglot Persistence** (Çoklu Veritabanı) yapısını benimsemektedir:

### 🖥️ Backend (API)
* **Framework:** `.NET 8.0 Web API` (C#)
* **Mimari Yapı:** Clean Architecture (Domain, Application, Infrastructure, Presentation katmanları)
* **İlişkisel Veritabanı (RDBMS):** `MSSQL & EF Core` (Finansal işlemler, cüzdan bakiyeleri, kullanıcı kayıtları ve sipariş geçmişi)
* **NoSQL Veritabanı:** `MongoDB` (Esnek yapıda ürün katalogları, dinamik kategoriler ve sepet verileri)
* **Mesajlaşma Kuyruğu (Message Broker):** `RabbitMQ` (Sipariş sonrasında asenkron kargo fişi oluşturma, kurye atama ve takip numarası fırlatma işlemleri için arka plan işçileriyle entegrasyon)

### 🎨 Frontend
* **Kütüphane:** `React` (Vite tabanlı hızlı derleme)
* **Tasarım:** `Vanilla CSS` (Marka kimliğiyle uyumlu, geçiş efektleri ve mikro-animasyonlar içeren özel arayüz tasarımı)
* **State & Efektler:** Güvenli React Context API mimarisi ve React StrictMode uyumlu side-effect yönetimi

---

## ⚙️ Lokal Kurulum Adımları (Quick Start)

Veritabanları ve kuyruk servisleri Docker container mimarisi sayesinde bilgisayarınıza manuel kuruluma ihtiyaç duymadan tek tıkla ayağa kalkar.

### 1. Servisleri Ayağa Kaldırma (Docker)
Docker masaüstü uygulamasının çalıştığından emin olduktan sonra projenin ana dizininde şu komutu çalıştırın:
```bash
docker-compose up -d
```
*(Bu komut MSSQL, MongoDB ve RabbitMQ servislerini arka planda başlatır.)*

### 2. API Servisini Çalıştırma (Backend)
```bash
cd backend\ArasIsletmem.API
dotnet run
```
* **Swagger Arayüzü:** `http://localhost:5086/swagger` adresi üzerinden API uç noktalarını canlı olarak test edebilirsiniz.

### 3. Arayüzü Çalıştırma (Frontend)
```bash
cd frontend
npm install
npm run dev
```
* **Geliştirme Sunucusu:** Tarayıcınızdan konsolda belirtilen yerel adrese (varsayılan: `http://localhost:5173`) giderek platformu kullanabilirsiniz.
