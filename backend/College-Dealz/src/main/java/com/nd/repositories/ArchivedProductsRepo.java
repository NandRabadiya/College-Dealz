package com.nd.repositories;

import com.nd.entities.ArchivedProducts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArchivedProductsRepo extends JpaRepository<ArchivedProducts, Integer> {
}
