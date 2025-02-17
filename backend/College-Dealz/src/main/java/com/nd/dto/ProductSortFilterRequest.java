package com.nd.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductSortFilterRequest {
    // Optional parameters with defaults handled in the service if needed.
    private String sortField;  // e.g., "name", "price", etc.
    private String sortDir;    // "asc" or "desc"
    private Integer page;
    private Integer size;
    private String category;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
}
