package com.nd.repositories;

import com.nd.entities.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepo extends JpaRepository<Image, Integer> {
    List<Image> findByProductId(Integer productId); // Fetch all images for a product

}
