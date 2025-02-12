package com.nd.controller;

import com.nd.entities.Feedback;
import com.nd.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*") // Allow frontend access
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @PostMapping("/")
    public Feedback submitFeedback(@RequestBody Feedback feedback , @RequestHeader("Authorization") String authHeader) {
        return feedbackService.submitFeedback(feedback , authHeader);
    }

    @GetMapping
    public List<Feedback> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }
}