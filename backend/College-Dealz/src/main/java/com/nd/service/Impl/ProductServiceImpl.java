package com.nd.service.Impl;

import com.nd.entities.*;
import com.nd.dto.ProductDto;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.ImageRepo;
import com.nd.repositories.ProductRepo;
import com.nd.repositories.UniversityRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.ImageService;
import com.nd.service.JwtService;
import com.nd.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
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

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ImageRepo imageRepo;

    @Override
    public ProductDto createProduct(ProductDto productDto, String authHeader) throws ResourceNotFoundException {

int seller_id= jwtService.getUserIdFromToken(authHeader);
        productDto.setSellerId(seller_id);


        productDto.setUniversityId(jwtService.getUniversityIdFromToken(authHeader));


        // Map ProductDto to Product entity
        Product product = mapToEntity(productDto);

        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());

        // Save the product
        Product savedProduct = productRepo.save(product);

        // Map back to DTO and return
        return mapToDto(savedProduct);

    }

   // @Transactional
    public ProductDto createProductWithImages(ProductDto productDto, String authHeader) throws IOException {

        // Step 1: Populate seller ID and university ID from the token
        int sellerId = jwtService.getUserIdFromToken(authHeader);
        int universityId = jwtService.getUniversityIdFromToken(authHeader);

        productDto.setSellerId(sellerId);
        productDto.setUniversityId(universityId);

        // Step 2: Use the existing createProduct method to save the product
        ProductDto savedProductDto = createProduct(productDto, authHeader);

        // Step 3: Retrieve the saved product entity from the database
        Product savedProduct = productRepo.findById(savedProductDto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + savedProductDto.getId()));

        // Step 4: Save associated images
        List<Image> images = new ArrayList<>();
        if (productDto.getImages() != null) {
            for (MultipartFile file : productDto.getImages()) {
                Image image = new Image();
                image.setProduct(savedProduct);
                image.setFileName(file.getOriginalFilename());
                image.setContentType(file.getContentType());
                image.setImageData(file.getBytes());
                image.setCreatedAt(Instant.now());
                image.setUpdatedAt(Instant.now());// Save image as byte array
                images.add(image);

            }
            imageRepo.saveAll(images);
        }else {
            throw new ResourceNotFoundException("Images are not submited with product");
        }

        savedProduct.setImages(images);

        // Step 5: Save the updated product to ensure images are linked
        productRepo.save(savedProduct);

        return savedProductDto;
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
    public List<ProductDto> getProductsBySellerId(String authHeader) {

        int sellerId= jwtService.getUserIdFromToken(authHeader);



        return productRepo.findBySellerId(sellerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getProductsByUniversityId(String authHeader) {
System.out.println(authHeader);
System.out.println(jwtService.getUniversityIdFromToken(authHeader));

        int universityId = jwtService.getUniversityIdFromToken(authHeader);
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
     //   product.setId(productDto.getId());
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


        // Map associated images to URLs or base64-encoded data
        List<String> imageUrls = product.getImages().stream()
                .map(image -> {
                    if (image.getS3Url() != null && !image.getS3Url().isEmpty()) {
                        return image.getS3Url(); // Use S3 URL if available
                    } else {
                        // Convert byte[] to Base64 string
                        return "data:" + image.getContentType() + ";base64," +
                                Base64.getEncoder().encodeToString(image.getImageData());
                    }
                })
                .toList();
        productDto.setImageUrls(imageUrls);

        return productDto;
    }
}
