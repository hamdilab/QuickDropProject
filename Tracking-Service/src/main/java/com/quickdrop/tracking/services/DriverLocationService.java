package com.quickdrop.tracking.services;

import com.quickdrop.tracking.dto.DriverLocationDTO;
import com.quickdrop.tracking.dto.DriverLocationResponseDTO;

import java.util.List;

/**
 * Service interface for driver location management.
 */
public interface DriverLocationService {

    /**
     * Update or create driver location.
     */
    DriverLocationResponseDTO updateDriverLocation(DriverLocationDTO locationDTO);

    /**
     * Get current location of a driver.
     */
    DriverLocationResponseDTO getDriverLocation(String driverId);

    /**
     * Find all drivers near a specific location.
     */
    List<DriverLocationResponseDTO> findNearbyDrivers(
            Double longitude,
            Double latitude,
            Integer radiusMeters
    );

    /**
     * Find all drivers with a specific status.
     */
    List<DriverLocationResponseDTO> getDriversByStatus(String status);

    /**
     * Calculate distance between two points using Haversine formula.
     */
    double calculateDistance(
            double lon1, double lat1,
            double lon2, double lat2
    );

    /**
     * Update driver status.
     */
    DriverLocationResponseDTO updateDriverStatus(String driverId, String status);
}
