package com.nd.service.Impl;

import com.nd.dto.ChatDTO;
import com.nd.dto.MessageDTO;
import com.nd.entities.Chat;
import com.nd.entities.Message;
import com.nd.entities.Product;
import com.nd.entities.User;
import com.nd.repositories.ChatRepo;
import com.nd.repositories.ProductRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatRepo chatRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private ProductRepo productRepository;

    public ChatServiceImpl(ChatRepo chatRepository, UserRepo userRepository, ProductRepo productRepository) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    public ChatDTO createChat(ChatDTO chatDTO) {
        User sender = userRepository.findById(chatDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found with ID: " + chatDTO.getSenderId()));

        User receiver = userRepository.findById(chatDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found with ID: " + chatDTO.getReceiverId()));

        Product product = productRepository.findById(chatDTO.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + chatDTO.getProductId()));

        Chat chat = new Chat();
        chat.setSender(sender);
        chat.setReceiver(receiver);
        chat.setProduct(product);

        Chat savedChat = chatRepository.save(chat);
        return mapToDTO(savedChat);
    }

    @Override
    public ChatDTO getChatById(int chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found with ID: " + chatId));
        return mapToDTO(chat);
    }

    @Override
    public List<ChatDTO> getChatsBySenderId(int senderId) {
        return chatRepository.findBySenderId(senderId)
                .orElse(Collections.emptyList())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChatDTO> getChatsByReceiverId(int receiverId) {
        return chatRepository.findByReceiverId(receiverId)
                .orElse(Collections.emptyList())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChatDTO> getChatsByProductId(int productId) {
        return chatRepository.findByProductId(productId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteChat(int chatId) {
        if (!chatRepository.existsById(chatId)) {
            throw new RuntimeException("Chat not found with ID: " + chatId);
        }
        chatRepository.deleteById(chatId);
    }

    private ChatDTO mapToDTO(Chat chat) {
        List<MessageDTO> messages = chat.getMessages()
                .stream()
                .map(message -> new MessageDTO(
                        message.getId(),
                        chat.getId(),
                        message.getSender().getId(),
                        message.getContent(),
                        message.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new ChatDTO(
                chat.getId(),
                chat.getSender().getId(),
                chat.getReceiver().getId(),
                chat.getProduct().getId(),
                messages
        );
    }

    public List<ChatDTO> getAllChatsByUser(int userId) {
        // Get all chats where the user is either sender or receiver
        return chatRepository.findBySenderIdOrReceiverId(userId, userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ChatDTO findOrCreateChat(int senderId, int receiverId, int productId) {
        // Try to find an existing chat for this user-receiver-product combination
        Optional<Chat> existingChat = chatRepository.findBySenderIdAndReceiverIdAndProductId(senderId, receiverId, productId);

        if (existingChat.isPresent()) {
            return mapToDTO(existingChat.get());
        } else {
            // Create a new chat if one doesn't exist

            Optional<User> senderO=userRepository.findById(senderId);
            Optional<User> receiverO=userRepository.findById(receiverId);
            Optional<Product> productO=productRepository.findById(productId);

            User sender , receiver;
            Product product;
            if (senderO.isPresent() && receiverO.isPresent() && productO.isPresent()) {
                sender=senderO.get();
               receiver=receiverO.get();
               product=productO.get();
            }else{
                throw new RuntimeException("Sender or Receiver or Product not found : ");
            }

            Chat newChat = new Chat(sender, receiver, product);
            return mapToDTO(chatRepository.save(newChat));
        }
    }

    public void addMessageToChat(Chat chat, Message message) {
        chat.addMessage(message);
        chatRepository.save(chat);
    }



}
