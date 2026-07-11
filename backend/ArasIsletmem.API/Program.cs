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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger JWT Config
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Aras Isletmem API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            System.Array.Empty<string>()
        }
    });
});

// JWT Authentication Configuration
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = System.Text.Encoding.UTF8.GetBytes(jwtSection["Key"] ?? "ThisIsAVerySecretKeyForArasKargoECommerceProject2026AndShouldBeAtLeast64BytesLongToAvoidHmacSha512Exceptions!");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSection["Issuer"] ?? "ArasIsletmemAPI",
        ValidateAudience = true,
        ValidAudience = jwtSection["Audience"] ?? "ArasIsletmemClient",
        ValidateLifetime = true,
        ClockSkew = System.TimeSpan.Zero
    };
});

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
    options.CategoriesCollectionName = "Categories";
    options.BrandsCollectionName = "Brands";
});

// Dependency Injections
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Mongo Product Reposu
builder.Services.AddScoped<IMongoRepository<ArasIsletmem.Core.Entities.Product>>(provider => {
    var settings = provider.GetRequiredService<Microsoft.Extensions.Options.IOptions<MongoDbSettings>>();
    return new MongoRepository<ArasIsletmem.Core.Entities.Product>(settings, settings.Value.ProductsCollectionName);
});

// Mongo Category Reposu
builder.Services.AddScoped<IMongoRepository<ArasIsletmem.Core.Entities.Category>>(provider => {
    var settings = provider.GetRequiredService<Microsoft.Extensions.Options.IOptions<MongoDbSettings>>();
    return new MongoRepository<ArasIsletmem.Core.Entities.Category>(settings, settings.Value.CategoriesCollectionName);
});

// Mongo Brand Reposu
builder.Services.AddScoped<IMongoRepository<ArasIsletmem.Core.Entities.Brand>>(provider => {
    var settings = provider.GetRequiredService<Microsoft.Extensions.Options.IOptions<MongoDbSettings>>();
    return new MongoRepository<ArasIsletmem.Core.Entities.Brand>(settings, settings.Value.BrandsCollectionName);
});

// Mongo Basket Reposu
builder.Services.AddScoped<IMongoRepository<ArasIsletmem.Core.Entities.Basket>>(provider => {
    var settings = provider.GetRequiredService<Microsoft.Extensions.Options.IOptions<MongoDbSettings>>();
    return new MongoRepository<ArasIsletmem.Core.Entities.Basket>(settings, "Baskets");
});

builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IBrandService, BrandService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBasketService, BasketService>();
builder.Services.AddSingleton<IRabbitMqPublisher, RabbitMqPublisher>();
builder.Services.AddHostedService<CargoConsumerWorker>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Yönlendirmede POST body'si kaybolmasın diye dev ortamında kapattık
app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Yabancı Anahtar (Foreign Key) hatası almamak için sahte (mock) satıcıyı veritabanına ekliyoruz.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var mockSellerId = Guid.Parse("d3b07384-d113-4956-a55e-214545645645");
    if (!dbContext.Sellers.Any(s => s.Id == mockSellerId))
    {
        using var hmac = new System.Security.Cryptography.HMACSHA512();
        var seller = new ArasIsletmem.Core.Entities.Seller
        {
            Id = mockSellerId,
            CompanyName = "Test Satıcısı",
            TaxNumber = "1112223334",
            PhoneNumber = "05554443322",
            IBAN = "TR123456789",
            Email = "seller@arasisletmem.com",
            PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes("123456")),
            PasswordSalt = hmac.Key
        };
        dbContext.Sellers.Add(seller);

        dbContext.Wallets.Add(new ArasIsletmem.Core.Entities.Wallet
        {
            SellerId = mockSellerId,
            AvailableBalance = 1500.00m,
            PendingBalance = 350.00m
        });
    }

    var mockCustomerId = Guid.Parse("a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d");
    if (!dbContext.Customers.Any(c => c.Id == mockCustomerId))
    {
        using var hmac = new System.Security.Cryptography.HMACSHA512();
        dbContext.Customers.Add(new ArasIsletmem.Core.Entities.Customer
        {
            Id = mockCustomerId,
            FirstName = "Ali",
            LastName = "Yılmaz",
            Email = "ali.yilmaz@example.com",
            PhoneNumber = "05321112233",
            Address = "Örnek Mah. Test Sok. No:1",
            City = "İstanbul",
            District = "Kadıköy",
            PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes("123456")),
            PasswordSalt = hmac.Key
        });
    }
    dbContext.SaveChanges();

    // MongoDB Category Seeding
    var categoryRepo = scope.ServiceProvider.GetRequiredService<IMongoRepository<ArasIsletmem.Core.Entities.Category>>();
    var allCategories = categoryRepo.GetAllAsync().GetAwaiter().GetResult();
    if (allCategories == null || !System.Linq.Enumerable.Any(allCategories))
    {
        var seedCategories = new List<string> { "Kadın", "Erkek", "Ev & Yaşam", "Kozmetik", "Elektronik", "Spor & Outdoor", "Hobi & Oyuncak", "Kitap & Kırtasiye", "Fırsatlar" };
        foreach (var catName in seedCategories)
        {
            var slug = catName.ToLowerInvariant()
                .Replace("ş", "s")
                .Replace("ç", "c")
                .Replace("ö", "o")
                .Replace("ğ", "g")
                .Replace("ü", "u")
                .Replace("ı", "i")
                .Replace(" ", "-")
                .Replace("&", "ve");
            categoryRepo.AddAsync(new ArasIsletmem.Core.Entities.Category
            {
                Name = catName,
                Slug = slug,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }).GetAwaiter().GetResult();
        }
    }

    // MongoDB Product Seeding
    var productRepo = scope.ServiceProvider.GetRequiredService<IMongoRepository<ArasIsletmem.Core.Entities.Product>>();
    var allProducts = productRepo.GetAllAsync().GetAwaiter().GetResult();
    if (allProducts == null || !System.Linq.Enumerable.Any(allProducts))
    {
        var categoryList = categoryRepo.GetAllAsync().GetAwaiter().GetResult();
        
        var seedProducts = new List<dynamic>
        {
            new { Title = "El Yapımı Seramik Kupa", Category = "Ev & Yaşam", Price = 249.90m, Stock = 132, Image = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600", Desc = "Tuğçe'nin El Ürünleri tasarımı. Özel killi seramik çamurundan üretilmiş, gıdaya uygun el yapımı seramik kupa." },
            new { Title = "Doğal Soya Mum - Lavanta Kokulu", Category = "Ev & Yaşam", Price = 129.90m, Stock = 74, Image = "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600", Desc = "Soya fasulyesi yağından üretilmiş, el yapımı %100 doğal soya mumu. Lavanta ve vanilya esanslı dinlendirici terapi mumu." },
            new { Title = "Minimalist Beton Saksı & Sukulent", Category = "Ev & Yaşam", Price = 199.90m, Stock = 45, Image = "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600", Desc = "Naturel beton saksı içerisinde canlı ve sağlıklı sukulent bitkisi ile birlikte teslim edilir." },
            new { Title = "Kablosuz Gürültü Engelleyici Kulaklık", Category = "Elektronik", Price = 1899.90m, Stock = 25, Image = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", Desc = "Aktif gürültü engelleme (ANC) özellikli, 40 saate kadar çalma süresi sunan konforlu Bluetooth kulaklık." },
            new { Title = "Erkek Pamuklu Oversize T-Shirt", Category = "Erkek", Price = 349.90m, Stock = 85, Image = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600", Desc = "%100 organik pamuk ipliğinden üretilmiş, rahat kalıp günlük kullanıma uygun siyah oversize t-shirt." },
            new { Title = "Kadın Deri Omuz Çantası", Category = "Kadın", Price = 899.90m, Stock = 15, Image = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600", Desc = "Birinci sınıf hakiki deriden el işçiliğiyle üretilmiş şık ve kullanışlı kadın omuz çantası." },
            new { Title = "Doğal Yüz Temizleme Yağı ve Serumu", Category = "Kozmetik", Price = 299.90m, Stock = 50, Image = "https://images.unsplash.com/photo-1608248597481-496100c80836?w=600", Desc = "Cildi kurutmadan temizleyen, sebum dengesini düzenleyen %100 soğuk sıkım bitkisel temizleme serumu." },
            new { Title = "Deri Kapaklı Çizgili Defter", Category = "Kitap & Kırtasiye", Price = 159.90m, Stock = 110, Image = "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600", Desc = "Retro tarzı el yapımı dikişli, kaliteli kalın kraft kağıtlı deri kapaklı çizgili günlük defteri." },
            new { Title = "Taşınabilir Yoga Matı (6mm)", Category = "Spor & Outdoor", Price = 449.90m, Stock = 30, Image = "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600", Desc = "Kaymaz TPE malzemeden üretilmiş, taşıma askısı dahil 6mm kalınlığında profesyonel yoga ve pilates matı." },
            new { Title = "Ahşap Eğitici Çocuk Yapbozu", Category = "Hobi & Oyuncak", Price = 189.90m, Stock = 60, Image = "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600", Desc = "Kayın ağacından el yapımı, toksik olmayan su bazlı boyalarla renklendirilmiş eğitici hayvan yapboz seti." }
        };

        var random = new Random();
        foreach (var p in seedProducts)
        {
            var matchedCat = System.Linq.Enumerable.FirstOrDefault(categoryList, c => c.Name == (string)p.Category);
            
            var title = (string)p.Title;
            var cleanTitle = title.ToLowerInvariant()
                .Replace("ş", "s")
                .Replace("ç", "c")
                .Replace("ö", "o")
                .Replace("ğ", "g")
                .Replace("ü", "u")
                .Replace("ı", "i");
            cleanTitle = System.Text.RegularExpressions.Regex.Replace(cleanTitle, @"[^a-z0-9\s-]", "");
            cleanTitle = System.Text.RegularExpressions.Regex.Replace(cleanTitle, @"\s+", " ").Trim();
            var slug = $"{cleanTitle.Replace(" ", "-")}-{random.Next(100, 999)}";

            var prod = new ArasIsletmem.Core.Entities.Product
            {
                Title = title,
                Description = (string)p.Desc,
                Price = (decimal)p.Price,
                Stock = (int)p.Stock,
                Images = new List<string> { (string)p.Image },
                CoverImage = (string)p.Image,
                CategoryId = matchedCat?.Id ?? string.Empty,
                CategoryName = matchedCat?.Name ?? "Genel",
                Slug = slug,
                SellerId = "seller@arasisletmem.com",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            productRepo.AddAsync(prod).GetAwaiter().GetResult();
        }
    }
}

app.Run();
