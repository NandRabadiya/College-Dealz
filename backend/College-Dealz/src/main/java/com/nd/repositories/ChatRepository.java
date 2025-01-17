package com.nd.repositories;


import com.nd.entities.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Integer> {
    List<Chat> findBySenderUserId(int senderId);
    List<Chat> findByReceiverUserId(int receiverId);
    List<Chat> findByProductProductId(int productId);
}
