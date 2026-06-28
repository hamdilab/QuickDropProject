package com.quickdrop.tracking.entities;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Entity representing the tracking information for a specific order.
 * Contains all relevant tracking data for customers to monitor their orders.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "order_tracking")
public class OrderTracking {

    @org.springframework.data.mongodb.core.mapping.MongoId
    private String id;

    /**
     * Unique identifier of the order
     */
    private String orderId;

    /**
     * Unique identifier of the assigned driver
     */
    private String driverId;

    /**
     * Customer ID who placed the order
     */
    private String customerId;

    /**
     * Restaurant/Merchant location
     */
    private DriverLocation.Location restaurantLocation;

    /**
     * Customer delivery address
     */
    private DriverLocation.Location customerLocation;

    /**
     * Current driver location
     */
    private DriverLocation.Location currentDriverLocation;

    /**
     * Current status of the order tracking
     * (PICKING_UP, IN_TRANSIT_TO_CUSTOMER, DELIVERED, FAILED)
     */
    private String status;

    /**
     * Estimated Time of Arrival in minutes
     */
    private Integer estimatedArrivalMinutes;

    /**
     * Actual delivery time (null if not delivered yet)
     */
    private LocalDateTime actualDeliveryTime;

    /**
     * Pickup time from restaurant
     */
    private LocalDateTime pickupTime;

    /**
     * Tracking events timeline
     */
    private List<TrackingEvent> events;

    /**
     * Last updated timestamp
     */
    private LocalDateTime lastUpdated;

    /**
     * Distance to destination in kilometers
     */
    private Double distanceToDestinationKm;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrackingEvent {

        private String eventType; // LOCATION_UPDATE, STATUS_CHANGE, ETA_UPDATE
        private String description;
        private LocalDateTime timestamp;
        private DriverLocation.Location location;
        private Integer etaMinutes;
    }
}
