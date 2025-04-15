package com.nd.config;

import com.nd.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

@Configuration
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtService jwtUtil; // or your JWT service

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                try {
                    String userId = String.valueOf(jwtUtil.getUserIdFromToken(token));
                    System.out.println("WebSocket connection for user: " + userId);
                    accessor.setUser(new UsernamePasswordAuthenticationToken(userId, null, List.of()));
                } catch (Exception e) {
                    System.out.println("WebSocket JWT validation failed: " + e.getMessage());
                }
            }
        }

        return message;
    }
}
