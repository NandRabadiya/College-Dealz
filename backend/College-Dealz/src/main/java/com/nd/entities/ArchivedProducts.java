package com.nd.entities;

import com.nd.enums.Category;
import com.nd.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@Entity
@Table(name = "archived_products")
public class ArchivedProducts {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int productId;

    @Column(nullable = false)
    private String title;

    @Column(length = 5000)
    private String description;

    @Column(nullable = false)
    private Category category;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal finalSoldPrice;

    @Column(nullable = false)
    private int sellerId;

    @Column
    private int buyerId;

    @Column(nullable = false)
    private LocalDateTime listingDate;

    @Column(nullable = false)
    private LocalDateTime statusChangeDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status;

    @Column
    private String reasonForRemoval;

    @Column
    private boolean SoldToCollegeStudent;

    @Column(nullable = false)
    private Long dealCompletionTime;

    @Column(nullable = false)
    private int universityId;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;
}

