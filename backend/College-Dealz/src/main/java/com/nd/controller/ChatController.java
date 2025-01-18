package com.nd.controller;

import com.nd.entities.Chat;
import com.nd.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
public class ChatController {

    @Autowired
    private ChatService chatService;




}



