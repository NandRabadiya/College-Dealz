package com.nd.controller;

import com.nd.dto.ProductDto;
import com.nd.service.ProductService;
import org.apache.catalina.filters.AddDefaultCharsetFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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


    @PostMapping("/create")
    public ResponseEntity<?> createProductWithImages(
            @Validated @ModelAttribute ProductDto productDto,
            @RequestHeader("Authorization") String authHeader) {
        try {
            ProductDto createdProduct = productService.createProductWithImages(productDto, authHeader);
            return ResponseEntity.ok(createdProduct);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + ex.getMessage());
        }
    }

    @PostMapping("/")
    public ResponseEntity<ProductDto> createProduct(
            @RequestBody ProductDto productDto, @RequestHeader("Authorization") String authHeader) {

        System.out.println("\nin create product controller\n");
        ProductDto createdProduct = productService.createProduct(productDto, authHeader);
        return ResponseEntity.ok(createdProduct);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Integer productId,
                                                    @RequestBody ProductDto productDto) {
        ProductDto updatedProduct = productService.updateProduct(productId, productDto);
        return ResponseEntity.ok(updatedProduct);
    }

    @GetMapping("/university")
    public ResponseEntity<List<ProductDto>> getProductsByUniversity( @RequestHeader("Authorization") String authHeader) {

        System.out.println("\nin getProductsByUniversity controller\n");
        List<ProductDto> products = productService.getProductsByUniversityId(authHeader);


        return ResponseEntity.ok(products);
    }

    @GetMapping("/seller")
    public ResponseEntity<List<ProductDto>> getProductsBySeller(@RequestHeader("Authorization") String authHeader) {
        List<ProductDto> products = productService.getProductsBySellerId(authHeader);
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
