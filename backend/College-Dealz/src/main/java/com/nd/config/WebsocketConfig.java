package com.nd.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocketMessageBroker
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // Clients subscribe to topics
        config.setApplicationDestinationPrefixes("/app"); // Clients send messages here
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the WebSocket endpoint and add a custom Handshake Interceptor for token authentication
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173") // Allowing the frontend to connect
                //.addInterceptors(new HttpSessionHandshakeInterceptor()) // Handshake Interceptor for JWT token
                .withSockJS(); // Fallback for non-WebSocket clients
    }
}
