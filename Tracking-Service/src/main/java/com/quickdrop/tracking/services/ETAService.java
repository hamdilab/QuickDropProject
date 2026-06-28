package com.quickdrop.tracking.services;

import com.quickdrop.tracking.dto.ETAResponseDTO;
import com.quickdrop.tracking.entities.DriverLocation;

/**
 * Service interface for ETA (Estimated Time of Arrival) calculation.
 */
public interface ETAService {

    /**
     * Calculate ETA between two points.
     */
    ETAResponseDTO calculateETA(
            Double currentLongitude,
            Double currentLatitude,
            Double destinationLongitude,
            Double destinationLatitude,
            String driverId
    );

    /**
     * Calculate ETA using driver's current location.
     */
    ETAResponseDTO calculateETAFromCurrentLocation(
            String driverId,
            Double destinationLongitude,
            Double destinationLatitude
    );

    /**
     * Calculate estimated distance between two points.
     */
    double calculateDistance(
            Double lon1,
            Double lat1,
            Double lon2,
            Double lat2
    );

    /**
     * Estimate arrival time based on current speed and distance.
     */
    Integer estimateArrivalMinutes(
            double distanceKm,
            Double currentSpeed
    );

    /**
     * Get driver's current speed from last known location.
     */
    Double getCurrentSpeed(String driverId);
}
