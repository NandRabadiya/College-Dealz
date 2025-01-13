package com.nd.service;

import com.nd.entities.Product;

import java.util.List;

public interface ProductService {
    Product createProduct(Product product);
    Product updateProduct(Integer productId, Product product);
    Product getProductById(Integer productId);
    List<Product> getAllProducts();
    List<Product> getProductsByCategory(Integer category);
    List<Product> getProductsBySellerId(Integer sellerId);
    List<Product> getProductsByUniversityId(Integer universityId);
    void deleteProduct(Integer productId);
}
