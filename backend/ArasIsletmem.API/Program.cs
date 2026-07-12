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
using ArasIsletmem.Service.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddSignalR();

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
app.MapHub<DashboardHub>("/hub/dashboard");

app.Run();
