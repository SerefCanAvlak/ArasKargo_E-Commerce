using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArasIsletmem.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderDeliveryTrigger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TRIGGER TR_UpdateWalletOnOrderDelivery
                ON Orders
                AFTER UPDATE
                AS
                BEGIN
                    SET NOCOUNT ON;
                    IF UPDATE(OrderStatus)
                    BEGIN
                        UPDATE w
                        SET w.PendingBalance = w.PendingBalance - i.TotalAmount,
                            w.AvailableBalance = w.AvailableBalance + i.TotalAmount
                        FROM Wallets w
                        INNER JOIN inserted i ON w.SellerId = i.SellerId
                        INNER JOIN deleted d ON i.Id = d.Id
                        WHERE i.OrderStatus = 4 AND d.OrderStatus <> 4;
                    END
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TRIGGER TR_UpdateWalletOnOrderDelivery;");
        }
    }
}
