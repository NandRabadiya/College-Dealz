package com.nd.service.Impl;

import com.nd.dto.InterestedBuyerDto;
import com.nd.entities.*;
import com.nd.dto.ProductDto;
import com.nd.enums.Category;
import com.nd.enums.ProductStatus;
import com.nd.exceptions.ProductException;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.ImageRepo;
import com.nd.repositories.ProductRepo;
import com.nd.repositories.UniversityRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.ImageService;
import com.nd.service.JwtService;
import com.nd.service.ProductService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import java.io.IOException;
import java.math.BigDecimal;
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
        return mapToDtowithoutImage(savedProduct);

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

               System.out.println(image.getImageData() + image.getFileName());
                images.add(image);

            }
            imageRepo.saveAll(images);
        }else {
            throw new ResourceNotFoundException("Images are not submited with product");
        }

       savedProduct.setImages(images);

        // Step 5: Save the updated product to ensure images are linked
     Product savedProductwithImage =  productRepo.save(savedProduct);

     ProductDto savedProductDtoWithImage = mapToDto(savedProductwithImage);

        return savedProductDtoWithImage;
    }

    @Override
    @Transactional
    public ProductDto updateProduct(Integer productId, ProductDto productDto) throws IOException {
        // 1. Fetch the existing product
        Product existingProduct = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product with ID " + productId + " not found."));

        // 2. Update basic product details ONLY if new values are provided
        if (productDto.getName() != null) {
            existingProduct.setName(productDto.getName());
        }
        if (productDto.getDescription() != null) {
            existingProduct.setDescription(productDto.getDescription());
        }
        if (productDto.getPrice() != null) {
            existingProduct.setPrice(productDto.getPrice());
        }
        if (productDto.getCondition() != null) {
            existingProduct.setCondition(productDto.getCondition());
        }
        if (productDto.getCategory() != null) {
            existingProduct.setCategory(productDto.getCategory());
        }
        if (productDto.getMonthsOld() != null) {
            existingProduct.setMonthsOld(productDto.getMonthsOld());
        }
        // Update the modification timestamp regardless
        existingProduct.setUpdatedAt(Instant.now());

        // 3. Remove images marked for deletion (if provided)
        List<Integer> removedImageIds = productDto.getRemoveImageIds();
        if (removedImageIds != null && !removedImageIds.isEmpty()) {
            List<Image> imagesToRemove = existingProduct.getImages().stream()
                    .filter(image -> removedImageIds.contains(image.getId()))
                    .collect(Collectors.toList());
            if (!imagesToRemove.isEmpty()) {
                System.out.println("Removing images: " + imagesToRemove);
                // Remove associations from the product's collection.
                existingProduct.getImages().removeAll(imagesToRemove);
                // Optionally, if orphanRemoval isn't enabled, delete them explicitly:
                // imageRepo.deleteAll(imagesToRemove);
            }
        }

        // 4. Add new images (if provided)
        List<MultipartFile> newFiles = productDto.getImages();
        if (newFiles != null && !newFiles.isEmpty()) {
            List<Image> newImages = new ArrayList<>();
            for (MultipartFile file : newFiles) {
                Image image = new Image();
                image.setProduct(existingProduct);
                image.setFileName(file.getOriginalFilename());
                image.setContentType(file.getContentType());
                image.setImageData(file.getBytes());
                image.setCreatedAt(Instant.now());
                image.setUpdatedAt(Instant.now());
                newImages.add(image);
                System.out.println("Adding new image: " + image.getFileName());
            }
            // Save new images first (if your mapping requires it)
            imageRepo.saveAll(newImages);
            // Append new images to the existing collection
            existingProduct.getImages().addAll(newImages);
        }

        // 5. Save the updated product
        Product savedProduct = productRepo.save(existingProduct);
        return mapToDto(savedProduct);
    }


    @Override
    public ProductDto getProductById(Integer productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product with ID " + productId + " not found."));
        return mapToDto(product);
    }

    @Override
    public List<ProductDto> getAllProducts(String authHeader) {
        int user = jwtService.getUserIdFromToken(authHeader);
        if (user!=0) {return productRepo.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());}
        return null;

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
    public ProductDto relistProduct(Integer productId) throws ProductException {
        // Find the old product; throw an exception if not found
        Product oldProduct = productRepo.findById(productId)
                .orElseThrow(() -> new ProductException("Product not found with id: " + productId));

        // Create a new Product instance and copy over product-related fields
        Product newProduct = new Product();
        newProduct.setName(oldProduct.getName());
        newProduct.setDescription(oldProduct.getDescription());
        newProduct.setPrice(oldProduct.getPrice());
        newProduct.setCondition(oldProduct.getCondition());
        newProduct.setMonthsOld(oldProduct.getMonthsOld());
        newProduct.setCategory(oldProduct.getCategory());
        // Do NOT copy location
        newProduct.setSeller(oldProduct.getSeller());
        newProduct.setUniversity(oldProduct.getUniversity());

        // Copy all images: create new Image objects associated with the new product
        List<Image> newImages = new ArrayList<>();
        if (oldProduct.getImages() != null) {
            for (Image oldImage : oldProduct.getImages()) {
                Image newImage = new Image();
                newImage.setS3Url(oldImage.getS3Url()); // Assuming image URL is stored in S3
                newImage.setFileName(oldImage.getFileName());
                newImage.setContentType(oldImage.getContentType());
                newImage.setImageData(oldImage.getImageData());
                newImage.setProduct(newProduct);
                newImages.add(newImage);
            }
        }
        newProduct.setImages(newImages);

        // Reset associations that should not be copied
        newProduct.setChats(new ArrayList<>());
        newProduct.setWishlists(new ArrayList<>());

        // Set new timestamps and status for the new product listing
        Instant now = Instant.now();
        newProduct.setPostDate(now);
        newProduct.setCreatedAt(now);
        newProduct.setUpdatedAt(now);
        newProduct.setStatus(ProductStatus.RELISTED);

        // Save the new product
        Product savedProduct = productRepo.save(newProduct);


        ProductDto productDto= mapToDto(savedProduct);

        return productDto;
    }



    @Override
    public Page<ProductDto> getProductsByUniversityId(
            int universityId,
            String sortField,
            String sortDir,
            Integer page,
            Integer size,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice) {
         int pageNumber = (page != null && page >= 0) ? page : 0;
        int pageSize = (size != null && size > 0) ? size : 2;
        String sortBy = (sortField != null && !sortField.isEmpty()) ? sortField : "price";
        Sort.Direction direction = (sortDir != null && sortDir.equalsIgnoreCase("desc")) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable sortedPageable = PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortBy));


        // If a filter is provided, add your filtering logic here. This example assumes filtering by a product name substring.
        Page<Product> productPage;

        if (category != null && !category.isEmpty()) {
      //      productPage = productRepo.findByUniversityIdAndNameContainingIgnoreCase(universityId, filter, sortedPageable);
            Category category_enum= Category.valueOf(category.toUpperCase());
            productPage= productRepo.findByUniversityIdAndCategory(universityId,category_enum , sortedPageable);
        } else if(maxPrice != null &&  !maxPrice.equals(BigDecimal.ZERO) && minPrice != null)

        {
            productPage = productRepo.findByUniversityIdAndPriceLessThanEqualAndPriceGreaterThanEqual(universityId,maxPrice,minPrice,sortedPageable);
        }
        else
        {
            productPage = productRepo.findByUniversityId(universityId, sortedPageable);
        }

        // Map your Product entities to ProductDto
        return productPage.map(this::mapToDto);
    }



    @Override
    public Page<ProductDto> searchProductsByUniversity(int universityId, String searchTerm, Pageable pageable) {
        Page<Product> productPage = productRepo
                .findByUniversityIdAndNameContainingOrDescriptionContaining(
                        universityId, searchTerm, searchTerm, pageable);

        return productPage.map(this::mapToDto);
    }

   // @Override
    public List<ProductDto> getProductsByUniversityId(String authHeader) {
        return List.of();
    }


    @Override
    public List<ProductDto> getProductsByUniversityId(Integer universityId) {
        return productRepo.findByUniversityId(universityId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());    }

    @Override
    public void deleteProduct(Integer productId) {
        if (productRepo.existsById(productId)) {
            productRepo.deleteById(productId);
        } else {
            throw new RuntimeException("Product with ID " + productId + " not found.");
        }
    }

    @Override
    public List<InterestedBuyerDto> getInterestedBuyers(int productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return product.getChats().stream()
                .map(chat -> new InterestedBuyerDto(
                        chat.getSender().getId(),
                        chat.getSender().getName(),
                        chat.getSender().getEmail()))
                .distinct()
                .collect(Collectors.toList());
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


    @Override
    public List<Chat> getChatByProductId(int ProductId){
        Product product = productRepo.getProductById(ProductId);
        return product.getChats();
    }

    @Override
    public ProductDto mapToDto(Product product) {
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

    private ProductDto mapToDtowithoutImage(Product product) {
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
