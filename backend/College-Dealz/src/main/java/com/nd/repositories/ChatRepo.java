package com.nd.repositories;


import com.nd.entities.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepo extends JpaRepository<Chat, Integer> {


//    // 1. Find chats by sender ID
//    @Query("SELECT c FROM Chat c WHERE c.sender = :senderId")
//    Optional<List<Chat>> findBySenderUserId(@Param("senderId") int senderId);

    Optional<List<Chat>> findBySenderId(int senderId);

    // 2. Find chats by receiver ID
//    @Query("SELECT c FROM Chat c WHERE c.receiver = :receiverId")
//    Optional<List<Chat>> findByReceiverUserId(@Param("receiverId") int receiverId);

    Optional<List<Chat>> findByReceiverId(int receiverId);

    // 3. Find chats by product ID
//    @Query("SELECT c FROM Chat c WHERE c.product = :productId")
//    List<Chat> findByProductProductId(@Param("productId") Integer productId);

    List<Chat> findByProductId(Integer productId);




}