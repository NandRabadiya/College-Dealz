package com.nd.config;

import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.stereotype.Component;

@Component
public class CustomWebSocketHandler extends TextWebSocketHandler {

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Called when a new WebSocket connection is established
        System.out.println("New WebSocket connection established with session ID: " + session.getId());

        // Here, you can add additional logic like adding the session to a session manager
        // or storing user info, etc. You can access the authenticated user info from the
        // session attributes if needed.
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // This method is called when a message is received from the client

        System.out.println("Message received from client: " + message.getPayload());

        // Echo the message back to the client (you can replace this with actual processing logic)
        session.sendMessage(new TextMessage("Message received: " + message.getPayload()));

        // You can also add additional logic here to handle different types of messages
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        // This method is called if an error occurs while handling the WebSocket connection
        System.err.println("Error with WebSocket session " + session.getId() + ": " + exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        // Called when the WebSocket connection is closed
        System.out.println("WebSocket connection closed with session ID: " + session.getId());

        // You can add logic to clean up or handle closed sessions, such as removing them from a session pool
    }

    @Override
    public boolean supportsPartialMessages() {
        // Return true if partial messages are supported (default is false)
        return false;
    }
}
