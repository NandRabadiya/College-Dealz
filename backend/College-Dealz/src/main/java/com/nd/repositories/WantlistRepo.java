package com.nd.repositories;

import com.nd.entities.Wantlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WantlistRepo extends JpaRepository<Wantlist,Integer> {


    @Query("SELECT w FROM Wantlist w JOIN FETCH w.user u WHERE u.university.id = :universityId")
    List<Wantlist> findAllByUniversityId(@Param("universityId") int universityId);


    // Fetch all wantlist items for a given user ID
    List<Wantlist> findByUserId(Integer userId);

    // Delete a wantlist item by ID and user ID (to ensure ownership)
    void deleteByIdAndUserId(Integer id, Integer userId);

    Wantlist getById(Integer id);
}
