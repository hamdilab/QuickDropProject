package com.quickdrop.tracking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating order tracking.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingDTO {

    @NotNull(message = "Order ID is required")
    private String orderId;

    @NotNull(message = "Driver ID is required")
    private String driverId;

    @NotNull(message = "Customer ID is required")
    private String customerId;

    @NotNull(message = "Restaurant location is required")
    private LocationDTO restaurantLocation;

    @NotNull(message = "Customer location is required")
    private LocationDTO customerLocation;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationDTO {
        private Double longitude;
        private Double latitude;
    }
}
