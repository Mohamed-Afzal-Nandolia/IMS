package com.IMS.inventory_management_system.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;


@Slf4j
@Component
public class CronJob {

    @Value("${backendUrl}")
    String backendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Scheduled(cron = "0 * * * * ?")
    public void pingCheckAlive() {
        String url = backendUrl + "/api/v1/auth/ping";
        try {
            String response = restTemplate.getForObject(url, String.class);
            log.info("URL to pinged -> {}", url);
            log.info("Pinged /auth/ping -> Response: {}", response);
        } catch (Exception e) {
            log.error("Error while pinging /auth/ping: {}", e.getMessage(), e);
        }
    }

}
