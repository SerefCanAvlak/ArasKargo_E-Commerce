using System.Text;
using System.Text.Json;
using ArasIsletmem.Core.Services;
using RabbitMQ.Client;

namespace ArasIsletmem.Service.Services;

public class RabbitMqPublisher : IRabbitMqPublisher
{
    public void PublishOrderPlacedEvent(Guid orderId, string orderNumber)
    {
        var factory = new ConnectionFactory() { HostName = "localhost" };
        using var connection = factory.CreateConnection();
        using var channel = connection.CreateModel();

        channel.QueueDeclare(queue: "kargo.entegrasyon.queue",
                             durable: true,
                             exclusive: false,
                             autoDelete: false,
                             arguments: null);

        var message = new { OrderId = orderId, OrderNumber = orderNumber };
        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

        var properties = channel.CreateBasicProperties();
        properties.Persistent = true; // Mesajı kalıcı yap

        channel.BasicPublish(exchange: "",
                             routingKey: "kargo.entegrasyon.queue",
                             basicProperties: properties,
                             body: body);
    }
}
