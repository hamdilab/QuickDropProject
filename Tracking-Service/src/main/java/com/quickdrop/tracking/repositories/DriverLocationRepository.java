package com.quickdrop.tracking.repositories;

import com.quickdrop.tracking.entities.DriverLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for DriverLocation entity with geospatial query support.
 */
@Repository
public interface DriverLocationRepository extends MongoRepository<DriverLocation, String> {

    /**
     * Find the current location of a specific driver.
     */
    Optional<DriverLocation> findByDriverId(String driverId);

    /**
     * Find all drivers currently delivering orders.
     */
    List<DriverLocation> findByStatus(String status);

    /**
     * Find all drivers with a specific status.
     */
    List<DriverLocation> findByStatusIn(List<String> statuses);

    /**
     * Find drivers within a specified radius (in miles) from a point.
     * MongoDB geospatial query using $nearSphere.
     */
    @Query(value = "{ 'coordinates': { $nearSphere: { $geometry: { type: 'Point', coordinates: ?0 }, $maxDistance: ?1 } } }")
    List<DriverLocation> findNearLocation(double[] location, int maxDistanceMeters);

    /**
     * Find drivers within a bounding box.
     */
    @Query(value = "{ 'coordinates': { $geoWithin: { $geometry: { type: 'Polygon', coordinates: ?0 } } } }")
    List<DriverLocation> findWithinBoundingBox(double[][] polygonCoordinates);

    /**
     * Delete old location records (older than specified days).
     */
    long deleteByTimestampBefore(java.time.LocalDateTime timestamp);

    /**
     * Delete drivers by IDs.
     */
    void deleteByDriverIdIn(List<String> driverIds);
}
