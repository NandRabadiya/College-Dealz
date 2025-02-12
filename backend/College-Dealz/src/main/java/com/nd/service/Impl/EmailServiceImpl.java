package com.nd.service.Impl;

import com.nd.dto.ReportEmailRequest;
import com.nd.repositories.ProductRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private UserRepo userRepo;

    @Override
    public void sendProductReportEmail(ReportEmailRequest reportEmailRequest, int id ) {
        SimpleMailMessage message = new SimpleMailMessage();
        String email=userRepo.findById(productRepo.getProductById(id).getSeller().getId()).get().getEmail();

        message.setTo(email);

        String productName=productRepo.getProductById(id).getName();
        message.setSubject("Your Product "+productName+" is  Reported ");
        message.setText(reportEmailRequest.getMessage());
        // Optionally, set the sender email and reply-to if needed:
         message.setFrom("22ituos003@ddu.ac.in");

        mailSender.send(message);
    }

    @Override
    public void sendUserReportEmail(ReportEmailRequest reportEmailRequest, int id ) {
        SimpleMailMessage message = new SimpleMailMessage();

        String email=userRepo.findById(id).get()
                .getEmail();
        message.setTo(email);
        message.setSubject(
                "You Are Reported "
        );
        message.setText(reportEmailRequest.getMessage());
        // Optionally, set the sender email and reply-to if needed:
        message.setFrom("22ituos003@ddu.ac.in");

        mailSender.send(message);
    }

}