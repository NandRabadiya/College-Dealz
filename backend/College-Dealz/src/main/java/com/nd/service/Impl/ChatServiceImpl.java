package com.nd.service.Impl;

import com.nd.dto.ChatDTO;
import com.nd.dto.MessageDTO;
import com.nd.entities.Chat;
import com.nd.entities.Message;
import com.nd.entities.Product;
import com.nd.entities.User;
import com.nd.repositories.ChatRepository;
import com.nd.repositories.ProductRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;
    private final UserRepo userRepository;
    private final ProductRepo productRepository;

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
        return chatRepository.findBySenderUserId(senderId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChatDTO> getChatsByReceiverId(int receiverId) {
        return chatRepository.findByReceiverUserId(receiverId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChatDTO> getChatsByProductId(int productId) {
        return chatRepository.findByProductProductId(productId)
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
                        message.getTimestamp()
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
}
