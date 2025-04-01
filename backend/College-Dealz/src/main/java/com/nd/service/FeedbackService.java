package com.nd.service;

import com.nd.entities.Feedback;

import java.util.List;

public interface FeedbackService {
    Feedback submitFeedback(Feedback feedback, String authHeader);
    List<Feedback> getAllFeedback();
    void deleteFeedback(int feedbackId);
}