package com.quickdrop.tracking.services.impl;

import com.quickdrop.tracking.dto.OrderTrackingDTO;
import com.quickdrop.tracking.dto.OrderTrackingResponseDTO;
import com.quickdrop.tracking.entities.DriverLocation;
import com.quickdrop.tracking.entities.OrderTracking;
import com.quickdrop.tracking.repositories.OrderTrackingRepository;
import com.quickdrop.tracking.services.OrderTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of OrderTrackingService.
 * Manages order tracking and real-time delivery updates.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderTrackingServiceImpl implements OrderTrackingService {

    private final OrderTrackingRepository orderTrackingRepository;

    @Override
    public OrderTrackingResponseDTO createOrderTracking(OrderTrackingDTO trackingDTO) {
        log.debug("Creating order tracking for order: {}", trackingDTO.getOrderId());

        OrderTracking orderTracking = new OrderTracking();
        orderTracking.setOrderId(trackingDTO.getOrderId());
        orderTracking.setDriverId(trackingDTO.getDriverId());
        orderTracking.setCustomerId(trackingDTO.getCustomerId());
        orderTracking.setRestaurantLocation(convertLocationDTO(trackingDTO.getRestaurantLocation()));
        orderTracking.setCustomerLocation(convertLocationDTO(trackingDTO.getCustomerLocation()));
        orderTracking.setStatus("PENDING");
        orderTracking.setEstimatedArrivalMinutes(null);
        orderTracking.setActualDeliveryTime(null);
        orderTracking.setPickupTime(null);
        orderTracking.setEvents(new ArrayList<>());
        orderTracking.setLastUpdated(LocalDateTime.now());
        orderTracking.setDistanceToDestinationKm(null);

        OrderTracking saved = orderTrackingRepository.save(orderTracking);
        return convertToResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderTrackingResponseDTO getOrderTracking(String orderId) {
        log.debug("Getting order tracking for order: {}", orderId);

        OrderTracking orderTracking = orderTrackingRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order tracking not found for ID: " + orderId));

        return convertToResponseDTO(orderTracking);
    }

    @Override
    public OrderTrackingResponseDTO updateOrderLocation(String orderId, Double longitude, Double latitude) {
        log.debug("Updating order {} location to [{}, {}]", orderId, longitude, latitude);

        OrderTracking orderTracking = orderTrackingRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order tracking not found for ID: " + orderId));

        DriverLocation.Location location = new DriverLocation.Location();
        location.setCoordinates(new double[]{longitude, latitude});
        orderTracking.setCurrentDriverLocation(location);
        orderTracking.setLastUpdated(LocalDateTime.now());

        addTrackingEventInternal(orderTracking, "LOCATION_UPDATE",
                "Driver location updated");

        OrderTracking saved = orderTrackingRepository.save(orderTracking);
        return convertToResponseDTO(saved);
    }

    @Override
    public OrderTrackingResponseDTO updateOrderStatus(String orderId, String status) {
        log.debug("Updating order {} status to: {}", orderId, status);

        OrderTracking orderTracking = orderTrackingRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order tracking not found for ID: " + orderId));

        orderTracking.setStatus(status);
        orderTracking.setLastUpdated(LocalDateTime.now());

        addTrackingEventInternal(orderTracking, "STATUS_CHANGE",
                "Order status changed to: " + status);

        OrderTracking saved = orderTrackingRepository.save(orderTracking);
        return convertToResponseDTO(saved);
    }

    @Override
    public OrderTrackingResponseDTO markOrderAsPickedUp(String orderId) {
        log.debug("Marking order {} as picked up", orderId);

        OrderTracking orderTracking = orderTrackingRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order tracking not found for ID: " + orderId));

        orderTracking.setStatus("IN_TRANSIT_TO_CUSTOMER");
        orderTracking.setPickupTime(LocalDateTime.now());
        orderTracking.setLastUpdated(LocalDateTime.now());

        addTrackingEventInternal(orderTracking, "STATUS_CHANGE",
                "Order picked up from restaurant");

        OrderTracking saved = orderTrackingRepository.save(orderTracking);
        return convertToResponseDTO(saved);
    }

    @Override
    public OrderTrackingResponseDTO markOrderAsDelivered(String orderId) {
        log.debug("Marking order {} as delivered", orderId);

        OrderTracking orderTracking = orderTrackingRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order tracking not found for ID: " + orderId));

        orderTracking.setStatus("DELIVERED");
        orderTracking.setActualDeliveryTime(LocalDateTime.now());
        orderTracking.setLastUpdated(LocalDateTime.now());

        addTrackingEventInternal(orderTracking, "STATUS_CHANGE",
                "Order delivered successfully");

        OrderTracking saved = orderTrackingRepository.save(orderTracking);
        return convertToResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderTrackingResponseDTO> getActiveOrdersByDriver(String driverId) {
        log.debug("Getting active orders for driver: {}", driverId);

        List<OrderTracking> orders = orderTrackingRepository.findByDriverId(driverId);
        return orders.stream()
                .filter(order -> !"DELIVERED".equals(order.getStatus()) && !"FAILED".equals(order.getStatus()))
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderTrackingResponseDTO> getOrdersByCustomer(String customerId) {
        log.debug("Getting orders for customer: {}", customerId);

        List<OrderTracking> orders = orderTrackingRepository.findByCustomerId(customerId);
        return orders.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderTrackingResponseDTO addTrackingEvent(
            String orderId,
            String eventType,
            String description) {

        log.debug("Adding tracking event to order {}: {} - {}", orderId, eventType, description);

        OrderTracking orderTracking = orderTrackingRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order tracking not found for ID: " + orderId));

        addTrackingEventInternal(orderTracking, eventType, description);
        orderTracking.setLastUpdated(LocalDateTime.now());

        OrderTracking saved = orderTrackingRepository.save(orderTracking);
        return convertToResponseDTO(saved);
    }

    /**
     * Add tracking event to order tracking.
     */
    private void addTrackingEventInternal(OrderTracking orderTracking, String eventType, String description) {
        OrderTracking.TrackingEvent event = new OrderTracking.TrackingEvent();
        event.setEventType(eventType);
        event.setDescription(description);
        event.setTimestamp(LocalDateTime.now());
        event.setLocation(orderTracking.getCurrentDriverLocation());
        event.setEtaMinutes(orderTracking.getEstimatedArrivalMinutes());

        orderTracking.getEvents().add(event);
    }

    /**
     * Convert LocationDTO to Location entity.
     */
    private DriverLocation.Location convertLocationDTO(OrderTrackingDTO.LocationDTO locationDTO) {
        DriverLocation.Location location = new DriverLocation.Location();
        location.setCoordinates(new double[]{
                locationDTO.getLongitude(),
                locationDTO.getLatitude()
        });
        return location;
    }

    /**
     * Convert Entity to Response DTO.
     */
    private OrderTrackingResponseDTO convertToResponseDTO(OrderTracking orderTracking) {
        OrderTrackingResponseDTO dto = new OrderTrackingResponseDTO();
        dto.setId(orderTracking.getId());
        dto.setOrderId(orderTracking.getOrderId());
        dto.setDriverId(orderTracking.getDriverId());
        dto.setCustomerId(orderTracking.getCustomerId());
        dto.setStatus(orderTracking.getStatus());
        dto.setEstimatedArrivalMinutes(orderTracking.getEstimatedArrivalMinutes());
        dto.setActualDeliveryTime(orderTracking.getActualDeliveryTime());
        dto.setPickupTime(orderTracking.getPickupTime());
        dto.setLastUpdated(orderTracking.getLastUpdated());
        dto.setDistanceToDestinationKm(orderTracking.getDistanceToDestinationKm());

        if (orderTracking.getRestaurantLocation() != null) {
            dto.setRestaurantLocation(convertLocationToDTO(orderTracking.getRestaurantLocation()));
        }
        if (orderTracking.getCustomerLocation() != null) {
            dto.setCustomerLocation(convertLocationToDTO(orderTracking.getCustomerLocation()));
        }
        if (orderTracking.getCurrentDriverLocation() != null) {
            dto.setCurrentDriverLocation(convertLocationToDTO(orderTracking.getCurrentDriverLocation()));
        }

        if (orderTracking.getEvents() != null) {
            dto.setEvents(orderTracking.getEvents().stream()
                    .map(event -> {
                        OrderTrackingResponseDTO.TrackingEventDTO eventDTO =
                                new OrderTrackingResponseDTO.TrackingEventDTO();
                        eventDTO.setEventType(event.getEventType());
                        eventDTO.setDescription(event.getDescription());
                        eventDTO.setTimestamp(event.getTimestamp());
                        eventDTO.setEtaMinutes(event.getEtaMinutes());
                        if (event.getLocation() != null) {
                            eventDTO.setLongitude(event.getLocation().getCoordinates()[0]);
                            eventDTO.setLatitude(event.getLocation().getCoordinates()[1]);
                        }
                        return eventDTO;
                    })
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    /**
     * Convert Location entity to DTO.
     */
    private OrderTrackingDTO.LocationDTO convertLocationToDTO(DriverLocation.Location location) {
        OrderTrackingDTO.LocationDTO dto = new OrderTrackingDTO.LocationDTO();
        dto.setLongitude(location.getCoordinates()[0]);
        dto.setLatitude(location.getCoordinates()[1]);
        return dto;
    }
}
