package com.nd.entities;

import com.nd.enums.Category;
import com.nd.enums.Condition;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @NotNull
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull
    @Enumerated(EnumType.STRING) // Store as string in the database
    @Column(name = "conditions", nullable = false)
    private Condition condition;


    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "product", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<Image> images;


    @Column(name = "months_old")
    private Integer monthsOld;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "post_date")
    private Instant postDate;

    @Size(max = 255)
    @Column(name = "location")
    private String location;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "university_id", nullable = false)
    private University university;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;



}