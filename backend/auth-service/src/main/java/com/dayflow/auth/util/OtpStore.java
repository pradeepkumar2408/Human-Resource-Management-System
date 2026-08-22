package com.dayflow.auth.util;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpStore {

    // Maps email -> active OTP code
    private final Map<String, String> otpMap = new ConcurrentHashMap<>();

    public void storeOtp(String email, String otpCode) {
        if (email != null && otpCode != null) {
            otpMap.put(email.trim().toLowerCase(), otpCode.trim());
        }
    }

    public String getOtp(String email) {
        if (email == null) return null;
        return otpMap.get(email.trim().toLowerCase());
    }

    public boolean validateOtp(String email, String inputOtp) {
        if (email == null || inputOtp == null) return false;
        String storedOtp = getOtp(email);
        if (storedOtp == null) return false;
        return storedOtp.equalsIgnoreCase(inputOtp.trim());
    }

    public void removeOtp(String email) {
        if (email != null) {
            otpMap.remove(email.trim().toLowerCase());
        }
    }
}
