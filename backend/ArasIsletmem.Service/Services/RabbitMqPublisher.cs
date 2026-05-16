using System.Text;
using System.Text.Json;
using ArasIsletmem.Core.Services;
using RabbitMQ.Client;

namespace ArasIsletmem.Service.Services;

public class RabbitMqPublisher : IRabbitMqPublisher
{
    public void PublishOrderMessage(string orderNumber, string cargoTrackingNumber)
    {
        var factory = new ConnectionFactory() { HostName = "localhost" };
        using var connection = factory.CreateConnection();
        using var channel = connection.CreateModel();

        channel.QueueDeclare(queue: "kargo.entegrasyon.queue",
                             durable: false,
                             exclusive: false,
                             autoDelete: false,
                             arguments: null);

        var message = new { OrderNumber = orderNumber, CargoTrackingNumber = cargoTrackingNumber };
        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

        channel.BasicPublish(exchange: "",
                             routingKey: "kargo.entegrasyon.queue",
                             basicProperties: null,
                             body: body);
    }
}
