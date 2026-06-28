package com.quickdrop.tracking.entities;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Entity representing the real-time location of a driver.
 * Uses MongoDB geospatial indexing for efficient location queries.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "driver_locations")
public class DriverLocation {

    @org.springframework.data.mongodb.core.mapping.MongoId
    private String id;

    /**
     * Unique identifier of the driver
     */
    private String driverId;

    /**
     * Driver's current location as GeoJSON Point [longitude, latitude]
     * MongoDB requires [longitude, latitude] order for geospatial queries
     */
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private Location coordinates;

    /**
     * Speed of the driver in km/h
     */
    private Double speed;

    /**
     * Heading/Bearing in degrees (0-360)
     */
    private Integer heading;

    /**
     * Accuracy of the GPS coordinates in meters
     */
    private Double accuracy;

    /**
     * Timestamp when the location was recorded
     */
    private LocalDateTime timestamp;

    /**
     * Status of the driver (AVAILABLE, DELIVERING, OFFLINE)
     */
    private String status;

    /**
     * Current order ID if driver is delivering
     */
    private String currentOrderId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {

        private String type = "Point";
        private double[] coordinates; // [longitude, latitude]
    }
}
