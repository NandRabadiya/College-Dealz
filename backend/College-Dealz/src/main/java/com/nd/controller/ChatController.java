//package com.nd.controller;
//
//import com.nd.dto.ChatDTO;
//import com.nd.service.ChatService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/chats")
//public class ChatController {
//
//    @Autowired
//    private ChatService chatService;
//
//    @PostMapping("/")
//    public ResponseEntity<ChatDTO> createChat(@RequestBody ChatDTO chatDTO) {
//        ChatDTO createdChat = chatService.createChat(chatDTO);
//        return ResponseEntity.ok(createdChat);
//    }
//
//    @GetMapping("/{chatId}")
//    public ResponseEntity<ChatDTO> getChatById(@PathVariable int chatId) {
//        return ResponseEntity.ok(chatService.getChatById(chatId));
//    }
//
//    @GetMapping("/sender/{senderId}")
//    public ResponseEntity<List<ChatDTO>> getChatsBySenderId(@PathVariable int senderId) {
//        return ResponseEntity.ok(chatService.getChatsBySenderId(senderId));
//    }
//
//    @GetMapping("/receiver/{receiverId}")
//    public ResponseEntity<List<ChatDTO>> getChatsByReceiverId(@PathVariable int receiverId) {
//        return ResponseEntity.ok(chatService.getChatsByReceiverId(receiverId));
//    }
//
//    @GetMapping("/product/{productId}")
//    public ResponseEntity<List<ChatDTO>> getChatsByProductId(@PathVariable int productId) {
//        return ResponseEntity.ok(chatService.getChatsByProductId(productId));
//    }
//
//    @DeleteMapping("/{chatId}")
//    public ResponseEntity<String> deleteChat(@PathVariable int chatId) {
//        chatService.deleteChat(chatId);
//        return ResponseEntity.ok("Chat deleted successfully");
//    }
//}


package com.nd.controller;

import com.nd.dto.ChatDTO;
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

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

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
}