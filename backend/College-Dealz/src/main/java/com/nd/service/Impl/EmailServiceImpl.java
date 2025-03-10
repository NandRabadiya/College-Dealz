package com.nd.service.Impl;

import com.nd.dto.OtpResponse;
import com.nd.dto.ReportEmailRequest;
import com.nd.repositories.ProductRepo;
import com.nd.repositories.UniversityRepo;
import com.nd.repositories.UserRepo;
import com.nd.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private UniversityRepo universityRepo;

    @Override
    public void sendProductReportEmail(ReportEmailRequest reportEmailRequest, int id ) {
        SimpleMailMessage message = new SimpleMailMessage();
        String email=userRepo.findById(productRepo.getProductById(id).getSeller().getId()).get().getEmail();

        message.setTo(email);

        String productName=productRepo.getProductById(id).getName();
        message.setSubject("Warning: Your product \"" + productName + "\" violates our policies");
        message.setText("Dear user,\n\nOur team has identified an issue with your product listing: \"" + productName + "\".\n\n" +
                "Reason: " + reportEmailRequest.getMessage() + "\n\n" +
                "Please review and update your listing to comply with our guidelines. Failure to do so may result in removal of the product.\n\n" +
                "If you believe this warning was issued in error, feel free to contact our support team.\n\n" +
                "Regards,\nCollege Dealz Team");

        message.setFrom("collegedealzz@gmail.com");
        mailSender.send(message);
    }

    @Override
    public void sendUserReportEmail(ReportEmailRequest reportEmailRequest, int id ) {
        SimpleMailMessage message = new SimpleMailMessage();
        System.out.println("\n\nWARNING MESSAGE: " + reportEmailRequest.getMessage());
        String email = userRepo.findById(id).get().getEmail();

        message.setTo(email);
        message.setSubject("Warning: Policy Violation Detected on Your Account");
        message.setText("Dear user,\n\nWe have noticed an issue associated with your account:\n\n" +
                "Warning: " + reportEmailRequest.getMessage() + "\n\n" +
                "Please ensure that your activities comply with our platform's policies. Repeated violations may result in account suspension.\n\n" +
                "If you believe this warning was issued in error, feel free to contact our support team.\n\n" +
                "Regards,\nCollege Dealz Team");

        message.setFrom("collegedealzz@gmail.com");
        mailSender.send(message);
    }


    private final ConcurrentHashMap<String, OtpDetails> otpStorage = new ConcurrentHashMap<>();

    private final HashSet<String> verifiedEmails = new HashSet<>();

    private final Random random = new Random();
    private static final long OTP_EXPIRATION_MILLIS = 5 * 60 * 1000; // 5 minutes

    private static class OtpDetails {
        String otp;
        long timestamp;

        public OtpDetails(String otp, long timestamp) {
            this.otp = otp;
            this.timestamp = timestamp;
        }
    }


    public OtpResponse sendOtp(String email) {

        String domain = email.substring(email.indexOf("@") + 1);

        if(!universityRepo.existsByDomain(domain))
        {return new OtpResponse("Your University is not registered");
        }

        if(userRepo.existsByEmail(email))
        {
            return new OtpResponse("Your Email is already registered Try Login");
        }


        String otp = String.format("%06d", random.nextInt(999999)); // Generate a 6-digit OTP
        otpStorage.put(email, new OtpDetails(otp, Instant.now().toEpochMilli()));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Email Verification OTP");
        message.setText("Your OTP for email verification is: " + otp + " (Valid for 5 minutes)");

        mailSender.send(message);

        return new OtpResponse("Otp Sent Successfully to " + email);
    }

    public boolean verifyOtp(String email, String otp) {
        if (!otpStorage.containsKey(email)) return false;

        OtpDetails otpDetails = otpStorage.get(email);

        // Check expiration
        if (Instant.now().toEpochMilli() - otpDetails.timestamp > OTP_EXPIRATION_MILLIS) {
            otpStorage.remove(email);
            return false;
        }

        // Check correctness
        if (otpDetails.otp.equals(otp)) {
            otpStorage.remove(email);
            verifiedEmails.add(email);
            return true;
        }
        return false;
    }

    public boolean resendOtp(String email) {
        if (otpStorage.containsKey(email)) {
            OtpDetails otpDetails = otpStorage.get(email);

            // Prevent too frequent resending
            if (Instant.now().toEpochMilli() - otpDetails.timestamp < 60 * 1000) { // 1 min cooldown
                return false;
            }
        }
        sendOtp(email);
        return true;
    }

    public boolean isEmailVerified(String email) {
        return verifiedEmails.contains(email);
    }

    public void removeVerifiedEmail(String email) {
        verifiedEmails.remove(email);
    }

}