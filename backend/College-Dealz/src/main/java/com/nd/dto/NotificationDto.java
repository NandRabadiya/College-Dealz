package com.nd.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nd.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
public class NotificationDto {

    @NotNull(message = "Notification ID cannot be null")
    private Integer id;

    @JsonIgnore
    @NotNull(message = "User ID cannot be null")
    private List<Integer> userIds; // Representing the User entity by its ID

  //  @NotBlank(message = "Type cannot be blank")
 //   @Size( message = "Type must not exceed 50 characters")
    private NotificationType type;

   // @NotBlank(message = "Title cannot be blank")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Message cannot be blank")
    private String message;

    @NotNull(message = "Read status cannot be null")
    private Boolean isRead=false;

    private Integer referenceId;

    @Size(max = 50, message = "Reference type must not exceed 50 characters")
    private String referenceType;
}
