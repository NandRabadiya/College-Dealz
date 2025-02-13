package com.nd.service;

import com.nd.dto.ProductDto;
import com.nd.dto.WishlistDto;
import java.util.List;

public interface WishlistService {

    WishlistDto addToWishlist(Integer productId, String authHeader);

    List<ProductDto> getWishlistByUser(String authHeader);

    void removeFromWishlist(Integer productId, String authHeader);

    boolean isProductInWishlist(Integer productId, String authHeader);
}
