package com.nd.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WishlistDto {
    private Integer wishlistId;

    private Integer userId;

    private Integer productId;
}