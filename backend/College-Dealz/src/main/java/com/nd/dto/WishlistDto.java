package com.nd.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WishlistDto {
    private Integer wishlistId;

    private Integer userId;

    private Integer productId;
}