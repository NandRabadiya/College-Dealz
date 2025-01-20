package com.nd.service;

import com.nd.dto.NotificationDto;

import java.util.List;

public interface NotificationService {

    List<NotificationDto> getUserNotifications(int userId);

    void createNotificationForAllUsers(int addedByUserId, int itemId);
}
