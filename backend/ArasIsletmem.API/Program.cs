using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.Services;
using ArasIsletmem.Core.Settings;
using ArasIsletmem.Core.UnitOfWorks;
using ArasIsletmem.Data.Contexts;
using ArasIsletmem.Data.Repositories;
using ArasIsletmem.Data.UnitOfWorks;
using ArasIsletmem.Service.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// MSSQL
builder.Services.AddDbContext<AppDbContext>(options =>
{
    // Docker Compose dosyasındaki şifreye ve porta göre ayarladık
    options.UseSqlServer("Server=localhost,1433;Database=ArasIsletmemDb;User Id=sa;Password=SecurePassword123!;TrustServerCertificate=True;");
});

// MongoDB settings mapping
builder.Services.Configure<MongoDbSettings>(options =>
{
    options.ConnectionString = "mongodb://localhost:27017";
    options.DatabaseName = "ArasIsletmemMongoDb";
    options.ProductsCollectionName = "Products";
});

// Dependency Injections
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Mongo Product Reposu
builder.Services.AddScoped<IMongoRepository<ArasIsletmem.Core.Entities.Product>>(provider => {
    var settings = provider.GetRequiredService<Microsoft.Extensions.Options.IOptions<MongoDbSettings>>();
    return new MongoRepository<ArasIsletmem.Core.Entities.Product>(settings, "Products");
});

builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddSingleton<IRabbitMqPublisher, RabbitMqPublisher>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Yönlendirmede POST body'si kaybolmasın diye dev ortamında kapattık
app.UseAuthorization();
app.MapControllers();

// Yabancı Anahtar (Foreign Key) hatası almamak için sahte (mock) satıcıyı veritabanına ekliyoruz.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var mockSellerId = Guid.Parse("d3b07384-d113-4956-a55e-214545645645");
    if (!dbContext.Sellers.Any(s => s.Id == mockSellerId))
    {
        dbContext.Sellers.Add(new ArasIsletmem.Core.Entities.Seller
        {
            Id = mockSellerId,
            CompanyName = "Test Satıcısı",
            TaxNumber = "1112223334",
            PhoneNumber = "05554443322",
            IBAN = "TR123456789"
        });
        dbContext.SaveChanges();
    }
}

app.Run();
