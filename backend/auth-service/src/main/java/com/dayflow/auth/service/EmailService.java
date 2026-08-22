package com.dayflow.auth.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:alonewarrior123456@gmail.com}")
    private String senderEmail;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Dispatches OTP email from alonewarrior123456@gmail.com to the target registered email address.
     */
    public void sendOtpEmail(String toRegisteredEmail, String otpCode, String subject, String messagePrefix) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(senderEmail, "Dayflow HRMS Security");
            helper.setTo(toRegisteredEmail.trim());
            helper.setSubject(subject);

            String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
                        .card { max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                        .header { text-align: center; margin-bottom: 24px; }
                        .title { font-size: 20px; font-weight: 700; color: #18181b; margin: 0 0 8px 0; }
                        .subtitle { font-size: 14px; color: #71717a; margin: 0; }
                        .otp-box { background-color: #09090b; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 6px; text-align: center; padding: 16px; border-radius: 8px; margin: 24px 0; }
                        .footer { font-size: 12px; color: #a1a1aa; text-align: center; margin-top: 24px; border-top: 1px solid #f4f4f5; padding-top: 16px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="header">
                            <h2 class="title">Dayflow HRMS</h2>
                            <p class="subtitle">%s</p>
                        </div>
                        <p style="font-size: 14px; color: #27272a;">Your 6-digit OTP Verification Code is:</p>
                        <div class="otp-box">%s</div>
                        <p style="font-size: 13px; color: #71717a; line-height: 1.5;">
                            Enter this 6-digit OTP code in the application to complete verification and update your password in the database.<br>
                            <strong>Do not share this OTP code with anyone.</strong>
                        </p>
                        <div class="footer">
                            Sent automatically by Dayflow HRMS System &bull; Confidential
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(messagePrefix, otpCode);

            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            System.out.println(">>> [SENDER: " + senderEmail + "] -> Real OTP email dispatched to registered email: " + toRegisteredEmail + " [OTP: " + otpCode + "]");
        } catch (Exception e) {
            System.err.println(">>> Error sending OTP email from " + senderEmail + " to " + toRegisteredEmail + ": " + e.getMessage());
        }
    }
}
