package com.quickdrop.tracking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating driver location.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverLocationDTO {

    @NotNull(message = "Driver ID is required")
    private String driverId;

    @NotNull(message = "Coordinates are required")
    private Coordinates coordinates;

    private Double speed;

    private Integer heading;

    private Double accuracy;

    private String status;

    private String currentOrderId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Coordinates {
        private double longitude;
        private double latitude;
    }
}
