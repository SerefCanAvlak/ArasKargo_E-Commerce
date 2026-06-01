namespace ArasIsletmem.Core.DTOs;

public class CategoryDto
{
    public string Name { get; set; } = string.Empty;

    public string? ParentCategoryId { get; set; } // Opsiyonel hiyerarşik yapı için
}
