import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { TrackingService, OrderTracking } from '../../core/tracking.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css'],
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  orders: OrderTracking[] = [];
  selectedOrder: OrderTracking | null = null;
  orderIdInput = '';
  isLoading = false;
  private destroy$ = new Subject<void>();

  statusColors: { [key: string]: string } = {
    PENDING: '#f59e0b',
    PICKING_UP: '#3b82f6',
    IN_TRANSIT: '#8b5cf6',
    DELIVERED: '#10b981',
  };

  statusLabels: { [key: string]: string } = {
    PENDING: '⏳ En attente',
    PICKING_UP: '🏪 En cours de collecte',
    IN_TRANSIT: '🚚 En livraison',
    DELIVERED: '✅ Livré',
  };

  constructor(
    private trackingService: TrackingService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadMyOrders();

    this.trackingService
      .subscribeToOrderUpdates('')
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => this.updateOrder(order));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMyOrders(): void {
    this.isLoading = true;
    const customerId = this.authService.getUsername() || 'customer1';

    this.trackingService.getOrdersByCustomer(customerId).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.isLoading = false;
      },
    });
  }

  trackOrder(): void {
    if (!this.orderIdInput.trim()) return;

    this.isLoading = true;
    this.trackingService.getOrderTracking(this.orderIdInput.trim()).subscribe({
      next: (order) => {
        this.selectedOrder = order;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error tracking order:', err);
        this.isLoading = false;
      },
    });
  }

  updateOrder(updatedOrder: OrderTracking): void {
    const index = this.orders.findIndex(
      (o) => o.orderId === updatedOrder.orderId,
    );
    if (index !== -1) {
      this.orders[index] = updatedOrder;
      if (this.selectedOrder?.orderId === updatedOrder.orderId) {
        this.selectedOrder = updatedOrder;
      }
    }
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  selectOrder(order: OrderTracking): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }
}
