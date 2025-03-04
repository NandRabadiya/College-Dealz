package com.nd.service.Impl;

import com.nd.dto.NotificationDto;
import com.nd.entities.Notification;
import com.nd.entities.University;
import com.nd.entities.User;
import com.nd.enums.NotificationType;
import com.nd.enums.ReferenceType;
import com.nd.repositories.NotificationRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.NotificationService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepo notificationRepository;
    private final UserRepo userRepository;

    public NotificationServiceImpl(NotificationRepo notificationRepository, UserRepo userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<NotificationDto> getUserNotifications(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        return user.getNotifications() // Directly fetch notifications from User entity
                .stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt).reversed()) // Sort by latest
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void createNotificationForAllUsers(int addedByUserId, int itemId) {
        User addedByUser = userRepository.findById(addedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + addedByUserId));

        University university = addedByUser.getUniversity();

        List<User> allUsers = userRepository.findAllByUniversity(university);
        allUsers.remove(addedByUser); // Exclude the user who created the notification

        Notification notification = new Notification();
        notification.setType(NotificationType.ITEM_INTEREST);
        notification.setTitle("New Item in Wantlist");
        notification.setMessage("User " + addedByUserId + " added a new item with ID: " + itemId);
        notification.setIsRead(false);
        notification.setCreatedAt(Instant.now());
        notification.setReferenceId(itemId);
        notification.setReferenceType(ReferenceType.WANTLIST_ITEM);

        // ✅ Set all users at once (instead of looping)
        notification.setUsers(new HashSet<>(allUsers));

        // ✅ Save notification in a single batch operation
        notificationRepository.save(notification);
    }

    @Override
    public void createNotificationForUser(int userId, String title, String message, NotificationType type, ReferenceType referenceType,int referenceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Notification notification = new Notification();
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(Instant.now());
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);


        notification.getUsers().add(user); // ✅ Ensuring user is added
        user.getNotifications().add(notification); // ✅ Maintaining bidirectional relationship

        userRepository.save(user); // ✅ Ensure user changes are saved
        notificationRepository.save(notification); // ✅ Save notification
//
//        notification.addUser(user); // ✅ Maintain bidirectional relationship
//        notificationRepository.save(notification);
    }



    @Override
    public void createNotificationForSelf(int userId, String title, String message, NotificationType type) {
  //      createNotificationForUser(userId, title, message, type);
    }

    @Override
    public void markNotificationAsRead(int notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    private NotificationDto mapToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead());
        dto.setReferenceId(notification.getReferenceId());
        dto.setReferenceType(notification.getReferenceType().toString());
        dto.setUserIds(notification.getUsers().stream().map(User::getId).collect(Collectors.toList()));
        return dto;
    }
}
