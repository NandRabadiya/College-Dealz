package com.nd.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name ="chats")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "sender_id", referencedColumnName = "user_id")
    private User sender;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "receiver_id", referencedColumnName = "user_id")
    private User receiver;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "product_id", referencedColumnName = "product_id")
    private Product product;  // This is the context of the chat



    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages;

    public Chat() {
        this.messages = new ArrayList<>();
    }

    public Chat(User sender, User receiver, Product product) {
        this.sender = sender;
        this.receiver = receiver;
        this.product = product;
        this.messages = new ArrayList<>();
    }

    public void addMessage(Message message) {
        this.messages.add(message);
        message.setChat(this);
    }
}
