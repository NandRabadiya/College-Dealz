package com.nd.service.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.nd.dto.MessageDTO;
import com.nd.entities.Chat;
import com.nd.entities.Message;
import com.nd.entities.User;
import com.nd.exceptions.*;
import com.nd.repositories.ChatRepo;
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
    private ChatRepo chatRepository;


    @Autowired
    private ProductRepo productRepo;

    @Override
    public Message sendMessage(int senderId, int ProductId, String content) throws UserException, ChatException, ProductException {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserException("User not found with id: " + senderId));

       // List<Chat> chat = productRepo.getProductById(ProductId).getChat();

        Message message = new Message();
        message.setContent(content);
        message.setSender(sender);
        message.setCreatedAt(LocalDate.now());
        message.setCreatedTime(LocalTime.now());
       // message.setChat(chat);

        //chat.getMessages().add(savedMessage);
        return messageRepository.save(message);
    }

    @Override
    public List<Message> getMessagesByProductId(int ProductId) throws ProductException, ChatException {
        Chat chat = productRepo.getChatByProductId(ProductId);
        List<Message> findByChatIdOrderByCreatedAtAsc = messageRepository.findByChatIdOrderByCreatedAtAsc(chat.getId());
        return findByChatIdOrderByCreatedAtAsc;
    }

    public List<MessageDTO> getMessagesByChatId(int chatId) {

        return messageRepository.findByChatIdOrderByCreatedAtAsc(chatId).stream()
                .map(this::mapToDto).toList();
    }

    public Message saveMessage(Message message) {
        Chat chat = message.getChat();
        // Ensure the message is added to the chat's message list
        chat.addMessage(message);
        return messageRepository.save(message);
    }

    @Transactional
    public MessageDTO createMessage(int senderId, int receiverId, String content, int chatId) {

        Optional<User> senderO=userRepository.findById(senderId);
        Optional<User> receiverO=userRepository.findById(receiverId);
        Optional<Chat> chatOptional=chatRepository.getChatById(chatId);

        User sender,receiver;
        Chat chat;
        if(senderO.isPresent() && receiverO.isPresent() && chatOptional.isPresent()) {
            sender = senderO.get();
            receiver = receiverO.get();
            chat = chatOptional.get();
        }else{
            throw  new ResourceNotFoundException("User or chat not found with id: ");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setChat(chat);


               Message msg= saveMessage(message);

        return mapToDto(msg);

    }

     private MessageDTO mapToDto(Message message) {
        return new MessageDTO(
                message.getSender().getId(),
                message.getReceiver().getId(),
                message.getChat().getId(),
                message.getContent(),
                message.getCreatedAt(),
                message.getCreatedTime()
        );
    }
}


