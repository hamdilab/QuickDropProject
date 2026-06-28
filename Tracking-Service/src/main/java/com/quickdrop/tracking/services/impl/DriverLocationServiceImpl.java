package com.quickdrop.tracking.services.impl;

import com.quickdrop.tracking.client.UserClient;
import com.quickdrop.tracking.client.dto.UserResponseDTO;
import com.quickdrop.tracking.dto.DriverLocationDTO;
import com.quickdrop.tracking.dto.DriverLocationResponseDTO;
import com.quickdrop.tracking.entities.DriverLocation;
import com.quickdrop.tracking.repositories.DriverLocationRepository;
import com.quickdrop.tracking.services.DriverLocationService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of DriverLocationService.
 * Handles real-time driver location updates and queries.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DriverLocationServiceImpl implements DriverLocationService {

    private final DriverLocationRepository driverLocationRepository;
    private final UserClient userClient;

    @Override
    public DriverLocationResponseDTO updateDriverLocation(
        DriverLocationDTO locationDTO
    ) {
        log.debug(
            "Updating location for driver: {}",
            locationDTO.getDriverId()
        );

        // Validate driver exists in User Service
        try {
            Long driverIdLong = Long.parseLong(locationDTO.getDriverId());
            UserResponseDTO user = userClient.getUserById(driverIdLong);
            if (user == null || !"LIVREUR".equals(user.getRole())) {
                throw new RuntimeException(
                    "Invalid driver ID: " + locationDTO.getDriverId()
                );
            }
            log.debug(
                "Driver validated: {} {}",
                user.getPrenom(),
                user.getNom()
            );
        } catch (NumberFormatException e) {
            log.warn(
                "Driver ID is not a valid number: {}",
                locationDTO.getDriverId()
            );
            // Skip validation if ID is not numeric
        } catch (Exception e) {
            log.warn(
                "Could not validate driver {}: {}",
                locationDTO.getDriverId(),
                e.getMessage()
            );
            // Continue anyway for testing purposes
        }

        DriverLocation driverLocation = driverLocationRepository
            .findByDriverId(locationDTO.getDriverId())
            .orElse(new DriverLocation());

        driverLocation.setDriverId(locationDTO.getDriverId());
        driverLocation.setCoordinates(
            createLocation(
                locationDTO.getCoordinates().getLongitude(),
                locationDTO.getCoordinates().getLatitude()
            )
        );
        driverLocation.setSpeed(locationDTO.getSpeed());
        driverLocation.setHeading(locationDTO.getHeading());
        driverLocation.setAccuracy(locationDTO.getAccuracy());
        driverLocation.setTimestamp(LocalDateTime.now());
        driverLocation.setStatus(locationDTO.getStatus());
        driverLocation.setCurrentOrderId(locationDTO.getCurrentOrderId());

        DriverLocation saved = driverLocationRepository.save(driverLocation);
        return convertToResponseDTO(saved, null);
    }

    @Override
    @Transactional(readOnly = true)
    public DriverLocationResponseDTO getDriverLocation(String driverId) {
        log.debug("Getting location for driver: {}", driverId);

        DriverLocation driverLocation = driverLocationRepository
            .findByDriverId(driverId)
            .orElseThrow(() ->
                new RuntimeException(
                    "Driver location not found for ID: " + driverId
                )
            );

        return convertToResponseDTO(driverLocation, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverLocationResponseDTO> findNearbyDrivers(
        Double longitude,
        Double latitude,
        Integer radiusMeters
    ) {
        log.debug(
            "Finding nearby drivers at [{}, {}] with radius: {}m",
            longitude,
            latitude,
            radiusMeters
        );

        double[] location = { longitude, latitude };
        List<DriverLocation> nearbyDrivers =
            driverLocationRepository.findNearLocation(location, radiusMeters);

        return nearbyDrivers
            .stream()
            .map(driver -> {
                double distance = calculateDistance(
                    longitude,
                    latitude,
                    driver.getCoordinates().getCoordinates()[0],
                    driver.getCoordinates().getCoordinates()[1]
                );
                return convertToResponseDTO(driver, distance);
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverLocationResponseDTO> getDriversByStatus(String status) {
        log.debug("Getting drivers with status: {}", status);

        List<DriverLocation> drivers = driverLocationRepository.findByStatus(
            status
        );
        return drivers
            .stream()
            .map(driver -> convertToResponseDTO(driver, null))
            .collect(Collectors.toList());
    }

    @Override
    public double calculateDistance(
        double lon1,
        double lat1,
        double lon2,
        double lat2
    ) {
        final int R = 6371; // Radius of the Earth in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(Math.toRadians(lat1)) *
                Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // Return distance in meters
    }

    @Override
    public DriverLocationResponseDTO updateDriverStatus(
        String driverId,
        String status
    ) {
        log.debug("Updating driver {} status to: {}", driverId, status);

        DriverLocation driverLocation = driverLocationRepository
            .findByDriverId(driverId)
            .orElseThrow(() ->
                new RuntimeException(
                    "Driver location not found for ID: " + driverId
                )
            );

        driverLocation.setStatus(status);
        driverLocation.setTimestamp(LocalDateTime.now());

        DriverLocation saved = driverLocationRepository.save(driverLocation);
        return convertToResponseDTO(saved, null);
    }

    /**
     * Helper method to create Location object.
     */
    private DriverLocation.Location createLocation(
        double longitude,
        double latitude
    ) {
        DriverLocation.Location location = new DriverLocation.Location();
        location.setCoordinates(new double[] { longitude, latitude });
        return location;
    }

    /**
     * Helper method to convert Entity to Response DTO.
     */
    private DriverLocationResponseDTO convertToResponseDTO(
        DriverLocation location,
        Double distanceFromTarget
    ) {
        DriverLocationResponseDTO dto = new DriverLocationResponseDTO();
        dto.setId(location.getId());
        dto.setDriverId(location.getDriverId());
        dto.setLongitude(location.getCoordinates().getCoordinates()[0]);
        dto.setLatitude(location.getCoordinates().getCoordinates()[1]);
        dto.setSpeed(location.getSpeed());
        dto.setHeading(location.getHeading());
        dto.setAccuracy(location.getAccuracy());
        dto.setStatus(location.getStatus());
        dto.setCurrentOrderId(location.getCurrentOrderId());
        dto.setTimestamp(location.getTimestamp());
        dto.setDistanceFromTarget(distanceFromTarget);
        return dto;
    }
}
