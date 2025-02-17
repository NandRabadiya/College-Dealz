package com.nd.controller;

import java.util.List;

import com.nd.dto.MessageDTO;
import com.nd.entities.Chat;
import com.nd.entities.Message;
import com.nd.entities.Product;
import com.nd.entities.User;
import com.nd.exceptions.ChatException;
import com.nd.exceptions.ProductException;
import com.nd.exceptions.UserException;
import com.nd.repositories.ProductRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.JwtService;
import com.nd.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    private ProductRepo productRepo;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/send/{productId}")
    public ResponseEntity<Message> sendMessage(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int productId,
            @RequestBody MessageDTO messageDTO
    ) throws UserException, ChatException, ProductException {
        try{
        String token = authHeader.replace("Bearer ", ""); // Ensure correct token extraction
        int senderId = jwtService.getUserIdFromToken(token);

        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new UserException("User not found with ID: " + senderId));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ProductException("Product not found with ID: " + productId));

        // Let MessageService handle chat retrieval/creation
        Message sentMessage = messageService.sendMessage(senderId, productId, messageDTO.getContent());

        return ResponseEntity.ok(sentMessage);}
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new Message());
        }
    }

    @GetMapping("/chat/{productId}")
    public ResponseEntity<List<Message>> getMessagesByChatId(@PathVariable int productId)
            throws ProductException, ChatException {

        List<Message> messages = messageService.getMessagesByProductId(productId);

        if (messages.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(messages);
    }

}
