package com.nd.service;

import com.nd.dto.ProductDto;
import com.nd.entities.Chat;
import com.nd.entities.Product;

import java.io.IOException;
import java.util.List;

public interface ProductService {

     Chat getChatByProductId(int productId) ;
    ProductDto createProduct(ProductDto productDto, String authHeader);
    ProductDto mapToDto(Product product);
    ProductDto updateProduct(Integer productId, ProductDto productDto) throws IOException;
    ProductDto getProductById(Integer productId);
    List<ProductDto> getAllProducts();
    List<ProductDto> getProductsByCategory(String category);
    List<ProductDto> getProductsBySellerId(String authHeader);
    List<ProductDto> getProductsByUniversityId(String authHeader);
    void deleteProduct(Integer productId);
    ProductDto createProductWithImages(ProductDto productDto, String authHeader) throws IOException;
}
