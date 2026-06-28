package com.quickdrop.tracking.services.impl;

import com.quickdrop.tracking.dto.ETAResponseDTO;
import com.quickdrop.tracking.entities.DriverLocation;
import com.quickdrop.tracking.repositories.DriverLocationRepository;
import com.quickdrop.tracking.services.ETAService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Implementation of ETAService.
 * Handles Estimated Time of Arrival calculations using various algorithms.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ETAServiceImpl implements ETAService {

    private final DriverLocationRepository driverLocationRepository;

    // Default average speed in km/h (urban delivery)
    private static final double DEFAULT_AVERAGE_SPEED = 30.0;

    // Speed multipliers based on time of day
    private static final double PEAK_HOUR_MULTIPLIER = 0.6; // 40% slower
    private static final double OFF_PEAK_MULTIPLIER = 1.2;  // 20% faster

    @Override
    public ETAResponseDTO calculateETA(
            Double currentLongitude,
            Double currentLatitude,
            Double destinationLongitude,
            Double destinationLatitude,
            String driverId) {

        log.debug("Calculating ETA from [{}, {}] to [{}, {}] for driver: {}",
                currentLongitude, currentLatitude, destinationLongitude, destinationLatitude, driverId);

        double distanceKm = calculateDistance(
                currentLongitude, currentLatitude,
                destinationLongitude, destinationLatitude
        );

        Double currentSpeed = getCurrentSpeed(driverId);
        if (currentSpeed == null || currentSpeed <= 0) {
            currentSpeed = DEFAULT_AVERAGE_SPEED;
        }

        // Adjust speed based on time of day
        Double adjustedSpeed = adjustSpeedForTimeOfDay(currentSpeed);

        Integer estimatedMinutes = estimateArrivalMinutes(distanceKm, adjustedSpeed);

        ETAResponseDTO response = new ETAResponseDTO();
        response.setEstimatedMinutes(estimatedMinutes);
        response.setDistanceKm(distanceKm);
        response.setAverageSpeed(adjustedSpeed);
        response.setRouteDescription(String.format(
                "%.2f km at %.1f km/h - Estimated %d minutes",
                distanceKm, adjustedSpeed, estimatedMinutes
        ));

        return response;
    }

    @Override
    public ETAResponseDTO calculateETAFromCurrentLocation(
            String driverId,
            Double destinationLongitude,
            Double destinationLatitude) {

        log.debug("Calculating ETA from driver {} current location to [{}, {}]",
                driverId, destinationLongitude, destinationLatitude);

        // Get driver's current location
        Optional<DriverLocation> driverLocationOpt = driverLocationRepository.findByDriverId(driverId);

        if (driverLocationOpt.isEmpty()) {
            log.warn("Driver {} location not found, using default speed", driverId);
            return calculateETA(null, null, destinationLongitude, destinationLatitude, driverId);
        }

        DriverLocation driverLocation = driverLocationOpt.get();
        double[] coords = driverLocation.getCoordinates().getCoordinates();

        return calculateETA(
                coords[0], // longitude
                coords[1], // latitude
                destinationLongitude,
                destinationLatitude,
                driverId
        );
    }

    @Override
    public double calculateDistance(
            Double lon1,
            Double lat1,
            Double lon2,
            Double lat2) {

        // If no current location provided, return 0
        if (lon1 == null || lat1 == null) {
            return 0.0;
        }

        final int R = 6371; // Radius of the Earth in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    @Override
    public Integer estimateArrivalMinutes(double distanceKm, Double currentSpeed) {
        if (currentSpeed <= 0) {
            currentSpeed = DEFAULT_AVERAGE_SPEED;
        }

        double hours = distanceKm / currentSpeed;
        return (int) Math.ceil(hours * 60); // Convert to minutes, round up
    }

    @Override
    public Double getCurrentSpeed(String driverId) {
        Optional<DriverLocation> driverLocation = driverLocationRepository.findByDriverId(driverId);

        if (driverLocation.isPresent()) {
            return driverLocation.get().getSpeed();
        }

        return null;
    }

    /**
     * Adjust speed based on time of day and traffic conditions.
     */
    private Double adjustSpeedForTimeOfDay(Double baseSpeed) {
        LocalDateTime now = LocalDateTime.now();
        int hour = now.getHour();

        // Peak hours: 7-9 AM and 5-7 PM
        boolean isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

        if (isPeakHour) {
            return baseSpeed * PEAK_HOUR_MULTIPLIER;
        }

        // Night time (10 PM - 5 AM) might have less traffic
        if (hour >= 22 || hour <= 5) {
            return baseSpeed * OFF_PEAK_MULTIPLIER;
        }

        return baseSpeed;
    }
}
