package com.nd.controller;


import com.nd.dto.NotificationDto;
import com.nd.service.JwtService;
import com.nd.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;

    public NotificationController(NotificationService notificationService, JwtService jwtUtil) {
        this.notificationService = notificationService;
        this.jwtService = jwtUtil;
    }

    @GetMapping
    public List<NotificationDto> getUserNotifications(@RequestHeader("Authorization") String authHeader) {
        // Extract userId from JWT token
        int userId = jwtService.getUserIdFromToken(authHeader);
        return notificationService.getUserNotifications(userId);
    }

    @PostMapping("/create")
    public void createNotificationForAllUsers(@RequestHeader("Authorization") String authHeader,
                                   @RequestParam int itemId) {
        // Extract userId from JWT token
        int addedByUserId = jwtService.getUserIdFromToken(authHeader);
        notificationService.createNotificationForAllUsers(addedByUserId, itemId);
    }
}
