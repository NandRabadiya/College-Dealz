package com.nd.repositories;

import com.nd.entities.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepo extends JpaRepository<Chat, Integer> {

    Optional<List<Chat>> findBySenderId(int senderId);

    Optional<List<Chat>> findByReceiverId(int receiverId);

    List<Chat> findByProductId(Integer productId);
}