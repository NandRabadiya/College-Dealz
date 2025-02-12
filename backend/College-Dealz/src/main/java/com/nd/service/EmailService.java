package com.nd.service;

import com.nd.dto.ReportEmailRequest;

public interface EmailService {
    void sendProductReportEmail(ReportEmailRequest reportEmailRequest, int id);

    void sendUserReportEmail(ReportEmailRequest reportEmailRequest ,int id);
}