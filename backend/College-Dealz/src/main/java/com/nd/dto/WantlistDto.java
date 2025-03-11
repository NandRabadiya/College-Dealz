package com.nd.dto;

import com.nd.enums.Category;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class WantlistDto {

    private Integer id; // Unique identifier for the wantlist

    @NotNull(message = "User ID cannot be null")
    private Integer userId; // User's ID, instead of embedding the entire User object

    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String productName; // Desired product name (can be used for partial matching)

    private Category category; // Desired category of the product

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description; // Additional description for the product requirements

    private Integer priceMin; // Minimum price for the product

    private Integer priceMax; // Maximum price for the product

    private Integer monthsOldMax; // Maximum months old for the product

    private Instant updatedAt;
}
