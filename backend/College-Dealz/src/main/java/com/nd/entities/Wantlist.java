package com.nd.entities;

import com.nd.enums.Category;
import com.nd.enums.Condition;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "wantlist")
public class Wantlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wantlist_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // User who created the wantlist

    @Size(max = 255)
    @Column(name = "product_name")
    private String productName; // User's desired product name (could be partially filled)

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Category category; // Desired category (for matching)

    @Column(name = "description")
    private String description;

    @Column(name = "price_min")
    private int priceMin; // Minimum price user is willing to pay

    @Column(name = "price_max")
    private int priceMax; // Maximum price user is willing to pay

    @Column(name = "months_old_max")
    private int monthsOldMax; // Maximum months old for the product (if applicable)

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
