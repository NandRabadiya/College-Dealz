package com.nd.repositories;

import com.nd.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NotificationRepo extends JpaRepository<Notification, Integer> {


    @Override
    Optional<Notification> findById(Integer integer);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    Optional<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") Integer userId);
}
