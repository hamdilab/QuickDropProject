package com.quickdrop.tracking.repositories;

import com.quickdrop.tracking.entities.TripHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for TripHistory entity.
 */
@Repository
public interface TripHistoryRepository extends MongoRepository<TripHistory, String> {

    /**
     * Find all trips for a specific driver.
     */
    List<TripHistory> findByDriverIdOrderByStartTimeDesc(String driverId);

    /**
     * Find trip by order ID.
     */
    TripHistory findByOrderId(String orderId);

    /**
     * Find all trips for a specific driver within a date range.
     */
    List<TripHistory> findByDriverIdAndStartTimeBetween(
            String driverId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Find all completed trips.
     */
    List<TripHistory> findByStatus(String status);

    /**
     * Find all trips for a specific driver with a specific status.
     */
    List<TripHistory> findByDriverIdAndStatus(String driverId, String status);

    /**
     * Delete old trip history records (older than specified days).
     */
    long deleteByStartTimeBefore(LocalDateTime timestamp);
}
