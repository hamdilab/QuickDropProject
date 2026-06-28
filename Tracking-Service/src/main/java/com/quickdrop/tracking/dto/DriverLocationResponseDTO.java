package com.quickdrop.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for driver location.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverLocationResponseDTO {

    private String id;
    private String driverId;
    private Double longitude;
    private Double latitude;
    private Double speed;
    private Integer heading;
    private Double accuracy;
    private String status;
    private String currentOrderId;
    private java.time.LocalDateTime timestamp;
    private Double distanceFromTarget; // in meters
}
