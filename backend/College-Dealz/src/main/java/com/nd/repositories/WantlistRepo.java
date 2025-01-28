package com.nd.repositories;

import com.nd.entities.Wantlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WantlistRepo extends JpaRepository<Wantlist,Integer> {




    // Fetch all wantlist items for a given user ID
    List<Wantlist> findByUserId(Integer userId);

    // Delete a wantlist item by ID and user ID (to ensure ownership)
    void deleteByIdAndUserId(Integer id, Integer userId);

    Wantlist getById(Integer id);
}
