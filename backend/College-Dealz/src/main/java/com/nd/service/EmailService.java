package com.nd.service;

import com.nd.dto.OtpResponse;
import com.nd.dto.ReportEmailRequest;

public interface EmailService {
    void sendProductReportEmail(ReportEmailRequest reportEmailRequest, int id);

    void sendUserReportEmail(ReportEmailRequest reportEmailRequest ,int id);

    OtpResponse sendOtp(String email);

    boolean verifyOtp(String email, String otp);

    boolean resendOtp(String email);

     boolean isEmailVerified(String email);

     void removeVerifiedEmail(String email);

}