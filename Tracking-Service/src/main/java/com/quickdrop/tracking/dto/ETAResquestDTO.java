package com.quickdrop.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for ETA calculation request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ETAResquestDTO {

    private Double currentLongitude;
    private Double currentLatitude;
    private Double destinationLongitude;
    private Double destinationLatitude;
    private String driverId;
    private String orderId;
}
