package com.nd.entities;

import com.nd.enums.Category;
import com.nd.enums.WantlistRemovalReason;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "archived_wantlist")
public class ArchivedWantlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "archived_wantlist_id", nullable = false)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId; // ID of the user who created the original wantlist

    @Column(name = "product_name")
    private String productName; // Name of the requested product

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Category category; // Category of the requested product

    @Column(name = "description")
    private String description; // Description of the product

    @Column(name = "price_max")
    private int priceMax; // Maximum price user was willing to pay

    @Column(name = "months_old_max")
    private int monthsOldMax; // Maximum product age user accepted

    @Column(name = "removed_at", nullable = false)
    private Instant removedAt; // Timestamp when the user removed the request

    @Column(name = "active_duration_days")
    private long activeDurationDays; // How long the request was active

    @Enumerated(EnumType.STRING)
    @Column(name = "matched", nullable = false)
    private WantlistRemovalReason wantlistRemovalReason;// Reason why the user removed it
}
