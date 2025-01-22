package com.nd.controller;


import java.util.List;
import java.util.Optional;

import com.nd.dto.MessageDTO;
import com.nd.entities.Chat;
import com.nd.entities.Message;
import com.nd.entities.User;
import com.nd.exceptions.ChatException;
import com.nd.exceptions.ProductException;
import com.nd.exceptions.UserException;
import com.nd.repositories.ProductRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.JwtService;
import com.nd.service.MessageService;
import com.nd.service.ProductService;
import com.nd.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ProductRepo productService;

    @Autowired
    private JwtService jwtService;


    @PostMapping("/send/{productId}")
    public ResponseEntity<Message> sendMessage(@RequestHeader("Authorization") String authHeader, @PathVariable int productId, @RequestBody MessageDTO messageDTO)
            throws UserException, ChatException, ProductException {

        int senderId= jwtService.getUserIdFromToken(authHeader);

        String content = messageDTO.getContent();
        Optional<User> user = userRepo.findById(senderId);
        if(user==null) throw new UserException("user Not found with id "+senderId);


        Chat chats = productService.getProductById(productId).getChat();  // This method should throw ChatException if the chat is not found
        if(chats==null) throw new ChatException("Chats not found");
        Message sentMessage = messageService.sendMessage(senderId, productId, content);
        return ResponseEntity.ok(sentMessage);
    }

    @GetMapping("/chat/{productId}")
    public ResponseEntity<List<Message>> getMessagesByChatId(@PathVariable int productId)
            throws ProductException, ChatException {
        List<Message> messages = messageService.getMessagesByProductId(productId);
        return ResponseEntity.ok(messages);
    }
}

