package com.nd.service;

import com.nd.dto.ProductDto;
import com.nd.entities.Product;

import java.util.List;

public interface ProductService {

    ProductDto createProduct(ProductDto productDto, int universityId, int sellerId);

    ProductDto updateProduct(Integer productId, ProductDto productDto);
    ProductDto getProductById(Integer productId);
    List<ProductDto> getAllProducts();
    List<ProductDto> getProductsByCategory(String category);
    List<ProductDto> getProductsBySellerId(Integer sellerId);
    List<ProductDto> getProductsByUniversityId(Integer universityId);
    void deleteProduct(Integer productId);
}
