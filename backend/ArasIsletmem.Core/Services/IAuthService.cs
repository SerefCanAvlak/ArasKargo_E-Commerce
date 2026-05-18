using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;

namespace ArasIsletmem.Core.Services;

public interface IAuthService
{
    Task<string> RegisterAsync(UserRegisterDto registerDto);
    Task<string> LoginAsync(UserLoginDto loginDto);
    Task<string> RegisterSellerAsync(SellerRegisterDto registerDto);
    Task<string> LoginSellerAsync(UserLoginDto loginDto);
}
