package com.nd.service.Impl;

import com.nd.entities.Chat;
import com.nd.dto.ProductDto;
import com.nd.entities.Product;
import com.nd.entities.University;
import com.nd.entities.User;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.ProductRepo;
import com.nd.repositories.UniversityRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private UniversityRepo universityRepo;

    @Override
    public ProductDto createProduct(ProductDto productDto, int universityId, int sellerId) {
        // Fetch University and Seller (User) entities
        University university = universityRepo.findById(universityId)
                .orElseThrow(() -> new ResourceNotFoundException("University not found with ID: " + universityId));

        User seller = userRepo.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with ID: " + sellerId));

        // Map ProductDto to Product entity
        Product product = mapToEntity(productDto);
        product.setUniversity(university);
        product.setSeller(seller);
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());

        // Save the product
        Product savedProduct = productRepo.save(product);

        // Map back to DTO and return
        return mapToDto(savedProduct);

    }

    @Override
    public ProductDto updateProduct(Integer productId, ProductDto productDto) {
        Product existingProduct = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product with ID " + productId + " not found."));

        existingProduct.setName(productDto.getName());
        existingProduct.setDescription(productDto.getDescription());
        existingProduct.setPrice(productDto.getPrice());
        existingProduct.setCondition(productDto.getCondition());
        existingProduct.setCategory(productDto.getCategory());
        existingProduct.setMonthsOld(productDto.getMonthsOld());
        existingProduct.setUpdatedAt(Instant.now());

        Product updatedProduct = productRepo.save(existingProduct);
        return mapToDto(updatedProduct);
    }

    @Override
    public ProductDto getProductById(Integer productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product with ID " + productId + " not found."));
        return mapToDto(product);
    }

    @Override
    public List<ProductDto> getAllProducts() {
        return productRepo.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getProductsByCategory(String category) {
        return productRepo.findByCategory(category).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getProductsBySellerId(Integer sellerId) {
        return productRepo.findBySellerId(sellerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getProductsByUniversityId(Integer universityId) {
        return productRepo.findByUniversityId(universityId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(Integer productId) {
        if (productRepo.existsById(productId)) {
            productRepo.deleteById(productId);
        } else {
            throw new RuntimeException("Product with ID " + productId + " not found.");
        }
    }

    private Product mapToEntity(ProductDto productDto) {
        Product product = new Product();
      //  product.setId(productDto.getId());
        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setPrice(productDto.getPrice());
        product.setCondition(productDto.getCondition());
        product.setCategory(productDto.getCategory());
        product.setMonthsOld(productDto.getMonthsOld());
        User seller = userRepo.findById(productDto.getSellerId())
                .orElseThrow(() -> new RuntimeException("Seller with ID " + productDto.getSellerId() + " not found."));
        product.setSeller(seller);
        University university = universityRepo.findById(productDto.getUniversityId())
                .orElseThrow(() -> new RuntimeException("University with ID " + productDto.getUniversityId() + " not found."));
        product.setUniversity(university);
        return product;
    }

    private ProductDto mapToDto(Product product) {
        ProductDto productDto = new ProductDto();
        productDto.setId(product.getId());
        productDto.setName(product.getName());
        productDto.setDescription(product.getDescription());
        productDto.setPrice(product.getPrice());
        productDto.setCondition(product.getCondition());
        productDto.setCategory(product.getCategory());
        productDto.setMonthsOld(product.getMonthsOld());
        productDto.setSellerId(product.getSeller().getId());
        productDto.setUniversityId(product.getUniversity().getId());
        return productDto;
    }
}
