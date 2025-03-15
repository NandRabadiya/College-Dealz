package com.nd.controller;

import com.nd.dto.*;
import com.nd.enums.NotificationType;
import com.nd.enums.ReferenceType;
import com.nd.exceptions.ProductException;
import com.nd.service.JwtService;
import com.nd.service.NotificationService;
import com.nd.service.ProductService;
import com.nd.service.WantlistService;
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

    @Autowired
    private WantlistService wantlistService;

    @Autowired
    private NotificationService notificationService;

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

    @PostMapping("/create-from-wantlist")
    public ResponseEntity<?> createProductFromWantlist(
            @Validated @ModelAttribute ProductDto productDto,
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("WantlistId") int wantlistId) {
        try {
            ProductDto createdProduct = productService.createProductWithImages(productDto, authHeader);

           // int sellerId = jwtService.getUserIdFromToken(authHeader);

            int buyerId = wantlistService.getWantlistById(wantlistId).getUserId();

            notificationService.createNotificationForUser(buyerId,"A New Product Matches Your Wantlist!",
                    "A product that fits your preferences has just been listed. Check it out and see if it's what you need!",
                    NotificationType.ITEM_INTEREST, ReferenceType.PRODUCT_ITEM,createdProduct.getId());

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


    @PostMapping("/{productId}/relist")
    public ResponseEntity<String> relistProduct(@PathVariable Integer productId) throws ProductException {
        boolean newProduct = productService.relistProduct(productId);
        if (newProduct)
            return ResponseEntity.ok("Product successfully marked as sold and removed.");
        else return ResponseEntity.status(404).body("Unable to mark the product as sold. Please try again.");
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

    @PostMapping("/public/university/{universityId}")
    public ResponseEntity<Page<ProductDto>> getProductsByUniversity(
            @PathVariable Integer universityId,
            @RequestBody(required = false) ProductSortFilterRequest request) {

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

    @GetMapping("/{productId}/interested-buyers")
    public ResponseEntity<List<InterestedBuyerDto>> getInterestedBuyers(@PathVariable int productId) {
        List<InterestedBuyerDto> buyers = productService.getInterestedBuyers(productId);
        return ResponseEntity.ok(buyers);
    }

    @GetMapping("/public/shared-product/{productId}")
    public ResponseEntity<ShareProductDto> getSharedProduct(@PathVariable int productId) {

        ShareProductDto shareProductDto=productService.getsharedProduct(productId);

        return ResponseEntity.ok(shareProductDto);
    }

    @DeleteMapping("/remove-by-user/{productId}")
    public ResponseEntity<String> removeProductbyUser(@PathVariable Integer productId,
                                                      @RequestParam String reason ) throws ProductException {


        boolean archived = productService.removeProduct(productId, reason , true);//remove by user then true
       if (archived)
        return ResponseEntity.ok("Product Removed Successfully");
       else return ResponseEntity.status(404).body("Failed to remove the product. Please try again.");
    }
    @DeleteMapping("/remove-by-admin/{productId}")
    public ResponseEntity<String> removeProductbyAdmin(@PathVariable Integer productId,
                                                @RequestParam String reason ) throws ProductException {
        boolean archived = productService.removeProduct(productId, reason , false);//remove by admin then false
        if (archived)
            return ResponseEntity.ok("Product Removed Successfully");
        else return ResponseEntity.status(404).body("Failed to remove the product. Please try again.");
    }

    @PostMapping("/sold-outside/{productId}")
    public ResponseEntity<String> soldOutsidePlatform(@PathVariable Integer productId,
                                                               @RequestBody SoldOutsideResponse soldOutsideResponse) throws ProductException {
        boolean archived = productService.soldOutsidePlatfrom(productId, soldOutsideResponse);
        if (archived)
            return ResponseEntity.ok("Product marked as sold and removed successfully.");
        else return ResponseEntity.status(404).body("Failed to mark the product as sold. Please try again.");
    }


    @PostMapping("/sold-inside-platform/{productId}")
    public ResponseEntity<String> soldInsidePlatform(@PathVariable Integer productId,
                                                      @RequestParam String buyerEmail,
                                                     @RequestParam int price ) throws ProductException {
        boolean archived = productService.soldInsidePlatform(productId, buyerEmail,price);
        if (archived)
            return ResponseEntity.ok("Product marked as sold and removed successfully.");
        else return ResponseEntity.status(404).body("Failed to mark the product as sold. Please try again.");

    }



}
