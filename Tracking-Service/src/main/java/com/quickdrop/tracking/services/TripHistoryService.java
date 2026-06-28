package com.quickdrop.tracking.services;

import com.quickdrop.tracking.entities.TripHistory;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service interface for trip history management.
 */
public interface TripHistoryService {

    /**
     * Start a new trip.
     */
    TripHistory startTrip(String driverId, String orderId, TripHistory.LocationPoint startPoint);

    /**
     * Add location point to ongoing trip.
     */
    TripHistory addLocationPoint(
            String tripId,
            TripHistory.LocationPoint locationPoint
    );

    /**
     * Complete a trip.
     */
    TripHistory completeTrip(String tripId);

    /**
     * Get trip history by ID.
     */
    TripHistory getTripById(String tripId);

    /**
     * Get all trips for a driver.
     */
    List<TripHistory> getTripsByDriver(String driverId);

    /**
     * Get trips for a driver within a date range.
     */
    List<TripHistory> getTripsByDriverAndDateRange(
            String driverId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Calculate trip statistics.
     */
    TripHistory calculateTripStatistics(TripHistory trip);
}
