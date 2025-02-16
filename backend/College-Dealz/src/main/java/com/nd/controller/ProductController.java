package com.nd.controller;

import com.nd.dto.ProductDto;
import com.nd.dto.ProductSortFilterRequest;
import com.nd.service.JwtService;
import com.nd.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private JwtService  jwtService;

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
    public ResponseEntity<?> updateProduct(
            @PathVariable Integer productId,
            @ModelAttribute ProductDto productDto,
            @RequestHeader("Authorization") String authHeader) {
        try {
            ProductDto updatedProduct = productService.updateProduct(productId, productDto);
            return ResponseEntity.ok(updatedProduct);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating product: " + ex.getMessage());
        }
    }




    @PostMapping("/university")
    public ResponseEntity<Page<ProductDto>> getProductsByUniversity(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody(required = false) ProductSortFilterRequest request) {

        int universityId = jwtService.getUniversityIdFromToken(authHeader);
        // If no body is provided, create a default request.
        if (request == null) {
            request = new ProductSortFilterRequest();
        }

        // Log parameters for debugging
        System.out.println("\n\nSortField: " + request.getSortField() + ", SortDir: " + request.getSortDir() +
                ", Page: " + request.getPage() + ", Size: " + request.getSize() +
                ", Category: " + request.getCategory() + ", MinPrice: " + request.getMinPrice() +
                ", MaxPrice: " + request.getMaxPrice());

        Page<ProductDto> products = productService.getProductsByUniversityId(
                universityId,
                request.getSortField(),
                request.getSortDir(),
                request.getPage(),
                request.getSize(),
                request.getCategory(),
                request.getMinPrice(),
                request.getMaxPrice()
        );
        return ResponseEntity.ok(products);
    }

        return ResponseEntity.ok(products);
    }
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts(@RequestHeader("Authorization") String authHeader) {
        List<ProductDto> products = productService.getAllProducts(authHeader);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search/{searchTerm}")
    public ResponseEntity<?> searchProducts(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String searchTerm,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {

        int universityId = jwtService.getUniversityIdFromToken(authHeader);
        Page<ProductDto> products = productService.searchProductsByUniversity(universityId, searchTerm, pageable);

        if (products.isEmpty()) {
            // Return a custom message when no products are found
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No such product found. Please check the spelling or try a different search term."));
        }

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
