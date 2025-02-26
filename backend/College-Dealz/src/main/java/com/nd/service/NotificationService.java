package com.nd.service;

import com.nd.dto.NotificationDto;
import com.nd.enums.NotificationType;
import com.nd.enums.ReferenceType;

import java.util.List;

public interface NotificationService {

    List<NotificationDto> getUserNotifications(int userId);

    void createNotificationForAllUsers(int addedByUserId, int itemId);

    void markNotificationAsRead(int notificationId);


    void createNotificationForUser(int userId, String title, String message, NotificationType type, ReferenceType referenceType, int referenceId);

    void createNotificationForSelf(int userId, String title, String message, NotificationType type);
}
