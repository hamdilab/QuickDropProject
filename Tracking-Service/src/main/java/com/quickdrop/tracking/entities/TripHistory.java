package com.quickdrop.tracking.entities;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Entity representing the complete history of a driver's trip.
 * Stores all location updates during a delivery mission.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "trip_history")
public class TripHistory {

    @org.springframework.data.mongodb.core.mapping.MongoId
    private String id;

    /**
     * Unique identifier of the driver
     */
    private String driverId;

    /**
     * Order ID associated with this trip
     */
    private String orderId;

    /**
     * List of all location points during the trip
     */
    private List<LocationPoint> locationPoints;

    /**
     * Starting location
     */
    private DriverLocation.Location startLocation;

    /**
     * Destination location
     */
    private DriverLocation.Location destinationLocation;

    /**
     * Trip start time
     */
    private LocalDateTime startTime;

    /**
     * Trip end time
     */
    private LocalDateTime endTime;

    /**
     * Total distance covered in kilometers
     */
    private Double totalDistanceKm;

    /**
     * Total duration in minutes
     */
    private Integer totalDurationMinutes;

    /**
     * Trip status (IN_PROGRESS, COMPLETED, CANCELLED)
     */
    private String status;

    /**
     * Average speed during the trip in km/h
     */
    private Double averageSpeed;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationPoint {

        private DriverLocation.Location location;
        private LocalDateTime timestamp;
        private Double speed;
        private Integer heading;
    }
}
