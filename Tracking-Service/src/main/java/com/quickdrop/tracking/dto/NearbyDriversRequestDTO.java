package com.quickdrop.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for nearby drivers search.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NearbyDriversRequestDTO {

    private Double longitude;
    private Double latitude;
    private Integer radiusMeters; // Default: 5000 meters (5km)

    public NearbyDriversRequestDTO(Double longitude, Double latitude) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.radiusMeters = 5000; // 5km default
    }
}
