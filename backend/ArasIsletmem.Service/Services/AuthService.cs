using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.Services;
using ArasIsletmem.Core.UnitOfWorks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ArasIsletmem.Service.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<Customer> _customerRepository;
    private readonly IRepository<Seller> _sellerRepository;
    private readonly IRepository<Wallet> _walletRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthService(
        IRepository<Customer> customerRepository,
        IRepository<Seller> sellerRepository,
        IRepository<Wallet> walletRepository,
        IUnitOfWork unitOfWork,
        IConfiguration configuration)
    {
        _customerRepository = customerRepository;
        _sellerRepository = sellerRepository;
        _walletRepository = walletRepository;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    #region Customer Auth

    public async Task<string> RegisterAsync(UserRegisterDto registerDto)
    {
        // Email kontrolü
        var existingCustomers = await _customerRepository.GetAllAsync();
        foreach (var c in existingCustomers)
        {
            if (c.Email.Equals(registerDto.Email, StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception("Bu e-posta adresi zaten kullanımda.");
            }
        }

        using var hmac = new HMACSHA512();
        var customer = new Customer
        {
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Email = registerDto.Email,
            PhoneNumber = registerDto.PhoneNumber,
            Address = registerDto.Address,
            City = registerDto.City,
            District = registerDto.District,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
            PasswordSalt = hmac.Key
        };

        await _customerRepository.AddAsync(customer);
        await _unitOfWork.CommitAsync();

        return CreateToken(customer);
    }

    public async Task<string> LoginAsync(UserLoginDto loginDto)
    {
        var customers = await _customerRepository.GetAllAsync();
        Customer? customer = null;
        foreach (var c in customers)
        {
            if (c.Email.Equals(loginDto.Email, StringComparison.OrdinalIgnoreCase))
            {
                customer = c;
                break;
            }
        }

        if (customer == null)
        {
            throw new Exception("Kullanıcı bulunamadı.");
        }

        if (!VerifyPasswordHash(loginDto.Password, customer.PasswordHash, customer.PasswordSalt))
        {
            throw new Exception("Hatalı şifre.");
        }

        return CreateToken(customer);
    }

    #endregion

    #region Seller Auth

    public async Task<string> RegisterSellerAsync(SellerRegisterDto registerDto)
    {
        // Email kontrolü
        var existingSellers = await _sellerRepository.GetAllAsync();
        foreach (var s in existingSellers)
        {
            if (s.Email.Equals(registerDto.Email, StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception("Bu e-posta adresi zaten kullanımda.");
            }
        }

        using var hmac = new HMACSHA512();
        var seller = new Seller
        {
            CompanyName = registerDto.CompanyName,
            Email = registerDto.Email,
            PhoneNumber = registerDto.PhoneNumber,
            TaxNumber = registerDto.TaxNumber,
            IBAN = registerDto.IBAN,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
            PasswordSalt = hmac.Key
        };

        await _sellerRepository.AddAsync(seller);
        await _unitOfWork.CommitAsync();

        // Satıcıya otomatik cüzdan oluşturma
        var wallet = new Wallet
        {
            SellerId = seller.Id,
            AvailableBalance = 0,
            PendingBalance = 0
        };
        await _walletRepository.AddAsync(wallet);
        await _unitOfWork.CommitAsync();

        return CreateToken(seller);
    }

    public async Task<string> LoginSellerAsync(UserLoginDto loginDto)
    {
        var sellers = await _sellerRepository.GetAllAsync();
        Seller? seller = null;
        foreach (var s in sellers)
        {
            if (s.Email.Equals(loginDto.Email, StringComparison.OrdinalIgnoreCase))
            {
                seller = s;
                break;
            }
        }

        if (seller == null)
        {
            throw new Exception("Satıcı bulunamadı.");
        }

        if (!VerifyPasswordHash(loginDto.Password, seller.PasswordHash, seller.PasswordSalt))
        {
            throw new Exception("Hatalı şifre.");
        }

        return CreateToken(seller);
    }

    #endregion

    #region Helper Methods

    private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
    {
        using var hmac = new HMACSHA512(passwordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        for (int i = 0; i < computedHash.Length; i++)
        {
            if (computedHash[i] != passwordHash[i]) return false;
        }
        return true;
    }

    private string CreateToken(Customer customer)
    {
        var role = customer.Email.Equals("admin@arasisletmem.com", StringComparison.OrdinalIgnoreCase) ? "Admin" : "Customer";
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, customer.Id.ToString()),
            new Claim(ClaimTypes.Email, customer.Email),
            new Claim(ClaimTypes.Name, $"{customer.FirstName} {customer.LastName}"),
            new Claim(ClaimTypes.Role, role)
        };

        return GenerateJwtToken(claims);
    }

    private string CreateToken(Seller seller)
    {
        var role = seller.Email.Equals("admin@arasisletmem.com", StringComparison.OrdinalIgnoreCase) ? "Admin" : "Seller";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, seller.Id.ToString()),
            new Claim(ClaimTypes.Email, seller.Email),
            new Claim(ClaimTypes.Name, seller.CompanyName),
            new Claim(ClaimTypes.Role, role)
        };

        return GenerateJwtToken(claims);
    }

    private string GenerateJwtToken(Claim[] claims)
    {
        var jwtSection = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"] ?? "ThisIsAVerySecretKeyForArasKargoECommerceProject2026AndShouldBeAtLeast64BytesLongToAvoidHmacSha512Exceptions!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSection["DurationInMinutes"] ?? "60")),
            SigningCredentials = creds,
            Issuer = jwtSection["Issuer"] ?? "ArasIsletmemAPI",
            Audience = jwtSection["Audience"] ?? "ArasIsletmemClient"
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    #endregion
}
