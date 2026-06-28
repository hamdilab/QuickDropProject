package com.quickdrop.tracking.services;

import com.quickdrop.tracking.dto.OrderTrackingDTO;
import com.quickdrop.tracking.dto.OrderTrackingResponseDTO;

import java.util.List;

/**
 * Service interface for order tracking management.
 */
public interface OrderTrackingService {

    /**
     * Create new order tracking.
     */
    OrderTrackingResponseDTO createOrderTracking(OrderTrackingDTO trackingDTO);

    /**
     * Get order tracking by order ID.
     */
    OrderTrackingResponseDTO getOrderTracking(String orderId);

    /**
     * Update driver location for an order.
     */
    OrderTrackingResponseDTO updateOrderLocation(String orderId, Double longitude, Double latitude);

    /**
     * Update order status.
     */
    OrderTrackingResponseDTO updateOrderStatus(String orderId, String status);

    /**
     * Mark order as picked up from restaurant.
     */
    OrderTrackingResponseDTO markOrderAsPickedUp(String orderId);

    /**
     * Mark order as delivered.
     */
    OrderTrackingResponseDTO markOrderAsDelivered(String orderId);

    /**
     * Get all active orders for a driver.
     */
    List<OrderTrackingResponseDTO> getActiveOrdersByDriver(String driverId);

    /**
     * Get all active orders for a customer.
     */
    List<OrderTrackingResponseDTO> getOrdersByCustomer(String customerId);

    /**
     * Add tracking event to order.
     */
    OrderTrackingResponseDTO addTrackingEvent(
            String orderId,
            String eventType,
            String description
    );
}
