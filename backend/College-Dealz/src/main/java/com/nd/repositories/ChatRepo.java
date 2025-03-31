package com.nd.repositories;

import com.nd.entities.Chat;
import com.nd.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRepo extends JpaRepository<Chat, Integer> {

    Optional<List<Chat>> findBySenderId(int senderId);

    Optional<List<Chat>> findByReceiverId(int receiverId);

    List<Chat> findByProductId(Integer productId);



    // Find all chats where the user is sender or receiver
    List<Chat> findBySenderIdOrReceiverId(int sender, int receiver);

    // Find a specific chat by sender, receiver and product
    Optional<Chat> findBySenderIdAndReceiverIdAndProductId(int senderId, int receiverId, int productId);

    // Get all chats for a specific product
    List<Chat> findByProduct(Product product);

    Optional<Chat> getChatById(int chatId);
}