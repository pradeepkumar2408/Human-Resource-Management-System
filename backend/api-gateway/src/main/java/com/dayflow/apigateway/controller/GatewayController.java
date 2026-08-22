package com.dayflow.apigateway.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS
})
public class GatewayController {

    private final RestTemplate restTemplate = new RestTemplate();

    @RequestMapping(value = "/api/**", method = {
            RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH
    })
    public ResponseEntity<Object> routeRequest(HttpServletRequest request, @RequestBody(required = false) Object body) {
        String path = request.getRequestURI(); // e.g. /api/admin/employees
        String query = request.getQueryString(); // e.g. name=John
        String method = request.getMethod();

        // Determine target base URL based on sub-service routes
        String targetBaseUrl;
        if (path.startsWith("/api/admin/employees") || path.startsWith("/api/auth") || path.startsWith("/api/employees")) {
            targetBaseUrl = "http://localhost:8101";
        } else if (path.startsWith("/api/admin/attendance") || path.startsWith("/api/attendance")) {
            targetBaseUrl = "http://localhost:8112";
        } else if (path.startsWith("/api/admin/leaves") || path.startsWith("/api/leaves")) {
            targetBaseUrl = "http://localhost:8113";
        } else if (path.startsWith("/api/admin/payroll") || path.startsWith("/api/payroll")) {
            targetBaseUrl = "http://localhost:8116";
        } else if (path.startsWith("/api/reports")) {
            targetBaseUrl = "http://localhost:8115";
        } else if (path.startsWith("/api/notifications")) {
            targetBaseUrl = "http://localhost:8114";
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Route not found in API Gateway");
        }

        // Build destination URI
        String destUrl = targetBaseUrl + path + (query != null ? "?" + query : "");
        try {
            URI uri = new URI(destUrl);
            HttpHeaders headers = new HttpHeaders();
            
            // Copy all incoming headers (Content-Type, User-Agent, X-Employee-Id, etc.)
            Collections.list(request.getHeaderNames()).forEach(headerName -> {
                headers.add(headerName, request.getHeader(headerName));
            });

            HttpEntity<Object> httpEntity = new HttpEntity<>(body, headers);
            try {
                return restTemplate.exchange(uri, HttpMethod.valueOf(method), httpEntity, Object.class);
            } catch (org.springframework.web.client.ResourceAccessException ex) {
                if (targetBaseUrl.contains("8101")) {
                    String fallbackUrl = destUrl.replace("8101", "8102");
                    try {
                        return restTemplate.exchange(new java.net.URI(fallbackUrl), HttpMethod.valueOf(method), httpEntity, Object.class);
                    } catch (Exception e) {
                        throw ex;
                    }
                }
                throw ex;
            }

        } catch (HttpStatusCodeException e) {
            // Forward HTTP error codes (like 400 Bad Request, 404 Not Found) exactly back to frontend
            return ResponseEntity.status(e.getStatusCode())
                    .headers(e.getResponseHeaders())
                    .body(e.getResponseBodyAsString());
        } catch (URISyntaxException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("URI Syntax Error: " + e.getMessage());
        }
    }
}
