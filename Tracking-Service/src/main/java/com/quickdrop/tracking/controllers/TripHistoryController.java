package com.quickdrop.tracking.controllers;

import com.quickdrop.tracking.entities.TripHistory;
import com.quickdrop.tracking.services.TripHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for trip history management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(name = "Trip History", description = "APIs for managing driver trip history")
public class TripHistoryController {

    private final TripHistoryService tripHistoryService;

    @PostMapping
    @Operation(summary = "Start trip", description = "Start a new trip for a driver")
    public ResponseEntity<TripHistory> startTrip(
            @RequestParam String driverId,
            @RequestParam String orderId,
            @RequestParam Double longitude,
            @RequestParam Double latitude) {

        TripHistory.LocationPoint startPoint = new TripHistory.LocationPoint();
        startPoint.setLocation(new com.quickdrop.tracking.entities.DriverLocation.Location());
        startPoint.getLocation().setCoordinates(new double[]{longitude, latitude});
        startPoint.setTimestamp(LocalDateTime.now());

        TripHistory trip = tripHistoryService.startTrip(driverId, orderId, startPoint);
        return ResponseEntity.ok(trip);
    }

    @PutMapping("/{tripId}/location")
    @Operation(summary = "Add location point", description = "Add a location point to an ongoing trip")
    public ResponseEntity<TripHistory> addLocationPoint(
            @PathVariable String tripId,
            @RequestParam Double longitude,
            @RequestParam Double latitude,
            @RequestParam(required = false) Double speed,
            @RequestParam(required = false) Integer heading) {

        TripHistory.LocationPoint locationPoint = new TripHistory.LocationPoint();
        locationPoint.setLocation(new com.quickdrop.tracking.entities.DriverLocation.Location());
        locationPoint.getLocation().setCoordinates(new double[]{longitude, latitude});
        locationPoint.setTimestamp(LocalDateTime.now());
        locationPoint.setSpeed(speed);
        locationPoint.setHeading(heading);

        TripHistory trip = tripHistoryService.addLocationPoint(tripId, locationPoint);
        return ResponseEntity.ok(trip);
    }

    @PostMapping("/{tripId}/complete")
    @Operation(summary = "Complete trip", description = "Mark a trip as completed")
    public ResponseEntity<TripHistory> completeTrip(@PathVariable String tripId) {

        try {
            TripHistory trip = tripHistoryService.completeTrip(tripId);
            return ResponseEntity.ok(trip);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{tripId}")
    @Operation(summary = "Get trip", description = "Get trip details by ID")
    public ResponseEntity<TripHistory> getTripById(@PathVariable String tripId) {

        try {
            TripHistory trip = tripHistoryService.getTripById(tripId);
            return ResponseEntity.ok(trip);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/driver/{driverId}")
    @Operation(summary = "Get driver trips", description = "Get all trips for a driver")
    public ResponseEntity<List<TripHistory>> getTripsByDriver(@PathVariable String driverId) {

        List<TripHistory> trips = tripHistoryService.getTripsByDriver(driverId);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/driver/{driverId}/range")
    @Operation(summary = "Get trips by date range", description = "Get trips for a driver within a date range")
    public ResponseEntity<List<TripHistory>> getTripsByDateRange(
            @PathVariable String driverId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {

        List<TripHistory> trips = tripHistoryService.getTripsByDriverAndDateRange(driverId, startDate, endDate);
        return ResponseEntity.ok(trips);
    }
}
