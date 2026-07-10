package com.quickdrop.tracking.repositories;

import com.quickdrop.tracking.entities.OrderTracking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for OrderTracking entity.
 */
@Repository
public interface OrderTrackingRepository extends MongoRepository<OrderTracking, String> {

    /**
     * Find tracking info by order ID.
     */
    Optional<OrderTracking> findByOrderId(String orderId);

    /**
     * Find all orders being tracked for a specific driver.
     */
    List<OrderTracking> findByDriverId(String driverId);

    /**
     * Find all orders being tracked for a specific customer.
     */
    List<OrderTracking> findByCustomerId(String customerId);

    /**
     * Find all active orders (not yet delivered).
     */
    List<OrderTracking> findByStatusNot(String status);

    /**
     * Find all orders with a specific status.
     */
    List<OrderTracking> findByStatus(String status);

    /**
     * Delete old tracking records (older than specified days).
     */
    long deleteByLastUpdatedBefore(java.time.LocalDateTime timestamp);

    /**
     * Delete all order tracking records.
     */
    void deleteAll();
}
