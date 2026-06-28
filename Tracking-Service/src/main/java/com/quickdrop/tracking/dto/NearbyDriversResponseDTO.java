package com.quickdrop.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for nearby drivers search.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NearbyDriversResponseDTO {

    private List<DriverLocationResponseDTO> nearbyDrivers;
    private Integer totalFound;
    private Double searchRadiusKm;
    private Double centerLongitude;
    private Double centerLatitude;
}
