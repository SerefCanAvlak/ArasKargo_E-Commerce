# Aras İşletmem Backend Mimarisi (Demo)

Bu proje "Aras İşletmem" adlı e-ticaret ve lojistik entegrasyon platformunun backend (API) mimarisini içermektedir. Proje, kurumsal **Clean Architecture** (Katmanlı Mimari) tasarım kalıplarına uygun olarak ve **UnitOfWork/Repository** pattern'leri kullanılarak kodlanmıştır.

## Teknolojiler (Tech Stack)
* **Framework:** .NET 8.0 Web API (C#)
* **İlişkisel Veritabanı (RDBMS):** MSSQL & EF Core (Kullanıcı, Cüzdan ve Sipariş - Finansal veriler)
* **NoSQL Veritabanı:** MongoDB (Ürün kataloğu ve meta veriler)
* **Mesajlaşma Kuyruğu:** RabbitMQ (Siparişte kargo takip numarası fırlatmak için asenkron entegrasyon)

## Lokal Ortamda Ayağa Kaldırma (Kurulum)

Proje veritabanlarını bilgisayarınıza yerel olarak kurmanıza gerek yoktur. Proje kök dizinindeki `docker-compose.yml` sayesinde tüm servisler tek tıkla çalıştırılabilir.

### Adım 1: Veritabanlarını Çalıştırma
Bilgisayarınızda Docker uygulamasının açık olduğundan emin olun ve projenin ana dizininde terminali açarak şu komutu girin:
```bash
docker-compose up -d
```
*(Bu komut MSSQL, MongoDB ve RabbitMQ sunucularını otomatik indirip çalıştıracaktır.)*

### Adım 2: API'yi Çalıştırma
Veritabanları ayağa kalktıktan sonra API projesinin içine girerek `.NET` sunucusunu başlatın:
```bash
cd backend\ArasIsletmem.API
dotnet run
```

### Adım 3: Test Etme (Swagger)
Uygulama çalıştıktan sonra tarayıcınızdan konsolda beliren Swagger adresine gidin (Örn: `http://localhost:5086/swagger`).
Buradaki uç noktalar üzerinden yeni ürünler ekleyebilir ve o ürünlerle RabbitMQ'yu test edecek siparişler oluşturabilirsiniz.
