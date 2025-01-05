package com.nd.service.Impl;

import com.nd.entities.Product;
import com.nd.repositories.ProductRepo;
import com.nd.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Override
    public Product createProduct(Product product) {
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());
        return productRepo.save(product);
    }

    @Override
    public Product updateProduct(Integer productId, Product product) {
        Optional<Product> existingProductOpt = productRepo.findById(productId);
        if (existingProductOpt.isPresent()) {
            Product existingProduct = existingProductOpt.get();
            existingProduct.setName(product.getName());
            existingProduct.setDescription(product.getDescription());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setConditions(product.getConditions());
            existingProduct.setCategory(product.getCategory());
            existingProduct.setMonthsOld(product.getMonthsOld());
            existingProduct.setLocation(product.getLocation());
            existingProduct.setUpdatedAt(Instant.now());
            return productRepo.save(existingProduct);
        } else {
            throw new RuntimeException("Product with ID " + productId + " not found.");
        }
    }

    @Override
    public Product getProductById(Integer productId) {
        return productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product with ID " + productId + " not found."));
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    @Override
    public List<Product> getProductsByCategory(Integer category) {
        return productRepo.findByCategory(category);
    }

    @Override
    public List<Product> getProductsBySellerId(Integer sellerId) {
        return productRepo.findBySellerId(sellerId);
    }

    @Override
    public List<Product> getProductsByUniversityId(Integer universityId) {
        return productRepo.findByUniversityId(universityId);
    }

    @Override
    public void deleteProduct(Integer productId) {
        if (productRepo.existsById(productId)) {
            productRepo.deleteById(productId);
        } else {
            throw new RuntimeException("Product with ID " + productId + " not found.");
        }
    }
}
