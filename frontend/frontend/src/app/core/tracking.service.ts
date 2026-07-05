import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

// Déclaration du module sockjs pour TypeScript
declare const SockJS: any;

export interface DriverLocation {
  driverId: string;
  longitude: number;
  latitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  status: 'AVAILABLE' | 'DELIVERING' | 'OFFLINE';
  currentOrderId?: string;
  timestamp?: string;
}

export interface OrderTracking {
  orderId: string;
  driverId: string;
  customerId: string;
  status: 'PENDING' | 'PICKING_UP' | 'IN_TRANSIT' | 'DELIVERED';
  estimatedArrivalMinutes?: number;
  pickupTime?: string;
  actualDeliveryTime?: string;
  restaurantLocation?: { longitude: number; latitude: number };
  customerLocation?: { longitude: number; latitude: number };
  currentDriverLocation?: { longitude: number; latitude: number };
  events?: OrderEvent[];
}

export interface OrderEvent {
  eventType: string;
  description: string;
  timestamp: string;
  location?: { longitude: number; latitude: number };
  etaMinutes?: number;
}

export interface TripHistory {
  tripId: string;
  driverId: string;
  orderId: string;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  startTime: string;
  endTime?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  locationPoints: LocationPoint[];
}

export interface LocationPoint {
  longitude: number;
  latitude: number;
  timestamp: string;
  speed: number;
  heading: number;
}

export interface NearbyDriversRequest {
  longitude: number;
  latitude: number;
  radiusMeters: number;
}

export interface NearbyDriver {
  driverId: string;
  longitude: number;
  latitude: number;
  distanceFromTarget?: number;
  status: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private baseUrl = 'http://localhost:8084/tracking-service';
  private stompClient: any = null;
  private locationUpdates = new Subject<DriverLocation>();
  private orderUpdates = new Subject<OrderTracking>();
  private isConnected = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  // ==================== DRIVER LOCATION ====================

  updateDriverLocation(location: DriverLocation): Observable<DriverLocation> {
    return this.http.post<DriverLocation>(
      `${this.baseUrl}/api/v1/drivers/location`,
      location,
    );
  }

  getDriverLocation(driverId: string): Observable<DriverLocation> {
    return this.http.get<DriverLocation>(
      `${this.baseUrl}/api/v1/drivers/${driverId}/location`,
    );
  }

  updateDriverStatus(
    driverId: string,
    status: string,
  ): Observable<DriverLocation> {
    return this.http.put<DriverLocation>(
      `${this.baseUrl}/api/v1/drivers/${driverId}/status?status=${status}`,
      {},
    );
  }

  getDriversByStatus(status: string): Observable<DriverLocation[]> {
    return this.http.get<DriverLocation[]>(
      `${this.baseUrl}/api/v1/drivers/status/${status}`,
    );
  }

  findNearbyDrivers(request: NearbyDriversRequest): Observable<NearbyDriver[]> {
    return this.http
      .post<NearbyDriversRequest>(
        `${this.baseUrl}/api/v1/drivers/nearby`,
        request,
      )
      .pipe(map((drivers: any) => drivers.drivers || drivers));
  }

  // ==================== ORDER TRACKING ====================

  createOrderTracking(order: OrderTracking): Observable<OrderTracking> {
    return this.http.post<OrderTracking>(
      `${this.baseUrl}/api/v1/orders`,
      order,
    );
  }

  getOrderTracking(orderId: string): Observable<OrderTracking> {
    return this.http.get<OrderTracking>(
      `${this.baseUrl}/api/v1/orders/${orderId}`,
    );
  }

  updateOrderLocation(
    orderId: string,
    location: { longitude: number; latitude: number },
  ): Observable<OrderTracking> {
    return this.http.put<OrderTracking>(
      `${this.baseUrl}/api/v1/orders/${orderId}/location`,
      location,
    );
  }

  updateOrderStatus(
    orderId: string,
    status: string,
  ): Observable<OrderTracking> {
    return this.http.put<OrderTracking>(
      `${this.baseUrl}/api/v1/orders/${orderId}/status?status=${status}`,
      {},
    );
  }

  markAsPickedUp(orderId: string): Observable<OrderTracking> {
    return this.http.post<OrderTracking>(
      `${this.baseUrl}/api/v1/orders/${orderId}/pickup`,
      {},
    );
  }

  markAsDelivered(orderId: string): Observable<OrderTracking> {
    return this.http.post<OrderTracking>(
      `${this.baseUrl}/api/v1/orders/${orderId}/deliver`,
      {},
    );
  }

  getOrdersByDriver(driverId: string): Observable<OrderTracking[]> {
    return this.http.get<OrderTracking[]>(
      `${this.baseUrl}/api/v1/orders/driver/${driverId}`,
    );
  }

  getOrdersByCustomer(customerId: string): Observable<OrderTracking[]> {
    return this.http.get<OrderTracking[]>(
      `${this.baseUrl}/api/v1/orders/customer/${customerId}`,
    );
  }

  // ==================== TRIP HISTORY ====================

  createTrip(trip: Partial<TripHistory>): Observable<TripHistory> {
    return this.http.post<TripHistory>(`${this.baseUrl}/api/v1/trips`, trip);
  }

  updateTripLocation(
    tripId: string,
    point: LocationPoint,
  ): Observable<TripHistory> {
    return this.http.put<TripHistory>(
      `${this.baseUrl}/api/v1/trips/${tripId}/location`,
      point,
    );
  }

  completeTrip(tripId: string): Observable<TripHistory> {
    return this.http.post<TripHistory>(
      `${this.baseUrl}/api/v1/trips/${tripId}/complete`,
      {},
    );
  }

  getTrip(tripId: string): Observable<TripHistory> {
    return this.http.get<TripHistory>(`${this.baseUrl}/api/v1/trips/${tripId}`);
  }

  getTripsByDriver(driverId: string): Observable<TripHistory[]> {
    return this.http.get<TripHistory[]>(
      `${this.baseUrl}/api/v1/trips/driver/${driverId}`,
    );
  }

  // ==================== WEBSOCKET ====================

  connectWebSocket(): void {
    const socket = new SockJS(`${this.baseUrl}/ws-tracking`);
    this.stompClient = {
      connected: true,
      subscribe: (topic: string, callback: any) => {
        console.log('Subscribed to:', topic);
      },
      send: (destination: string, headers: any, body: string) => {
        console.log('Sent to:', destination);
      },
    };

    setTimeout(() => {
      this.isConnected.next(true);
      console.log('WebSocket connected (simulated)');
    }, 500);
  }

  disconnectWebSocket(): void {
    if (this.stompClient) {
      this.stompClient.connected = false;
      this.isConnected.next(false);
    }
  }

  sendDriverLocation(location: DriverLocation): void {
    // Simulate sending location via WebSocket
    console.log('Sending location:', location);
    this.locationUpdates.next(location);
  }

  subscribeToDriverUpdates(driverId: string): Observable<DriverLocation> {
    return this.locationUpdates.asObservable();
  }

  subscribeToOrderUpdates(orderId: string): Observable<OrderTracking> {
    return this.orderUpdates.asObservable();
  }

  isConnectedToWebSocket(): Observable<boolean> {
    return this.isConnected.asObservable();
  }

  // ==================== ETA ====================

  calculateETA(request: {
    originLong: number;
    originLat: number;
    destLong: number;
    destLat: number;
  }): Observable<{ estimatedMinutes: number; distanceKm: number }> {
    return this.http.post<{ estimatedMinutes: number; distanceKm: number }>(
      `${this.baseUrl}/api/v1/eta/calculate`,
      request,
    );
  }
}
