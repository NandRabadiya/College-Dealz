package com.nd.repositories;

import com.nd.entities.Chat;
import com.nd.entities.Product;
import com.nd.entities.University;
import com.nd.enums.Category;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepo extends JpaRepository<Product, Integer>, JpaSpecificationExecutor<Product> {


    @Override
    List<Product> findAllById(Iterable<Integer> integers);

    @Query("SELECT p FROM Product p WHERE p.university = :university")
    List<Product> findAllByUniversity(@NotNull University university);

    @Query("SELECT p FROM Product p WHERE p.category = :category")
    List<Product> findByCategory(String category);

    @Query("SELECT p FROM Product p WHERE p.university.id = :universityId")
    Page<Product> findByUniversityId(@Param("universityId") int universityId, Pageable pageable);

//    @Query("SELECT p FROM Product p WHERE p.university.id = :universityId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
//    Page<Product> findByUniversityIdAndNameContainingIgnoreCase(@Param("universityId") int universityId, @Param("name") String name, Pageable pageable);

    Page<Product> findByUniversityIdAndCategory(int universityId, Category category, Pageable pageable);

    Page<Product> findByUniversityIdAndPriceLessThanEqualAndPriceGreaterThanEqual(int universityId,@NotNull BigDecimal priceIsLessThan, @NotNull BigDecimal priceIsGreaterThan,Pageable pageable);

    Page<Product> findByUniversityIdAndNameContainingOrDescriptionContaining(int universityId, String name, String description, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId")
    List<Product> findBySellerId(Integer sellerId);

    @Query("SELECT p FROM Product p WHERE p.university.id = :universityId")
    List<Product> findByUniversityId(Integer universityId);


    Product getProductById(int productId);

    @Query("SELECT c FROM Chat c WHERE c.product.id = :productId")
    Chat getChatByProductId(@Param("productId") int productId);



}
