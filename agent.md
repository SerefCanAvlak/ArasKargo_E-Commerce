# Aras İşletmem - Arka Uç (Backend) ve Veritabanı Mimari Tasarım Dokümanı (agent.md)

## 1. Projenin Amacı ve Temel Değer Önerisi
Günümüz e-ticaret ekosisteminde pazar yerlerinin uyguladığı yüksek komisyon oranları ve lojistik yaptırımları, küçük işletmeler ile girişimcilerin ticari faaliyetlerini sürdürmesini zorlaştırmakta ve krizlere yol açmaktadır [cite: 4, 5, 6]. **Aras İşletmem** platformu, bu pazar yeri baskılarına karşı "satıcı dostu ve müşteri odaklı" alternatif bir ticari alan yaratmayı hedefler [cite: 7, 8, 9]. Girişimcileri ve özellikle kadın girişimcileri desteklemek amacıyla yüksek komisyonlar barındırmayan, lojistik süreçlerin doğrudan entegre edildiği bir altyapı sunar [cite: 8, 10].

Sistemin temel çalışma döngüsü üç kolay adımdan oluşur: Satıcı ürününü ekler, dinamik olarak oluşan satış linkini sosyal medya veya iletişim kanallarında paylaşır, sipariş geldiğinde ise Aras Kargo ürünü satıcının kapısından teslim alarak müşteriye ulaştırır [cite: 22, 33, 44].

---

## 2. Teknik Teknoloji Yığını (Tech Stack)
Aras Kargo'nun kurumsal mimari standartları, mikroservis yetkinlikleri ve veri tabanı performans beklentileri doğrultusunda arka uç mimarisi şu teknolojilerle kurgulanmıştır:

* **Arka Uç Çatısı (Backend Framework):** .NET 8.0 Web API (C#)
* **Nesne-İlişkisel Eşleme (ORM):** Entity Framework Core (EF Core) - Code First Yaklaşımı
* **İlişkisel Veritabanı (RDBMS):** Microsoft SQL Server (MSSQL) / T-SQL (Finansal veriler, kullanıcılar, cüzdan ve sipariş takibi için)
* **Doküman Tabanlı Veritabanı (NoSQL):** MongoDB (Esnek ürün kataloğu ve metadata yönetimi için)
* **Mesaj Kuyruğu (Message Broker):** RabbitMQ (Sipariş oluşturma ve asenkron kargo kodu üretim süreçlerini ayırmak için)
* **Konteynerleştirme:** Docker ve Docker Compose (Lokal geliştirme ortamını eşitlemek için)

---

## 3. GitHub ve Ortak Çalışma (Collaboration) İş Akışı
Projenin iki kişi (Backend & React Frontend geliştiricileri) tarafından çakışma (merge conflict) yaşanmadan, izlenebilir ve senkronize bir şekilde yürütülmesi için **GitHub Flow** modeli benimsenecektir.

### 3.1. Depo (Repository) Yapısı: Monorepo
Projenin tek bir GitHub deposunda yönetilmesi, API sözleşmelerinin ve Docker konfigürasyonlarının ortak takibini kolaylaştırır.
```text
aras-isletmem/
├── .github/
│   └── workflows/          # CI/CD pipeline tanımları (ilerisi için)
├── backend/                # .NET 8.0 Web API Çözümü
│   ├── ArasIsletmem.API/   # Controller katmanı ve servis ayağı
│   ├── ArasIsletmem.Core/  # Entity'ler, Arayüzler (Interfaces) ve DTO'lar
│   ├── ArasIsletmem.Data/  # DB Context, EF Core Repository'ler, Migrations
│   └── ArasIsletmem.Service/ # İş mantığı (Business Logic) ve Kurallar
├── frontend/               # React.js Uygulaması (Arkadaşının geliştireceği alan)
│   ├── public/
│   └── src/
├── docker-compose.yml      # MSSQL, MongoDB ve RabbitMQ'yu tek tıkla kaldıran dosya
└── README.md
```

### 3.2. Dal Yönetimi (Branching Strategy) ve PR Kuralları
1.  **`main` Dalı:** Her zaman çalışan, test edilmiş ve canlıya çıkmaya hazır kararlı sürümdür. Doğrudan bu dala commit atılması **yasaktır**.
2.  **`develop` Dalı:** Geliştirme sürecinin birleştiği ana daldır. Özellik dalları buraya bağlanır.
3.  **Özellik Dalları (`feature/`):** Her yeni görev veya endpoint için yeni bir dal açılmalıdır.
    * Örn: `feature/backend-auth`, `feature/product-link-generator`, `feature/frontend-dashboard`
4.  **Kod Gözden Geçirme (Pull Request - PR):** Bir özellik bittiğinde `develop` dalına PR açılır. Geliştiriciler birbirlerinin kodunu inceleyip onaylamadan (Approve) kod ana dala birleştirilemez.

---

## 4. Veritabanı Mimarisi ve Veri Modeli

### 4.1. İlişkisel Veritabanı Şeması (MSSQL)
Finansal tutarlılık, cüzdan bakiyeleri ve sipariş statüleri ACID prensiplerine uygun olarak MSSQL üzerinde tutulacaktır.

#### `Sellers` (Satıcılar) Tablosu
Satıcıların kurumsal ve bireysel kimlik bilgilerini içerir [cite: 10].
* `Id` (Guid, PK)
* `CompanyName` (Varchar)
* `TaxNumber` (Varchar, İsteğe bağlı)
* `IBAN` (Varchar)
* `PhoneNumber` (Varchar)
* `IsActive` (Bit)
* `CreatedAt` (DateTime)

#### `Wallets` (Cüzdanlar) ve İşlemler
Satıcı panelindeki "Toplam Satış", "Bekleyen Ödemeler" verilerini besleyen finansal kalptir [cite: 54, 64].
* `Id` (Guid, PK)
* `SellerId` (Guid, FK -> Sellers.Id)
* `AvailableBalance` (Decimal) - Çekilebilir net tutar.
* `PendingBalance` (Decimal) - Henüz kargoda olan veya onay bekleyen tutar [cite: 64].

#### `Orders` (Siparişler) Tablosu
Sistem üzerinden geçen siparişlerin lojistik ve finansal durumunu bağlar [cite: 58].
* `Id` (Guid, PK)
* `OrderNumber` (Varchar) - Örn: `#1052` [cite: 57]
* `SellerId` (Guid, FK -> Sellers.Id)
* `ProductId` (String) - MongoDB'deki ürünün Object_Id karşılığı.
* `CustomerName` (Varchar) - Örn: "Zeynep Yılmaz" [cite: 87]
* `CustomerAddress` (Varchar) [cite: 91]
* `CargoTrackingNumber` (Varchar) - Aras Kargo takip numarası [cite: 79]
* `TotalAmount` (Decimal) - Örn: 219,90 TL [cite: 60]
* `OrderStatus` (Enum: `PaymentReceived`, `Preparing`, `InCargo`, `Delivered`) [cite: 88]

#### Veritabanı Seviyesinde İş Kuralı (T-SQL Trigger Örneği)
Sipariş tamamlandığında satıcının cüzdan bakiyesini otomatik güncellemek ve kurumsal veritabanı mülakat yetkinliklerini karşılamak için yazılacak tetikleyici:
```sql
CREATE TRIGGER TR_UpdateWalletOnOrderDelivery
ON Orders
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    -- Sipariş durumu 'Delivered' (Teslim Edildi) olarak güncellendiyse
    IF UPDATE(OrderStatus)
    BEGIN
        UPDATE W
        SET 
            W.AvailableBalance = W.AvailableBalance + I.TotalAmount,
            W.PendingBalance = W.PendingBalance - I.TotalAmount
        FROM Wallets W
        INNER JOIN inserted I ON W.SellerId = I.SellerId
        INNER JOIN deleted D ON D.Id = I.Id
        WHERE I.OrderStatus = 4 AND D.OrderStatus <> 4; -- 4: Delivered
    END
END;
```

### 4.2. NoSQL Doküman Şeması (MongoDB - `Products` Koleksiyonu)
Ürün bilgileri, fotoğraflar ve dinamik pazar yeri nitelikleri esneklik açısından MongoDB üzerinde saklanacaktır [cite: 31, 39].
```json
{
  "_id": "6643bf2a3f12a456b89c1021",
  "SellerId": "d3b07384-d113-4956-a55e-214545645645",
  "Title": "Pamuklu T-Shirt",
  "Description": "%100 pamuklu, unisex t-shirt.",
  "Price": 199.90,
  "Stock": 50,
  "Images": [
    "https://cdn.arasisletmem.com/images/tshirt1.jpg"
  ],
  "Slug": "pamuklu-t-shirt-u102",
  "SharedLink": "https://arasisletmem.link/pamuklu-t-shirt-u102",
  "IsActive": true,
  "CreatedAt": "2026-05-16T12:00:00Z"
}
```

---

## 5. RESTful API Endpoint Tasarımı ve Sözleşmeleri (React Entegrasyonu İçin)
React frontend geliştiricisi (arkadaşın) ile backend arasındaki iletişimi Swaggger (OpenAPI) dokümantasyonu sağlayacaktır. Temel endpoint sözleşmeleri şu şekildedir:

### 5.1. Ürün Yönetimi Servisi
* **`POST /api/products`**
    * *Açıklama:* Satıcı panele yeni ürün ekler, sistem otomatik benzersiz `SharedLink` üretir [cite: 22, 39].
    * *Payload:* `{ title, description, price, stock, images }`
    * *Response:* `201 Created` -> `{ id, slug, sharedLink }`
* **`GET /api/products/link/{slug}`**
    * *Açıklama:* Müşterinin satın alma linkine tıkladığında ürünü görüntülemesini sağlar.

### 5.2. Sipariş ve Lojistik Servisi
* **`POST /api/orders`**
    * *Açıklama:* Müşteri link üzerinden adresi girip ödemeyi tamamladığında çağrılır [cite: 22, 88].
    * *Payload:* `{ productId, customerName, customerAddress, amount }`
    * *Response:* `202 Accepted` -> `{ orderNumber, status: "PaymentReceived" }` [cite: 57, 88]
* **`POST /api/orders/{orderId}/call-courier`**
    * *Açıklama:* Satıcının arayüzden "Kurye Çağır / Kargo Talebi Oluştur" butonuna basmasıyla tetiklenir [cite: 89, 90].
    * *Response:* `200 OK` -> `{ message: "Kurye talebi alındı. Aras Kargo kapınızdan alacaktır." }` [cite: 80]

### 5.3. Dashboard Analitik Servisi
* **`GET /api/seller/dashboard`**
    * *Açıklama:* Satıcı ana sayfasındaki tüm sayaçları ve grafikleri besler [cite: 15].
    * *Response:* `200 OK`
    ```json
    {
      "totalSales": 12650.00,
      "totalOrdersCount": 24,
      "pendingPaymentsCount": 3,
      "cargoRequestedCount": 7,
      "recentOrders": [
        { "orderNumber": "#1052", "customer": "Zeynep Yılmaz", "amount": 219.00, "date": "2026-05-21", "status": "PaymentReceived" },
        { "orderNumber": "#1051", "customer": "Ahmet K.", "amount": 158.90, "date": "2026-05-21", "status": "InCargo" }
      ]
    }
    ```

---

## 6. Asenkron Mesajlaşma Mimarisi (RabbitMQ Entegrasyonu)
Sipariş anında Aras Kargo entegrasyon servisinin yavaşlamaması veya Black Friday gibi yoğun dönemlerde sistemin kilitlenmemesi için asenkron kuyruk yapısı kurgulanmıştır.

1.  **Olay Tetiklenme (Publisher):** Müşteri ürünü satın alıp `POST /api/orders` endpoint'i başarılı döndüğünde, .NET Core tarafı RabbitMQ üzerindeki `order.exchange` yapısına bir `OrderPlacedEvent` mesajı fırlatır.
2.  **Kuyruk Yapısı (Queue):** Mesaj `kargo.entegrasyon.queue` isimli kuyruğa düşer.
3.  **Tüketici Servis (Consumer):** Arka planda çalışan bağımsız bir .NET BackgroundService (Worker), bu kuyruğu sürekli dinler. Mesaj geldikçe Aras Kargo servis simülasyonuna istek atarak barkod, kargo takip numarası oluşturur ve satıcı paneline kargo bildirimi düşer [cite: 56, 79].

---

## 7. Geliştiriciler İçin Lokal Kurulum (Docker Compose)
Backend ve frontend geliştiricilerinin bilgisayarlarında MSSQL veya MongoDB'nin kurulu olmasına gerek kalmadan, projeyi ayağa kaldırmalarını sağlayacak `docker-compose.yml` içeriği:

```yaml
version: '3.8'

services:
  aras-mssql:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: aras_isletmem_mssql
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=SecurePassword123!
    ports:
      - "1433:1433"

  aras-mongodb:
    image: mongo:latest
    container_name: aras_isletmem_mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  aras-rabbitmq:
    image: rabbitmq:3-management
    container_name: aras_isletmem_rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672" # RabbitMQ Yönetim Paneli arayüzü

volumes:
  mongo_data:
