
// WishlistController
package com.nd.controller;

import com.nd.dto.ProductDto;
import com.nd.dto.WishlistDto;
import com.nd.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @PostMapping("/{productId}")
    public ResponseEntity<?> addToWishlist(
            @PathVariable Integer productId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            WishlistDto wishlistDto = wishlistService.addToWishlist(productId, authHeader);
            return ResponseEntity.ok(wishlistDto);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/")
    public ResponseEntity<List<ProductDto>> getWishlist(
            @RequestHeader("Authorization") String authHeader) {
        List<ProductDto> wishlist = wishlistService.getWishlistByUser(authHeader);
        return ResponseEntity.ok(wishlist);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(
            @PathVariable Integer productId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            wishlistService.removeFromWishlist(productId, authHeader);
            return ResponseEntity.ok("Product removed from wishlist successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{productId}/check")
    public ResponseEntity<Boolean> checkProductInWishlist(
            @PathVariable Integer productId,
            @RequestHeader("Authorization") String authHeader) {
        boolean isInWishlist = wishlistService.isProductInWishlist(productId, authHeader);
        return ResponseEntity.ok(isInWishlist);
    }
}
