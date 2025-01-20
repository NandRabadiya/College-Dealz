package com.nd.entities;

import com.nd.enums.NotificationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @Column(name = "notification_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 50)
    @NotNull
    @Column(name = "type", length = 50)
    private NotificationType type;

    @Size(max = 255)
    @NotNull
    @Column(name = "title")
    private String title;

    @NotNull
    @Lob
    @Column(name = "message", nullable = false)
    private String message;

    @ColumnDefault("0")
    @Column(name = "is_read")
    private Boolean isRead;

    @Column(name = "reference_id")
    private Integer referenceId;

    @Size(max = 50)
    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;


}