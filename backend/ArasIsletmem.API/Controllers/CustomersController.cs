using System;
using System.Threading.Tasks;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.UnitOfWorks;
using Microsoft.AspNetCore.Mvc;

namespace ArasIsletmem.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CustomersController : ControllerBase
{
    private readonly IRepository<Customer> _customerRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CustomersController(IRepository<Customer> customerRepository, IUnitOfWork unitOfWork)
    {
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var customers = await _customerRepository.GetAllAsync();
        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

}
