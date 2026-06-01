using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Enums;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.UnitOfWorks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace ArasIsletmem.Service.Services;

/// <summary>
/// RabbitMQ kuyruğunu dinleyen arka plan servisi.
/// Sipariş oluşturulduğunda kuyruğa düşen mesajı alır,
/// Aras Kargo entegrasyonunu simüle eder ve kargo takip numarası üretir.
/// </summary>
public class CargoConsumerWorker : BackgroundService
{
    private readonly ILogger<CargoConsumerWorker> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private IConnection? _connection;
    private IModel? _channel;

    private const string QueueName = "kargo.entegrasyon.queue";

    public CargoConsumerWorker(ILogger<CargoConsumerWorker> logger, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    public override Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("🐰 Kargo Consumer başlatıldı, kuyruk dinleniyor: {QueueName}", QueueName);
        InitializeRabbitMq();
        return base.StartAsync(cancellationToken);
    }

    private void InitializeRabbitMq()
    {
        var factory = new ConnectionFactory()
        {
            HostName = "localhost",
            DispatchConsumersAsync = true
        };

        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        _channel.QueueDeclare(queue: QueueName,
                              durable: true,
                              exclusive: false,
                              autoDelete: false,
                              arguments: null);

        // Aynı anda en fazla 1 mesaj işle (fair dispatch)
        _channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        stoppingToken.ThrowIfCancellationRequested();

        var consumer = new AsyncEventingBasicConsumer(_channel);

        consumer.Received += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var messageJson = Encoding.UTF8.GetString(body);

            _logger.LogInformation("📩 Kuyruktan mesaj alındı: {Message}", messageJson);

            try
            {
                var orderEvent = JsonSerializer.Deserialize<OrderPlacedEvent>(messageJson);

                if (orderEvent == null || orderEvent.OrderId == Guid.Empty)
                {
                    _logger.LogWarning("⚠️ Geçersiz mesaj formatı, atlanıyor.");
                    _channel!.BasicAck(ea.DeliveryTag, false);
                    return;
                }

                // 🚚 Aras Kargo entegrasyonunu simüle et (1-3 saniye bekleme)
                var simulationDelay = new Random().Next(1000, 3000);
                _logger.LogInformation("🔄 Aras Kargo entegrasyonu simüle ediliyor... ({Delay}ms)", simulationDelay);
                await Task.Delay(simulationDelay, stoppingToken);

                // Kargo takip numarası üret
                var cargoTrackingNumber = $"ARAS-{Guid.NewGuid().ToString("N")[..10].ToUpper()}";

                // Scoped servislerle siparişi güncelle
                using (var scope = _scopeFactory.CreateScope())
                {
                    var orderRepository = scope.ServiceProvider.GetRequiredService<IRepository<Order>>();
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                    var order = await orderRepository.GetByIdAsync(orderEvent.OrderId);

                    if (order != null)
                    {
                        order.CargoTrackingNumber = cargoTrackingNumber;
                        order.OrderStatus = OrderStatus.Preparing;
                        orderRepository.Update(order);
                        await unitOfWork.CommitAsync();

                        _logger.LogInformation(
                            "📦 Sipariş {OrderNumber} için kargo kodu üretildi: {TrackingNumber}",
                            orderEvent.OrderNumber,
                            cargoTrackingNumber);
                    }
                    else
                    {
                        _logger.LogWarning("⚠️ Sipariş bulunamadı: {OrderId}", orderEvent.OrderId);
                    }
                }

                // Mesajı başarıyla işlendi olarak işaretle
                _channel!.BasicAck(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Mesaj işlenirken hata oluştu.");
                // Mesajı tekrar kuyruğa koy (requeue)
                _channel!.BasicNack(ea.DeliveryTag, false, true);
            }
        };

        _channel.BasicConsume(queue: QueueName, autoAck: false, consumer: consumer);

        return Task.CompletedTask;
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("🛑 Kargo Consumer durduruluyor...");
        _channel?.Close();
        _connection?.Close();
        return base.StopAsync(cancellationToken);
    }

    public override void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
        base.Dispose();
    }

    /// <summary>
    /// RabbitMQ kuyruğundaki mesaj formatı
    /// </summary>
    private class OrderPlacedEvent
    {
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
    }
}
