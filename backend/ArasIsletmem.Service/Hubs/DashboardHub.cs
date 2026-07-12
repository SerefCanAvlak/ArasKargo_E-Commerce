using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace ArasIsletmem.Service.Hubs;

public class DashboardHub : Hub
{
    public async Task JoinSellerGroup(string sellerId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, sellerId);
    }
}
