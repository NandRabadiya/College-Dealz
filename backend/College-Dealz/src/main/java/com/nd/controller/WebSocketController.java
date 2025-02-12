package com.nd.controller;

import com.nd.dto.MessageDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;

@Controller
public class WebSocketController {

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public MessageDTO sendMessage(MessageDTO message) {
        message.setTimestamp(LocalDateTime.now()); // Set timestamp before sending
        return message; // This message will be sent to all subscribed clients
    }
}
