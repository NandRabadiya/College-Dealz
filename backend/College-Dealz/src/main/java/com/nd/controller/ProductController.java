package com.nd.controller;

import com.nd.dto.ProductDto;
import com.nd.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Integer productId) {
        ProductDto productDto = productService.getProductById(productId);
        return ResponseEntity.ok(productDto);
    }

    @PostMapping("/")
    public ResponseEntity<ProductDto> createProduct(
            @RequestBody ProductDto productDto,
            @RequestParam("universityId") int universityId,
            @RequestParam("sellerId") int sellerId) {

        ProductDto createdProduct = productService.createProduct(productDto, universityId, sellerId);
        return ResponseEntity.ok(createdProduct);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Integer productId,
                                                    @RequestBody ProductDto productDto) {
        ProductDto updatedProduct = productService.updateProduct(productId, productDto);
        return ResponseEntity.ok(updatedProduct);
    }

    @GetMapping("/university/{universityId}")
    public ResponseEntity<List<ProductDto>> getProductsByUniversity(@PathVariable Integer universityId) {
        List<ProductDto> products = productService.getProductsByUniversityId(universityId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ProductDto>> getProductsBySeller(@PathVariable Integer sellerId) {
        List<ProductDto> products = productService.getProductsBySellerId(sellerId);
        return ResponseEntity.ok(products);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> deleteProductById(@PathVariable Integer productId) {
        try {
            // Call service to delete product
            productService.deleteProduct(productId);
            return ResponseEntity.ok("Product with ID " + productId + " deleted successfully.");
        } catch (RuntimeException ex) {
            // Handle exception if product is not found
            return ResponseEntity.status(404).body("Error: " + ex.getMessage());
        }
    }

}
