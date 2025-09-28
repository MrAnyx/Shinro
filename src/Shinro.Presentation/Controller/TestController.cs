using Microsoft.AspNetCore.Mvc;
using Shinro.Application.Contract.Persistence;
using Shinro.Application.Contract.Persistence.Repository;
using Shinro.Domain.Entity;
using System.Threading.Tasks;

namespace Shinro.Presentation.Controller;

[ApiController]
[Route("[controller]")]
public class TestController(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<int>> GetTest()
    {
        var user = new User()
        {
            Email = "example@mail.com",
            Username = "John Doe",
            Password = "Password"
        };

        userRepository.Add(user);
        await unitOfWork.SaveChangesAsync();

        var users = await userRepository.GetAllAsync();

        return Ok(users);
    }
}
