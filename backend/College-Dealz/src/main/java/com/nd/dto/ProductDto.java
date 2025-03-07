package com.nd.dto;

import com.nd.entities.Chat;
import com.nd.enums.Category;
import com.nd.enums.Condition;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
public class ProductDto {

    private Integer id;

    @NotNull(message = "Name cannot be null")
    @Size(max = 255, message = "Name cannot exceed 255 characters")
    private String name;

    @Size(max = 65535, message = "Description length is too long")
    private String description;

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price must have at most 10 digits and 2 decimal places")
    private BigDecimal price;

    @NotNull(message = "Condition cannot be null")
    private Condition condition;

    @NotNull(message = "Category cannot be null")
    private Category category;

    @Min(value = 0, message = "Months old cannot be negative")
    private Integer monthsOld;

   // @NotNull(message = "Seller ID cannot be null")
    private Integer sellerId; // Referencing seller by ID

    //@NotNull(message = "University ID cannot be null")
    private Integer universityId; // Referencing university by ID

    private String sellerName;

    private Instant postDate;

    private Chat chat;

    private List<MultipartFile> images;

    private List<Integer> removeImageIds;

    private List<String> imageUrls;


}
