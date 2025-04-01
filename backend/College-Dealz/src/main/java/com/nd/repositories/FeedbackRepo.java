package com.nd.repositories;

import com.nd.entities.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepo extends JpaRepository<Feedback, Long> {


    Optional<Feedback> findById(int id);

}
