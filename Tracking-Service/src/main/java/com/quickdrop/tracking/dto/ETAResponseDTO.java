package com.quickdrop.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for ETA calculation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ETAResponseDTO {

    private Integer estimatedMinutes;
    private Double distanceKm;
    private String routeDescription;
    private Double averageSpeed;
}
