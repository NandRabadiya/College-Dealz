package com.nd.service.Impl;

import com.nd.dto.NotificationDto;
import com.nd.entities.Notification;
import com.nd.entities.User;
import com.nd.enums.NotificationType;
import com.nd.repositories.NotificationRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.NotificationService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
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
        // Fetch notifications from the database and map to DTOs
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void createNotificationForAllUsers(int addedByUserId, int itemId) {
        User addedByUser = userRepository.findById(addedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + addedByUserId));
        int universityId = addedByUser.getUniversity().getId();

        List<Integer> allUserIds=userRepository.findUserIdsByUniversityId(universityId);

        List<Notification> notifications = allUserIds.stream()
                .filter(userId -> !userId.equals(addedByUserId)) // Exclude the user who added the item
                .map(userId -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

                    Notification notification = new Notification();
                    notification.setUser(user);
                    notification.setType(NotificationType.ITEM_INTEREST);
                    notification.setTitle("New Item in Wantlist");
                    notification.setMessage("User " + addedByUserId + " added a new item with ID: " + itemId);
                    notification.setIsRead(false);
                    notification.setCreatedAt(Instant.now());
                    notification.setReferenceId(addedByUserId);
                    notification.setReferenceType("WantList_item");
                    return notification;
                })
                .collect(Collectors.toList());

        notificationRepository.saveAll(notifications); // Save all notifications in a single batch
    }

    @Override
    public void markNotificationAsRead(int notificationId) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));

    notification.setIsRead(true);

    notificationRepository.save(notification);

    }

    // Helper method to map Entity to DTO
    private NotificationDto mapToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUser().getId());
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead());
        dto.setReferenceId(notification.getReferenceId());
        dto.setReferenceType(notification.getReferenceType());
        return dto;
    }
}
