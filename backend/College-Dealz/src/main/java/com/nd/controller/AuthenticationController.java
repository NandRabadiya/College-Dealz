package com.nd.controller;

import com.nd.dto.AuthResponse;
import com.nd.dto.OtpResponse;
import com.nd.dto.UserRegisterRequest;
import com.nd.entities.User;
import com.nd.service.AuthenticationService;
import com.nd.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthenticationController {

    private final AuthenticationService authService;
    private final EmailService emailService;

    public AuthenticationController(AuthenticationService authService, EmailService emailService) {
        this.authService = authService;
        this.emailService = emailService;
    }

//    @PostMapping("/register")
//    public ResponseEntity<AuthResponse> register(
//            @RequestBody User request
//    ) {
//
//        System.out.println("\n\n in authentication controller "+request+"\n\n");
//        return ResponseEntity.ok(authService.register(request));
//    }


    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody UserRegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody User request
    ) {
        return new ResponseEntity<AuthResponse>(authService.authenticate(request),HttpStatus.OK);



    }

    @PostMapping("/send-otp")
    public ResponseEntity<OtpResponse> sendOtp(@RequestParam String email) {

        System.out.println("\n\n"+email+"\n\n");
            return ResponseEntity.ok(emailService.sendOtp(email));

    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestParam String email) {
        if (emailService.resendOtp(email)) {
            return ResponseEntity.ok("A new OTP has been sent to your email.");
        }
        return ResponseEntity.badRequest().body("Please wait a moment before requesting a new OTP.");
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        if (emailService.verifyOtp(email, otp)) {
            return ResponseEntity.ok("OTP verified successfully.");
        }
        return ResponseEntity.badRequest().body("Invalid OTP. Please try again.");
    }

    @PostMapping("/refresh_token")
    public ResponseEntity<?> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return authService.refreshToken(request, response);
    }
}
