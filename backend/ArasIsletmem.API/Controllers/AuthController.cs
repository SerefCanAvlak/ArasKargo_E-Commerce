using System;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace ArasIsletmem.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    #region Customer Endpoints

    [HttpPost("customer/register")]
    public async Task<IActionResult> RegisterCustomer(UserRegisterDto registerDto)
    {
        try
        {
            var token = await _authService.RegisterAsync(registerDto);
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("customer/login")]
    public async Task<IActionResult> LoginCustomer(UserLoginDto loginDto)
    {
        try
        {
            var token = await _authService.LoginAsync(loginDto);
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Seller Endpoints

    [HttpPost("seller/register")]
    public async Task<IActionResult> RegisterSeller(SellerRegisterDto registerDto)
    {
        try
        {
            var token = await _authService.RegisterSellerAsync(registerDto);
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("seller/login")]
    public async Task<IActionResult> LoginSeller(UserLoginDto loginDto)
    {
        try
        {
            var token = await _authService.LoginSellerAsync(loginDto);
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion
}
