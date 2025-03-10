package com.nd.service.Impl;

import com.nd.dto.InterestedBuyerDto;
import com.nd.dto.ShareProductDto;
import com.nd.dto.SoldOutsideResponse;
import com.nd.entities.*;
import com.nd.dto.ProductDto;
import com.nd.enums.Category;
import com.nd.enums.ProductStatus;
import com.nd.exceptions.ProductException;
import com.nd.exceptions.ResourceNotFoundException;
import com.nd.repositories.*;
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
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
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
    private ArchivedProductsRepo archivedProductsRepo;

    @Autowired
    private ImageRepo imageRepo;

    @Override
    public ProductDto createProduct(ProductDto productDto, String authHeader) throws ResourceNotFoundException {

        int seller_id= jwtService.getUserIdFromToken(authHeader);
        productDto.setSellerId(seller_id);


        productDto.setUniversityId(jwtService.getUniversityIdFromToken(authHeader));


        // Map ProductDto to Product entity
        Product product = mapToEntity(productDto);

        product.setPostDate(Instant.now());
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
        productDto.setPostDate(Instant.now());

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
    public boolean relistProduct(Integer productId) throws ProductException {
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

        deleteProduct(productId);

        return true;
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
        int pageSize = (size != null && size > 0) ? size : 10;
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

        productDto.setSellerName(product.getSeller().getName());
        productDto.setPostDate(product.getPostDate());

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
        productDto.setPostDate(product.getPostDate());
        return productDto;
    }

    public ShareProductDto getsharedProduct(int id ){

        ProductDto product =getProductById(id);

        ShareProductDto shareProductDto = new ShareProductDto();

        shareProductDto.setProduct_id(product.getId());
        shareProductDto.setProduct_name(product.getName());
        shareProductDto.setProduct_description(product.getDescription());
        shareProductDto.setProduct_price(product.getPrice());
        shareProductDto.setImage_urls(product.getImageUrls());

        return shareProductDto;

    }


    @Override
    public boolean removeProduct(Integer productId, String removalReason, boolean byUser) throws ProductException {
        // Fetch the product; throw an exception if not found.
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ProductException("Product not found with id: " + productId));

        // Create an ArchivedProducts instance and copy required fields.
        ArchivedProducts archived = new ArchivedProducts();
        archived.setTitle(product.getName());
        archived.setDescription(product.getDescription());
        archived.setPrice(product.getPrice());
        // Assuming ArchivedProducts.category is a String; if it's an enum, adjust accordingly.
        archived.setCategory(product.getCategory());
        archived.setSellerId(product.getSeller().getId());
        // Listing date comes from product's createdAt field (converted to LocalDateTime)
        LocalDateTime listingDate = LocalDateTime.ofInstant(product.getCreatedAt(), ZoneId.systemDefault());
        archived.setListingDate(listingDate);
        archived.setUniversityId(product.getUniversity().getId());

        // Set removal-specific fields.
        // Ensure ProductStatus.REMOVED_BY_USER exists in your enum, or use an equivalent value.

        if(byUser)
        archived.setStatus(ProductStatus.REMOVED_BY_USER);
        else
            archived.setStatus(ProductStatus.REMOVED_BY_ADMIN);

        archived.setReasonForRemoval(removalReason);
        archived.setStatusChangeDate(LocalDateTime.now());
        // Calculate dealCompletionTime in days between product createdAt and now.
        long daysBetween = ChronoUnit.DAYS.between(listingDate, LocalDateTime.now());
        archived.setDealCompletionTime(daysBetween);

        // Other fields are left as null or their default values (e.g. finalSoldPrice, buyerId, etc.)

        // Save the archived product.
        archivedProductsRepo.save(archived);

        // Optionally remove the original product (or mark it inactive).
        productRepo.delete(product);

        return true;
    }


    @Override
    public boolean soldOutsideProduct(Integer productId, SoldOutsideResponse soldOutsideResponse) throws ProductException {
        // Fetch the product by ID; throw exception if not found.
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ProductException("Product not found with id: " + productId));

        // Create a new ArchivedProducts instance and copy product-related fields.
        ArchivedProducts archived = new ArchivedProducts();
        archived.setTitle(product.getName());
        archived.setDescription(product.getDescription());
        // Assuming category is an enum; convert to string if needed.
        archived.setCategory(product.getCategory());
        System.out.println("soldOutsideProduct : : "+ product.getPrice());

        archived.setPrice(product.getPrice());
        archived.setSellerId(product.getSeller().getId());
        archived.setUniversityId(product.getUniversity().getId());

        // Use product's createdAt as the listing date.
        LocalDateTime listingDate = LocalDateTime.ofInstant(product.getCreatedAt(), ZoneId.systemDefault());
        archived.setListingDate(listingDate);

        // Set additional info from SoldOutsideResponse:
        archived.setFinalSoldPrice(new BigDecimal(soldOutsideResponse.getSoldPrice()));
        archived.setReasonForRemoval(soldOutsideResponse.getReason());  // repurposing this field for sold-outside reason

        // Convert soldDate (java.util.Date) to LocalDateTime for statusChangeDate.
        LocalDateTime soldDate = LocalDateTime.ofInstant(soldOutsideResponse.getSoldDate().toInstant(), ZoneId.systemDefault());
        archived.setStatusChangeDate(soldDate);

        // Calculate dealCompletionTime in days between listingDate and soldDate.
        long daysBetween = ChronoUnit.DAYS.between(listingDate, soldDate);
        archived.setDealCompletionTime(daysBetween);

        // Set the SoldToCollegeStudent flag from the response.
        archived.setSoldToCollegeStudent(soldOutsideResponse.isUniversityStudent());

        // Set status to SOLD_OUTSIDE (ensure this exists in your ProductStatus enum)
        archived.setStatus(ProductStatus.SOLD_OUTSIDE_PLATFORM);

        // Optionally, set confirmationStatus to a specific value or leave as default.
        // archived.setConfirmationStatus(ConfirmationStatus.PENDING);

        // Save the archived product.
        archivedProductsRepo.save(archived);

        // Remove the original product (or mark it as inactive, as per your business logic).
        productRepo.delete(product);

        return true;
    }

}
