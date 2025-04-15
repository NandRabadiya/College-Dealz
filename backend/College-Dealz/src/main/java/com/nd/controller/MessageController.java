package com.nd.controller;

import java.util.List;
import java.util.Map;

import com.nd.dto.ChatDTO;
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
import com.nd.service.ChatService;
import com.nd.service.JwtService;
import com.nd.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;
   @Autowired
    private SimpMessagingTemplate messagingTemplate;


    // REST endpoint to get messages from a chat
    @GetMapping("/chats/{chatId}/messages")
    public ResponseEntity<List<MessageDTO>> getChatMessages(@PathVariable int chatId) {
        List<MessageDTO> messages = messageService.getMessagesByChatId(chatId);
        return ResponseEntity.ok(messages);
    }

    // REST endpoint to send a message through HTTP
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody MessageDTO messageDTO) {
        int senderId = messageDTO.getSenderId();
        int receiverId = messageDTO.getReceiverId();
        int chatId = messageDTO.getChatId();
        String content = messageDTO.getContent();

        MessageDTO messageDTO1 = messageService.createMessage(senderId, receiverId, content, chatId);

        // Notify subscribers
        messagingTemplate.convertAndSend("/topic/chat/" + chatId, messageDTO1);

        return ResponseEntity.ok().build();
    }

    // WebSocket handler for sending messages
    @MessageMapping("/chat.sendMessage/{chatId}")
    public void handleChatMessage(@DestinationVariable int chatId, @Payload Map<String, Object> payload) {
        int senderId = (int) payload.get("senderId");
        int receiverId = (int) payload.get("receiverId");
        String content = (String) payload.get("content");


        MessageDTO messageDTO = messageService.createMessage(senderId, receiverId, content, chatId);

        // Send message to subscribers of this chat
        //messagingTemplate.convertAndSend("/topic/chat/" + chatId, messageDTO);
        messagingTemplate.convertAndSendToUser(String.valueOf(senderId),
                "/queue/chat/" + chatId,
                messageDTO);
        messagingTemplate.convertAndSendToUser(String.valueOf(receiverId),
                "/queue/chat/" + chatId,
                messageDTO);

    }

}
