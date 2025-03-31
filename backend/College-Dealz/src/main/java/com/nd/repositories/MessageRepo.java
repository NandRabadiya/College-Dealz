package com.nd.repositories;

import com.nd.entities.Chat;
import com.nd.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepo extends JpaRepository<Message, Long> {
    List<Message> findByChatIdOrderByCreatedAtAsc (int chatId);

}
