package com.nd.service.Impl;

import java.time.LocalDateTime;
import java.util.List;

import com.nd.entities.Chat;
import com.nd.entities.Message;
import com.nd.entities.User;
import com.nd.exceptions.*;
import com.nd.repositories.MessageRepo;
import com.nd.repositories.ProductRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepo messageRepository;

    @Autowired
    private UserRepo userRepository;


    @Autowired
    private ProductRepo productRepo;

    @Override
    public Message sendMessage(int senderId, int ProductId, String content) throws UserException, ChatException, ProductException {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserException("User not found with id: " + senderId));

        Chat chat = productRepo.getProductById(ProductId).getChat();

        Message message = new Message();
        message.setContent(content);
        message.setSender(sender);
        message.setCreatedAt(LocalDateTime.now());
        message.setChat(chat);
        Message savedMessage=messageRepository.save(message);

        chat.getMessages().add(savedMessage);
        return savedMessage;
    }

    @Override
    public List<Message> getMessagesByProductId(int ProductId) throws ProductException, ChatException {
        Chat chat = productRepo.getChatByProductId(ProductId);
        List<Message> findByChatIdOrderByCreatedAtAsc = messageRepository.findByChatIdOrderByCreatedAtAsc(chat.getId());
        return findByChatIdOrderByCreatedAtAsc;
    }
}

