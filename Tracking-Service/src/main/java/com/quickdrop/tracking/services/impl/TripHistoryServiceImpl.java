package com.quickdrop.tracking.services.impl;

import com.quickdrop.tracking.entities.DriverLocation;
import com.quickdrop.tracking.entities.TripHistory;
import com.quickdrop.tracking.repositories.DriverLocationRepository;
import com.quickdrop.tracking.repositories.TripHistoryRepository;
import com.quickdrop.tracking.services.TripHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementation of TripHistoryService.
 * Manages driver trip history and statistics.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TripHistoryServiceImpl implements TripHistoryService {

    private final TripHistoryRepository tripHistoryRepository;
    private final DriverLocationRepository driverLocationRepository;

    @Override
    public TripHistory startTrip(String driverId, String orderId, TripHistory.LocationPoint startPoint) {
        log.debug("Starting trip for driver: {}, order: {}", driverId, orderId);

        TripHistory tripHistory = new TripHistory();
        tripHistory.setDriverId(driverId);
        tripHistory.setOrderId(orderId);
        tripHistory.setLocationPoints(new ArrayList<>());
        tripHistory.setStartLocation(startPoint.getLocation());
        tripHistory.setDestinationLocation(null);
        tripHistory.setStartTime(LocalDateTime.now());
        tripHistory.setEndTime(null);
        tripHistory.setTotalDistanceKm(0.0);
        tripHistory.setTotalDurationMinutes(0);
        tripHistory.setStatus("IN_PROGRESS");
        tripHistory.setAverageSpeed(0.0);

        // Add start point to location points
        tripHistory.getLocationPoints().add(startPoint);

        TripHistory saved = tripHistoryRepository.save(tripHistory);
        return saved;
    }

    @Override
    public TripHistory addLocationPoint(String tripId, TripHistory.LocationPoint locationPoint) {
        log.debug("Adding location point to trip: {}", tripId);

        TripHistory tripHistory = tripHistoryRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));

        if (!"IN_PROGRESS".equals(tripHistory.getStatus())) {
            throw new RuntimeException("Cannot add location point to completed trip");
        }

        // Update destination if not set
        if (tripHistory.getDestinationLocation() == null) {
            // You might want to fetch this from order tracking service
        }

        // Add location point
        tripHistory.getLocationPoints().add(locationPoint);

        // Calculate statistics
        calculateTripStatistics(tripHistory);

        tripHistory = tripHistoryRepository.save(tripHistory);
        return tripHistory;
    }

    @Override
    public TripHistory completeTrip(String tripId) {
        log.debug("Completing trip: {}", tripId);

        TripHistory tripHistory = tripHistoryRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));

        if (!"IN_PROGRESS".equals(tripHistory.getStatus())) {
            throw new RuntimeException("Trip is not in progress");
        }

        // Set end time
        LocalDateTime endTime = LocalDateTime.now();
        tripHistory.setEndTime(endTime);

        // Calculate duration
        long durationMinutes = ChronoUnit.MINUTES.between(tripHistory.getStartTime(), endTime);
        tripHistory.setTotalDurationMinutes((int) durationMinutes);

        // Calculate final statistics
        calculateTripStatistics(tripHistory);

        // Update status
        tripHistory.setStatus("COMPLETED");

        TripHistory saved = tripHistoryRepository.save(tripHistory);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public TripHistory getTripById(String tripId) {
        log.debug("Getting trip by ID: {}", tripId);

        return tripHistoryRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripHistory> getTripsByDriver(String driverId) {
        log.debug("Getting trips for driver: {}", driverId);

        return tripHistoryRepository.findByDriverIdOrderByStartTimeDesc(driverId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripHistory> getTripsByDriverAndDateRange(
            String driverId,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        log.debug("Getting trips for driver: {} between {} and {}", driverId, startDate, endDate);

        return tripHistoryRepository.findByDriverIdAndStartTimeBetween(
                driverId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public TripHistory calculateTripStatistics(TripHistory tripHistory) {
        log.debug("Calculating statistics for trip: {}", tripHistory.getId());

        List<TripHistory.LocationPoint> points = tripHistory.getLocationPoints();

        if (points == null || points.isEmpty()) {
            return tripHistory;
        }

        // Calculate total distance
        double totalDistance = 0.0;
        for (int i = 1; i < points.size(); i++) {
            double distance = calculateDistance(
                    points.get(i - 1).getLocation().getCoordinates()[0],
                    points.get(i - 1).getLocation().getCoordinates()[1],
                    points.get(i).getLocation().getCoordinates()[0],
                    points.get(i).getLocation().getCoordinates()[1]
            );
            totalDistance += distance;
        }

        tripHistory.setTotalDistanceKm(totalDistance);

        // Calculate average speed
        if (!points.isEmpty()) {
            LocalDateTime startTime = points.get(0).getTimestamp();
            LocalDateTime endTime = points.get(points.size() - 1).getTimestamp();
            long durationHours = ChronoUnit.HOURS.between(startTime, endTime);

            if (durationHours > 0) {
                double averageSpeed = totalDistance / durationHours;
                tripHistory.setAverageSpeed(averageSpeed);
            }
        }

        return tripHistory;
    }

    /**
     * Calculate distance between two points using Haversine formula.
     */
    private double calculateDistance(double lon1, double lat1, double lon2, double lat2) {
        final int R = 6371; // Radius of the Earth in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
