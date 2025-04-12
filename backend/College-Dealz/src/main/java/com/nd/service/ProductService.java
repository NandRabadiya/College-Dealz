package com.nd.service;

import com.nd.dto.InterestedBuyerDto;
import com.nd.dto.ProductDto;
import com.nd.dto.ShareProductDto;
import com.nd.dto.SoldOutsideResponse;
import com.nd.entities.Chat;
import com.nd.entities.Product;
import com.nd.exceptions.ProductException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

     List<Chat> getChatByProductId(int productId) ;
    ProductDto createProduct(ProductDto productDto, String authHeader);
    ProductDto mapToDto(Product product);
    ProductDto updateProduct(Integer productId, ProductDto productDto) throws IOException;
    ProductDto getProductById(Integer productId, String token);
    List<ProductDto> getAllProducts(String authHeader);
    List<ProductDto> getProductsByCategory(String category);
    List<ProductDto> getProductsBySellerId(String authHeader);

    ShareProductDto getsharedProduct(int id );

   Page<ProductDto> getProductsByUniversityId(
            int universityId,
            String sortField,
            String sortDir,
            Integer page,
            Integer size,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice);
    Page<ProductDto> searchProductsByUniversity(int universityId, String searchTerm, Pageable pageable);

    List<ProductDto> getProductsByUniversityId(Integer universityId);
    void deleteProduct(Integer productId);
    ProductDto createProductWithImages(ProductDto productDto, String authHeader) throws IOException;

    boolean relistProduct(Integer productId) throws ProductException;

    List<InterestedBuyerDto> getInterestedBuyers(int productId);

    boolean removeProduct(Integer productId, String removalReason, boolean byUser) throws ProductException;

    boolean soldOutsidePlatfrom(Integer productId, SoldOutsideResponse soldOutsideResponse) throws ProductException;

    boolean soldInsidePlatform(Integer productId, String email , int price ) throws ProductException;

}
