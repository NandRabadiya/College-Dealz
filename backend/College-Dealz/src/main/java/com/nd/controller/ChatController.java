package com.nd.controller;

import com.nd.dto.ChatDTO;
import com.nd.dto.CheckChatRequest;
import com.nd.dto.ProductDto;
import com.nd.dto.UserDto;
import com.nd.entities.Chat;
import com.nd.entities.Product;
import com.nd.entities.User;
import com.nd.service.ChatService;
import com.nd.service.ProductService;
import com.nd.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ChatDTO>> getUserChats(@PathVariable int userId) {
        List<ChatDTO> chats = chatService.getAllChatsByUser(userId);
        return ResponseEntity.ok(chats);
    }

    @PostMapping("/create")
    public ResponseEntity<ChatDTO> createChat(@RequestBody Map<String, Integer> request) {
        int senderId = request.get("senderId");
        int receiverId = request.get("receiverId");
        int productId = request.get("productId");

        ChatDTO chat = chatService.findOrCreateChat(senderId, receiverId, productId);
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<ChatDTO> getChatById(@PathVariable int chatId) {
        ChatDTO chat = chatService.getChatById(chatId);
        return ResponseEntity.ok(chat);
    }

    @PostMapping("/check")
    public ResponseEntity<Boolean> checkChats(@RequestBody CheckChatRequest checkChatRequest) {

        boolean check = chatService.checkChat(checkChatRequest);
        return ResponseEntity.ok(check);
    }
}