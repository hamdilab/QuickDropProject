package com.quickdrop.tracking.controllers;

import com.quickdrop.tracking.dto.OrderTrackingDTO;
import com.quickdrop.tracking.dto.OrderTrackingResponseDTO;
import com.quickdrop.tracking.services.OrderTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for order tracking management.
 * Provides endpoints for tracking order delivery status.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Tracking", description = "APIs for managing order tracking")
public class OrderTrackingController {

    private final OrderTrackingService orderTrackingService;

    @PostMapping
    @Operation(summary = "Create order tracking", description = "Create a new order tracking record")
    public ResponseEntity<OrderTrackingResponseDTO> createOrderTracking(
            @Valid @RequestBody OrderTrackingDTO trackingDTO) {

        OrderTrackingResponseDTO response = orderTrackingService.createOrderTracking(trackingDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order tracking", description = "Get tracking information for a specific order")
    public ResponseEntity<OrderTrackingResponseDTO> getOrderTracking(@PathVariable String orderId) {

        try {
            OrderTrackingResponseDTO response = orderTrackingService.getOrderTracking(orderId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{orderId}/location")
    @Operation(summary = "Update order location", description = "Update driver location for an order")
    public ResponseEntity<OrderTrackingResponseDTO> updateOrderLocation(
            @PathVariable String orderId,
            @RequestParam Double longitude,
            @RequestParam Double latitude) {

        try {
            OrderTrackingResponseDTO response = orderTrackingService.updateOrderLocation(orderId, longitude, latitude);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{orderId}/status")
    @Operation(summary = "Update order status", description = "Update the status of an order")
    public ResponseEntity<OrderTrackingResponseDTO> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status) {

        try {
            OrderTrackingResponseDTO response = orderTrackingService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{orderId}/pickup")
    @Operation(summary = "Mark as picked up", description = "Mark order as picked up from restaurant")
    public ResponseEntity<OrderTrackingResponseDTO> markOrderAsPickedUp(@PathVariable String orderId) {

        try {
            OrderTrackingResponseDTO response = orderTrackingService.markOrderAsPickedUp(orderId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{orderId}/deliver")
    @Operation(summary = "Mark as delivered", description = "Mark order as delivered")
    public ResponseEntity<OrderTrackingResponseDTO> markOrderAsDelivered(@PathVariable String orderId) {

        try {
            OrderTrackingResponseDTO response = orderTrackingService.markOrderAsDelivered(orderId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/driver/{driverId}")
    @Operation(summary = "Get driver orders", description = "Get all active orders for a driver")
    public ResponseEntity<List<OrderTrackingResponseDTO>> getActiveOrdersByDriver(@PathVariable String driverId) {

        List<OrderTrackingResponseDTO> orders = orderTrackingService.getActiveOrdersByDriver(driverId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get customer orders", description = "Get all orders for a customer")
    public ResponseEntity<List<OrderTrackingResponseDTO>> getOrdersByCustomer(@PathVariable String customerId) {

        List<OrderTrackingResponseDTO> orders = orderTrackingService.getOrdersByCustomer(customerId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/{orderId}/events")
    @Operation(summary = "Add tracking event", description = "Add a custom tracking event to an order")
    public ResponseEntity<OrderTrackingResponseDTO> addTrackingEvent(
            @PathVariable String orderId,
            @RequestParam String eventType,
            @RequestParam String description) {

        try {
            OrderTrackingResponseDTO response = orderTrackingService.addTrackingEvent(orderId, eventType, description);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
