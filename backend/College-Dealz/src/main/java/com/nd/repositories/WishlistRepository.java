package com.nd.repositories;


import com.nd.entities.Product;
import com.nd.entities.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {
    List<Wishlist> findByUserId(Integer userId);
    Optional<Wishlist> findByUserIdAndProductId(Integer userId, Integer productId);
    boolean existsByUserIdAndProductId(Integer userId, Integer productId);

    @Query("SELECT w.product FROM Wishlist w WHERE w.user.id = :userId")
    List<Product> findAllProductsByUserId(Integer userId);

}
