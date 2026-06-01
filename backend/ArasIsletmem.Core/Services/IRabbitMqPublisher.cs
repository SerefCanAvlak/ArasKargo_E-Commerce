namespace ArasIsletmem.Core.Services;

public interface IRabbitMqPublisher
{
    void PublishOrderPlacedEvent(Guid orderId, string orderNumber);
}
