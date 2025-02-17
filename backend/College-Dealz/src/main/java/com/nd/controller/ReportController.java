package com.nd.controller;

import com.nd.dto.ReportEmailRequest;
import com.nd.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/user/{id}")
    public ResponseEntity<String> sendUserReportEmail(@RequestBody ReportEmailRequest reportEmailRequest, @PathVariable Integer id) {

        emailService.sendUserReportEmail(reportEmailRequest, id);
        return ResponseEntity.ok("Report email sent successfully.");
    }

    @PostMapping("/product/{id}")
    public ResponseEntity<String> sendProductReportEmail(@RequestBody ReportEmailRequest reportEmailRequest, @PathVariable Integer id) {

        emailService.sendProductReportEmail(reportEmailRequest, id);
        return ResponseEntity.ok("Report email sent successfully.");
    }

}
