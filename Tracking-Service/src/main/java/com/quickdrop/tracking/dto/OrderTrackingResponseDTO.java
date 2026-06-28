package com.quickdrop.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for order tracking.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingResponseDTO {

    private String id;
    private String orderId;
    private String driverId;
    private String customerId;
    private OrderTrackingDTO.LocationDTO restaurantLocation;
    private OrderTrackingDTO.LocationDTO customerLocation;
    private OrderTrackingDTO.LocationDTO currentDriverLocation;
    private String status;
    private Integer estimatedArrivalMinutes;
    private LocalDateTime actualDeliveryTime;
    private LocalDateTime pickupTime;
    private List<TrackingEventDTO> events;
    private LocalDateTime lastUpdated;
    private Double distanceToDestinationKm;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrackingEventDTO {
        private String eventType;
        private String description;
        private LocalDateTime timestamp;
        private Double longitude;
        private Double latitude;
        private Integer etaMinutes;
    }
}
