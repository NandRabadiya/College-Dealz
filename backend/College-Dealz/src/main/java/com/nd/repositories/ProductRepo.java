package com.nd.repositories;

import com.nd.entities.Product;
import com.nd.entities.University;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepo extends JpaRepository<Product, Integer> {


    @Override
    List<Product> findAllById(Iterable<Integer> integers);

    @Query("SELECT p FROM Product p WHERE p.university = :university")
    List<Product> findAllByUniversity(@NotNull University university);

    @Query("SELECT p FROM Product p WHERE p.category = :category")
    List<Product> findByCategory(String category);



    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId")
    List<Product> findBySellerId(Integer sellerId);

    @Query("SELECT p FROM Product p WHERE p.university.id = :universityId")
    List<Product> findByUniversityId(Integer universityId);


}
