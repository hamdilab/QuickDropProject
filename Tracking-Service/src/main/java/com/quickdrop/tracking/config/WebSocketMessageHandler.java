package com.quickdrop.tracking.config;

import com.quickdrop.tracking.dto.DriverLocationResponseDTO;
import com.quickdrop.tracking.repositories.DriverLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;

import java.util.List;

/**
 * WebSocket message handler for real-time driver location updates.
 * Broadcasts location updates to subscribed clients.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class WebSocketMessageHandler {

    private final SimpMessagingTemplate messagingTemplate;
    private final DriverLocationRepository driverLocationRepository;

    /**
     * Broadcast driver location updates every 5 seconds.
     * This is a simple implementation - in production, you might want to
     * use events triggered by location updates instead of polling.
     */
    @Scheduled(fixedRate = 5000) // Every 5 seconds
    public void broadcastLocationUpdates() {
        try {
            // Get all active drivers
            List<com.quickdrop.tracking.entities.DriverLocation> activeDrivers =
                    driverLocationRepository.findAll();

            for (com.quickdrop.tracking.entities.DriverLocation driver : activeDrivers) {
                DriverLocationResponseDTO responseDTO = convertToResponseDTO(driver);

                // Broadcast to specific driver topic
                messagingTemplate.convertAndSend(
                        "/topic/driver/" + driver.getDriverId(),
                        responseDTO
                );

                // Broadcast to all clients
                messagingTemplate.convertAndSend(
                        "/topic/locations",
                        responseDTO
                );
            }
        } catch (Exception e) {
            log.error("Error broadcasting location updates: {}", e.getMessage(), e);
        }
    }

    /**
     * Broadcast order status updates.
     */
    public void broadcastOrderUpdate(String orderId, Object orderData) {
        try {
            messagingTemplate.convertAndSend(
                    "/topic/order/" + orderId,
                    orderData
            );
        } catch (Exception e) {
            log.error("Error broadcasting order update: {}", e.getMessage(), e);
        }
    }

    /**
     * Broadcast ETA updates.
     */
    public void broadcastETAUpdate(String orderId, Object etaData) {
        try {
            messagingTemplate.convertAndSend(
                    "/topic/eta/" + orderId,
                    etaData
            );
        } catch (Exception e) {
            log.error("Error broadcasting ETA update: {}", e.getMessage(), e);
        }
    }

    private DriverLocationResponseDTO convertToResponseDTO(
            com.quickdrop.tracking.entities.DriverLocation driver) {

        DriverLocationResponseDTO dto = new DriverLocationResponseDTO();
        dto.setId(driver.getId());
        dto.setDriverId(driver.getDriverId());
        dto.setLongitude(driver.getCoordinates().getCoordinates()[0]);
        dto.setLatitude(driver.getCoordinates().getCoordinates()[1]);
        dto.setSpeed(driver.getSpeed());
        dto.setHeading(driver.getHeading());
        dto.setAccuracy(driver.getAccuracy());
        dto.setStatus(driver.getStatus());
        dto.setCurrentOrderId(driver.getCurrentOrderId());
        dto.setTimestamp(driver.getTimestamp());

        return dto;
    }
}
