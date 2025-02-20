package com.nd.service.Impl;

import com.nd.entities.Feedback;
import com.nd.repositories.FeedbackRepo;
import com.nd.service.FeedbackService;
import com.nd.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackRepo feedbackRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private JwtService  jwtService;

    @Override
    public Feedback submitFeedback(Feedback feedback, String authHeader) {
        // Save feedback to database


        String sender_email=jwtService.getEmailFromToken(authHeader);

        Feedback savedFeedback = feedbackRepository.save(feedback);

        // Send Email Notification
        sendFeedbackEmail(feedback , sender_email);

        return savedFeedback;
    }

    @Override
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    private void sendFeedbackEmail(Feedback feedback ,String sender_email) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
       mailMessage.setTo("nandrabadiyagcp@gmail.com");
       // mailMessage.setTo("venupatel004@gmail.com");// Change this to the email that receives feedback
        mailMessage.setSubject("New FeedBack from " + feedback.getName());
        mailMessage.setText("Sender Name: " + feedback.getName() + "\nSender Email: " + sender_email +
                "\n\nFeedback:\n" + feedback.getMessage());

        mailMessage.setReplyTo(sender_email);

        mailSender.send(mailMessage);
    }
}