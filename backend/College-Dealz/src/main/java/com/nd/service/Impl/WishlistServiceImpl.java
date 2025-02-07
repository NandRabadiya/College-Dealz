package com.nd.service.Impl;

import com.nd.dto.WishlistDto;
import com.nd.entities.Wishlist;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.ProductRepo;
import com.nd.repositories.UserRepo;
import com.nd.repositories.WishlistRepository;
import com.nd.service.JwtService;
import com.nd.service.ProductService;
import com.nd.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistServiceImpl implements WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private UserRepo userRepo;


    @Autowired
    private JwtService jwtService;

    @Override
    @Transactional
    public WishlistDto addToWishlist(Integer productId, String authHeader) {
        int userId = jwtService.getUserIdFromToken(authHeader);

        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new IllegalStateException("Product is already in wishlist");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setProduct(productRepo.findById(productId).get());
        wishlist.setUser(userRepo.findById(userId).get());
        wishlist.setCreatedAt(Instant.now());
        wishlist.setUpdatedAt(Instant.now());

        Wishlist wishlistSaved = wishlistRepository.save(wishlist);

        return mapToDto(wishlistSaved);
    }

    @Override
    public List<WishlistDto> getWishlistByUser(String authHeader) {
        int userId = jwtService.getUserIdFromToken(authHeader);
        return wishlistRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeFromWishlist(Integer productId, String authHeader) {
        int userId = jwtService.getUserIdFromToken(authHeader);
        wishlistRepository.findByUserIdAndProductId(userId, productId)
                .ifPresentOrElse(
                        wishlistRepository::delete,
                        () -> { throw new ResourceNotFoundException("Product not found in wishlist"); }
                );
    }

    @Override
    public boolean isProductInWishlist(Integer productId, String authHeader) {
        int userId = jwtService.getUserIdFromToken(authHeader);
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    private WishlistDto mapToDto(Wishlist wishlist) {
        WishlistDto dto = new WishlistDto();
        dto.setWishlistId(wishlist.getId());
        dto.setUserId(wishlist.getUser().getId());
        dto.setProductId(wishlist.getProduct().getId());

        return dto;
    }

}