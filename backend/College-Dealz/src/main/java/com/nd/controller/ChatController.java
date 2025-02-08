package com.nd.controller;

import com.nd.dto.ChatDTO;
import com.nd.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatDTO> createChat(@RequestBody ChatDTO chatDTO) {
        ChatDTO createdChat = chatService.createChat(chatDTO);
        return ResponseEntity.ok(createdChat);
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<ChatDTO> getChatById(@PathVariable int chatId) {
        return ResponseEntity.ok(chatService.getChatById(chatId));
    }

    @GetMapping("/sender/{senderId}")
    public ResponseEntity<List<ChatDTO>> getChatsBySenderId(@PathVariable int senderId) {
        return ResponseEntity.ok(chatService.getChatsBySenderId(senderId));
    }

    @GetMapping("/receiver/{receiverId}")
    public ResponseEntity<List<ChatDTO>> getChatsByReceiverId(@PathVariable int receiverId) {
        return ResponseEntity.ok(chatService.getChatsByReceiverId(receiverId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ChatDTO>> getChatsByProductId(@PathVariable int productId) {
        return ResponseEntity.ok(chatService.getChatsByProductId(productId));
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<String> deleteChat(@PathVariable int chatId) {
        chatService.deleteChat(chatId);
        return ResponseEntity.ok("Chat deleted successfully");
    }
}
