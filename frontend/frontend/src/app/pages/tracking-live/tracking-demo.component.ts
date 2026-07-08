import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import {
  TrackingService,
  DriverLocation,
  OrderTracking,
} from '../../core/tracking.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tracking-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-demo.component.html',
  styleUrls: ['./tracking-demo.component.css'],
})
export class TrackingDemoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Driver simulation
  drivers: DriverLocation[] = [];
  simulationInterval: any = null;
  isSimulating = false;

  // Orders
  orders: OrderTracking[] = [];
  selectedOrderId: string | null = null;

  // Map center (Nice, France)
  mapCenter = { lat: 43.7102, lng: 7.262 };

  constructor(
    private trackingService: TrackingService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.trackingService.connectWebSocket();

    // Subscribe to real-time updates
    this.trackingService
      .subscribeToDriverUpdates('')
      .pipe(takeUntil(this.destroy$))
      .subscribe((location) => {
        const index = this.drivers.findIndex(
          (d) => d.driverId === location.driverId,
        );
        if (index !== -1) {
          this.drivers[index] = location;
        } else {
          this.drivers.push(location);
        }
      });

    this.trackingService
      .subscribeToOrderUpdates('')
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => {
        const index = this.orders.findIndex((o) => o.orderId === order.orderId);
        if (index !== -1) {
          this.orders[index] = order;
        } else {
          this.orders.push(order);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopSimulation();
  }

  // ==================== DRIVER SIMULATION ====================

  startSimulation(): void {
    if (this.isSimulating) return;

    this.isSimulating = true;

    // Create 3 demo drivers
    this.drivers = [
      {
        driverId: 'driver1',
        longitude: 7.262,
        latitude: 43.7102,
        speed: 0,
        heading: 0,
        accuracy: 10,
        status: 'AVAILABLE',
        currentOrderId: undefined,
      },
      {
        driverId: 'driver2',
        longitude: 7.272,
        latitude: 43.7052,
        speed: 0,
        heading: 0,
        accuracy: 10,
        status: 'DELIVERING',
        currentOrderId: 'ORD001',
      },
      {
        driverId: 'driver3',
        longitude: 7.252,
        latitude: 43.7152,
        speed: 0,
        heading: 0,
        accuracy: 10,
        status: 'AVAILABLE',
        currentOrderId: undefined,
      },
    ];

    this.simulationInterval = setInterval(() => {
      this.drivers.forEach((driver) => {
        // Simulate movement
        if (driver.status === 'DELIVERING') {
          driver.longitude += (Math.random() - 0.5) * 0.001;
          driver.latitude += (Math.random() - 0.5) * 0.001;
          driver.speed = 20 + Math.random() * 30;
          driver.heading = Math.floor(Math.random() * 360);

          // Send to backend
          this.trackingService.updateDriverLocation(driver).subscribe();
        }
      });
    }, 2000);
  }

  stopSimulation(): void {
    this.isSimulating = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  changeDriverStatus(driverId: string, status: string): void {
    const driver = this.drivers.find((d) => d.driverId === driverId);
    if (driver) {
      driver.status = status as any;
      this.trackingService.updateDriverStatus(driverId, status).subscribe();
    }
  }

  onDriverStatusChange(driverId: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.changeDriverStatus(driverId, selectElement.value);
  }

  // ==================== ORDER MANAGEMENT ====================

  createDemoOrder(): void {
    const orderId = `ORD${Date.now().toString().slice(-6)}`;
    const order: OrderTracking = {
      orderId,
      driverId: 'driver2',
      customerId: this.authService.getUsername() || 'customer1',
      status: 'PENDING',
      estimatedArrivalMinutes: 25,
      restaurantLocation: {
        longitude: 7.262,
        latitude: 43.7102,
      },
      customerLocation: {
        longitude: 7.272,
        latitude: 43.7052,
      },
      events: [
        {
          eventType: 'ORDER_CREATED',
          description: 'Commande créée',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    this.trackingService.createOrderTracking(order).subscribe({
      next: (createdOrder) => {
        this.orders.push(createdOrder);
        console.log('Order created:', createdOrder);
      },
      error: (err) => {
        console.error('Error creating order:', err);
      },
    });
  }

  updateOrderStatus(orderId: string, status: string): void {
    this.trackingService.updateOrderStatus(orderId, status).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex((o) => o.orderId === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }

        // Add event
        const event = {
          eventType: `STATUS_${status}`,
          description: this.getStatusDescription(status),
          timestamp: new Date().toISOString(),
        };

        if (!updatedOrder.events) updatedOrder.events = [];
        updatedOrder.events.push(event);
      },
      error: (err) => {
        console.error('Error updating order status:', err);
      },
    });
  }

  getStatusDescription(status: string): string {
    const descriptions: { [key: string]: string } = {
      PENDING: 'En attente de collecte',
      PICKING_UP: 'Collecte en cours',
      IN_TRANSIT: 'En route vers le client',
      DELIVERED: 'Livré avec succès',
    };
    return descriptions[status] || status;
  }

  markAsDelivered(orderId: string): void {
    this.trackingService.markAsDelivered(orderId).subscribe({
      next: (deliveredOrder) => {
        const index = this.orders.findIndex((o) => o.orderId === orderId);
        if (index !== -1) {
          this.orders[index] = deliveredOrder;
          deliveredOrder.actualDeliveryTime = new Date().toISOString();
        }
      },
      error: (err) => {
        console.error('Error marking as delivered:', err);
      },
    });
  }

  selectOrder(orderId: string): void {
    this.selectedOrderId = this.selectedOrderId === orderId ? null : orderId;
  }

  // Helper methods
  getAvailableDrivers(): number {
    return this.drivers.filter((d) => d.status === 'AVAILABLE').length;
  }

  getDeliveringDrivers(): number {
    return this.drivers.filter((d) => d.status === 'DELIVERING').length;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      PENDING: '#f59e0b',
      PICKING_UP: '#3b82f6',
      IN_TRANSIT: '#8b5cf6',
      DELIVERED: '#10b981',
    };
    return colors[status] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      PENDING: '⏳ En attente',
      PICKING_UP: '🏪 Collecte',
      IN_TRANSIT: '🚚 Livraison',
      DELIVERED: '✅ Livré',
    };
    return labels[status] || status;
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
