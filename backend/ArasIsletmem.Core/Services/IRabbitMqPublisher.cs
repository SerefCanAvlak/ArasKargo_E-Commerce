namespace ArasIsletmem.Core.Services;

public interface IRabbitMqPublisher
{
    void PublishOrderMessage(string orderNumber, string cargoTrackingNumber);
}
