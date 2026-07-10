import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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

// Import Leaflet
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-tracking-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-demo.component.html',
  styleUrls: ['./tracking-demo.component.css'],
})
export class TrackingDemoComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  
  // Map references
  @ViewChild('mapContainer') mapContainerRef?: ElementRef;
  private map: L.Map | null = null;
  private driverMarkers: { [key: string]: L.Marker } = {};

  // Driver simulation
  drivers: DriverLocation[] = [];
  simulationInterval: any = null;
  isSimulating = false;

  // Orders
  orders: OrderTracking[] = [];
  selectedOrderId: string | null = null;

  // Demo delivery flow
  isDemoRunning = false;
  currentDemoStep = 0;

  // Map center (Tunis, Tunisia)
  mapCenter = { lat: 36.8065, lng: 10.1815 };
  
  // User's current location
  userLocation: { lat: number, lng: number } | null = null;
  private userMarker: L.Marker | null = null;
  private userLocationCircle: L.Circle | null = null;

  constructor(
    private trackingService: TrackingService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.trackingService.connectWebSocket();

    // Only subscribe to order updates for this customer's orders
    this.trackingService
      .subscribeToOrderUpdates('')
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => {
        // Only process if this order belongs to current customer (customer1)
        if (order.customerId === 'customer1') {
          const index = this.orders.findIndex((o) => o.orderId === order.orderId);
          if (index !== -1) {
            this.orders[index] = order;
          } else {
            this.orders.push(order);
          }
          
          // Fetch ONLY the driver associated with this order
          if (order.driverId) {
            this.trackingService.getDriverLocation(order.driverId).subscribe({
              next: (driver) => {
                // Replace all drivers with only this one
                this.drivers = [driver];
                
                // Update marker on map
                if (this.map) {
                  this.updateDriverMarker(driver);
                }
              },
              error: (err) => console.error('Error fetching driver:', err)
            });
          }
        }
      });
      
    // Load initial data
    this.loadDemoData();
  }

  loadDemoData(): void {
    console.log('Loading customer orders...');
    
    // Clear previous data
    this.drivers = [];
    this.orders = [];
    this.driverMarkers = {};
    
    // Load orders ONLY for current customer (matching your MongoDB data: 'customer-001')
    this.trackingService.getOrdersByCustomer('customer-001').subscribe({
      next: (orders) => {
        console.log('Loaded customer orders:', orders);
        this.orders = orders;
        
        // For each order, fetch ONLY its associated driver
        orders.forEach(order => {
          if (order.driverId) {
            console.log('Fetching driver for order:', order.orderId);
            this.trackingService.getDriverLocation(order.driverId).subscribe({
              next: (driver) => {
                console.log('Loaded driver:', driver.driverId);
                // Only keep this driver (replace all others)
                const exists = this.drivers.find(d => d.driverId === driver.driverId);
                if (!exists) {
                  this.drivers.push(driver);
                  
                  // Add to map after a short delay
                  setTimeout(() => {
                    if (!this.driverMarkers[driver.driverId] && this.map) {
                      this.addDriverToMap(driver);
                    }
                  }, 100);
                }
              },
              error: (err) => console.error(`Error loading driver ${order.driverId}:`, err)
            });
          }
        });
      },
      error: (err) => console.error('Error loading orders:', err)
    });
  }

  ngAfterViewInit(): void {
    // Initialize map after view is ready
    setTimeout(() => {
      this.initMap();
      // Load existing drivers and orders from backend
      this.loadDemoData();
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopSimulation();
    
    // Clean up map
    if (this.map) {
      this.map.remove();
    }
  }

  // ==================== MAP FUNCTIONS ====================

  initMap(): void {
    const container = this.mapContainerRef?.nativeElement;
    if (!container) {
      console.error('Map container not found');
      return;
    }

    // Check if map already exists
    if (this.map) {
      this.map.remove();
    }

    try {
      // Get user's current location first
      this.getUserCurrentLocation();
      
      // Create map - will center on user location or default to Tunis
      const initialCenter = this.userLocation 
        ? [this.userLocation.lat, this.userLocation.lng]
        : [36.8065, 10.1815]; // Tunis center
      
      this.map = L.map(container).setView(initialCenter as [number, number], 12);

      // Add OpenStreetMap tiles (FREE, no API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.map);

      // Add user location marker if available
      if (this.userLocation) {
        this.addUserLocationMarker();
      }

      // Create custom icons for drivers
      const availableIcon = this.createDriverIcon('available');
      const deliveringIcon = this.createDriverIcon('delivering');

      console.log('Found', this.drivers.length, 'drivers to display');

      // Add existing drivers to map
      this.drivers.forEach(driver => {
        console.log('Adding driver:', driver.driverId, 'at', driver.latitude, driver.longitude);
        this.addDriverToMap(driver);
      });

      // Draw route between user and driver if both locations available
      if (this.userLocation && this.drivers.length > 0) {
        this.drawRouteToDriver();
      }

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  createDriverIcon(status: 'available' | 'delivering'): L.DivIcon {
    const color = status === 'available' ? '#10b981' : '#ef4444';
    
    return L.divIcon({
      className: '',
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: white;
        ">${status === 'available' ? '🟢' : '🔴'}</div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    }) as L.DivIcon;
  }

  addDriverToMap(driver: DriverLocation): void {
    const icon = this.createDriverIcon(driver.status === 'DELIVERING' ? 'delivering' : 'available');
    
    const marker = L.marker([driver.latitude, driver.longitude], { icon })
      .addTo(this.map!)
      .bindPopup(`
        <div style="min-width: 150px;">
          <strong style="font-size: 14px;">🚗 Livreur ${driver.driverId}</strong><br/>
          <span style="color: ${driver.status === 'DELIVERING' ? '#ef4444' : '#10b981'}; font-weight: bold;">
            ${driver.status}
          </span><br/>
          <small>⚡ Vitesse: ${driver.speed} km/h</small><br/>
          <small>📍 ${driver.latitude.toFixed(4)}, ${driver.longitude.toFixed(4)}</small><br/>
          ${driver.currentOrderId ? `<small>📦 Commande: ${driver.currentOrderId}</small>` : ''}
        </div>
      `);

    this.driverMarkers[driver.driverId] = marker;
  }

  updateDriverMarker(driver: DriverLocation): void {
    if (!this.map || !this.driverMarkers[driver.driverId]) return;

    const marker = this.driverMarkers[driver.driverId];
    const newLatLng = new L.LatLng(driver.latitude, driver.longitude);
    
    // Update position with animation
    marker.setLatLng(newLatLng);
    
    // Update icon based on status
    const icon = this.createDriverIcon(driver.status === 'DELIVERING' ? 'delivering' : 'available');
    marker.setIcon(icon);
    
    // Update popup content
    marker.bindPopup(`
      <div style="min-width: 150px;">
        <strong style="font-size: 14px;">🚗 Livreur ${driver.driverId}</strong><br/>
        <span style="color: ${driver.status === 'DELIVERING' ? '#ef4444' : '#10b981'}; font-weight: bold;">
          ${driver.status}
        </span><br/>
        <small>⚡ Vitesse: ${driver.speed} km/h</small><br/>
        <small>📍 ${driver.latitude.toFixed(4)}, ${driver.longitude.toFixed(4)}</small><br/>
        ${driver.currentOrderId ? `<small>📦 Commande: ${driver.currentOrderId}</small>` : ''}
      </div>
    `);
  }

  centerMapOnDrivers(): void {
    if (!this.map) return;

    // If we have user location and driver, center on both
    if (this.userLocation && this.drivers.length > 0) {
      const deliveringDriver = this.drivers.find(d => d.status === 'DELIVERING') || this.drivers[0];
      
      const bounds = L.latLngBounds([
        [this.userLocation.lat, this.userLocation.lng],
        [deliveringDriver.latitude, deliveringDriver.longitude],
      ]);
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
    // If only user location is available
    else if (this.userLocation) {
      this.map.setView([this.userLocation.lat, this.userLocation.lng], 15);
    }
    // Fallback to drivers only
    else if (this.drivers.length > 0) {
      const deliveringDriver = this.drivers.find(d => d.status === 'DELIVERING');
      
      if (deliveringDriver) {
        this.map.setView([deliveringDriver.latitude, deliveringDriver.longitude], 15);
      } else {
        this.fitAllDrivers();
      }
    }
  }

  /**
   * Center map on user's current location
   */
  centerMapOnUser(): void {
    if (!this.map || !this.userLocation) {
      // Try to get location if not available
      this.refreshUserLocation();
      setTimeout(() => {
        if (this.userLocation && this.map) {
          this.map.setView([this.userLocation.lat, this.userLocation.lng], 16);
        }
      }, 1000);
      return;
    }
    
    this.map.setView([this.userLocation.lat, this.userLocation.lng], 16);
    
    // Reopen popup
    if (this.userMarker) {
      (this.userMarker as L.Marker).openPopup();
    }
  }

  fitAllDrivers(): void {
    if (!this.map || this.drivers.length === 0) return;

    const markers = this.drivers.map(d => L.marker([d.latitude, d.longitude]));
    const group = new L.FeatureGroup(markers);
    this.map.fitBounds(group.getBounds().pad(0.2));
  }

  // ==================== DRIVER SIMULATION ====================

  startSimulation(): void {
    if (this.isSimulating) return;

    this.isSimulating = true;

    // Create 3 demo drivers with visible positions in Nice
    this.drivers = [
      {
        driverId: 'driver1',
        longitude: 7.2620,
        latitude: 43.7102,
        speed: 0,
        heading: 0,
        accuracy: 10,
        status: 'AVAILABLE',
        currentOrderId: undefined,
      },
      {
        driverId: 'driver2',
        longitude: 7.2650,
        latitude: 43.7080,
        speed: 0,
        heading: 0,
        accuracy: 10,
        status: 'DELIVERING',
        currentOrderId: 'ORD001',
      },
      {
        driverId: 'driver3',
        longitude: 7.2590,
        latitude: 43.7120,
        speed: 0,
        heading: 0,
        accuracy: 10,
        status: 'AVAILABLE',
        currentOrderId: undefined,
      },
    ];

    // Reinitialize map with new drivers
    setTimeout(() => {
      if (this.map) {
        this.map.remove();
      }
      this.initMap();
      this.centerMapOnDrivers();
    }, 100);

    this.simulationInterval = setInterval(() => {
      this.drivers.forEach((driver) => {
        // Simulate movement for delivering drivers
        if (driver.status === 'DELIVERING') {
          driver.longitude += (Math.random() - 0.5) * 0.0005;
          driver.latitude += (Math.random() - 0.5) * 0.0005;
          driver.speed = 20 + Math.random() * 30;
          driver.heading = Math.floor(Math.random() * 360);

          // Send to backend
          this.trackingService.updateDriverLocation(driver).subscribe();
        }
        
        // Update marker in real-time
        if (this.map && this.driverMarkers[driver.driverId]) {
          this.updateDriverMarker(driver);
        }
      });
      
      // Center map on first delivering driver if exists
      const deliveringDriver = this.drivers.find(d => d.status === 'DELIVERING');
      if (deliveringDriver && this.map) {
        this.map.setView([deliveringDriver.latitude, deliveringDriver.longitude], 15);
      }
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

  // ==================== DEMO DELIVERY FLOW ====================

  startDemoDelivery(): void {
    console.log('Starting demo delivery...');
    
    this.trackingService.startDemoDelivery().subscribe({
      next: (message) => {
        console.log('Demo started:', message);
        this.isDemoRunning = true;
        this.currentDemoStep = 1;
        
        // Clear previous data and reload only relevant order/driver
        this.drivers = [];
        this.orders = [];
        this.driverMarkers = {};
        
        // Reload data to show the new order and driver
        setTimeout(() => {
          this.loadDemoData();
          // Center map on the delivery route
          setTimeout(() => {
            this.centerMapOnDrivers();
          }, 1000);
        }, 500);
      },
      error: (err) => {
        console.error('Error starting demo:', err);
        alert('Erreur lors du démarrage de la démo. Vérifiez que MongoDB est démarré.');
      }
    });
  }

  simulateNextStep(): void {
    if (this.currentDemoStep > 4) return;
    
    const step = String(this.currentDemoStep);
    console.log(`Simulating step ${step}...`);
    
    this.trackingService.simulateDeliveryStep(step).subscribe({
      next: (message) => {
        console.log(`Step ${step} completed:`, message);
        this.currentDemoStep++;
        
        // Reload data
        setTimeout(() => {
          this.loadDemoData();
        }, 300);
      },
      error: (err) => {
        console.error(`Error in step ${step}:`, err);
      }
    });
  }

  completeAndResetDemo(): void {
    if (this.isDemoRunning && this.currentDemoStep <= 4) {
      // Complete remaining steps
      this.trackingService.completeDemoDelivery().subscribe({
        next: (message) => {
          console.log('Demo completed:', message);
          this.isDemoRunning = false;
          this.currentDemoStep = 0;
          
          // Reload data
          setTimeout(() => {
            this.loadDemoData();
          }, 500);
        },
        error: (err) => {
          console.error('Error completing demo:', err);
        }
      });
    } else {
      // Just reload data
      this.loadDemoData();
    }
  }
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

  // ==================== USER LOCATION FUNCTIONS ====================
  
  /**
   * Get user's current GPS location using browser Geolocation API
   */
  getUserCurrentLocation(): void {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('User location obtained:', this.userLocation);
        
        // Add marker to map if map is initialized
        if (this.map) {
          this.addUserLocationMarker();
          this.drawRouteToDriver();
        }
      },
      (error) => {
        console.warn('Error getting user location:', error.message);
        // Fallback to default location (Nice)
        this.userLocation = null;
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  /**
   * Add marker for user's current location
   */
  addUserLocationMarker(): void {
    if (!this.map || !this.userLocation) return;

    // Remove existing marker if any
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }
    if (this.userLocationCircle) {
      this.map.removeLayer(this.userLocationCircle);
    }

    // Custom icon for user location
    const userIcon = L.divIcon({
      className: '',
      html: `
        <div style="
          background-color: #3b82f6;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -15],
    });

    // Add marker
    this.userMarker = L.marker(
      [this.userLocation.lat, this.userLocation.lng],
      { icon: userIcon }
    )
      .addTo(this.map)
      .bindPopup('<strong>Votre position</strong><br>📍 Emplacement actuel')
      .openPopup();

    // Add accuracy circle
    this.userLocationCircle = L.circle(
      [this.userLocation.lat, this.userLocation.lng],
      {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: 20, // Approximate accuracy in meters
      }
    ).addTo(this.map);

    console.log('User location marker added');
  }

  /**
   * Draw route/polyline between user and driver
   */
  drawRouteToDriver(): void {
    if (!this.map || !this.userLocation || this.drivers.length === 0) return;

    // Get the delivering driver
    const deliveringDriver = this.drivers.find(d => d.status === 'DELIVERING') || this.drivers[0];

    // Remove existing route lines
    this.map.eachLayer(layer => {
      if (layer instanceof L.Polyline && !(layer instanceof L.Rectangle)) {
        this.map?.removeLayer(layer);
      }
    });

    // Draw line between user and driver
    const routeLine = L.polyline(
      [
        [this.userLocation.lat, this.userLocation.lng],
        [deliveringDriver.latitude, deliveringDriver.longitude],
      ],
      {
        color: '#10b981',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10',
        lineCap: 'round',
      }
    ).addTo(this.map);

    // Add distance label
    const distance = this.calculateDistance(
      this.userLocation.lng,
      this.userLocation.lat,
      deliveringDriver.longitude,
      deliveringDriver.latitude
    );

    // Calculate midpoint for label
    const midpointLat = (this.userLocation.lat + deliveringDriver.latitude) / 2;
    const midpointLng = (this.userLocation.lng + deliveringDriver.longitude) / 2;

    // Fit map bounds to show both user and driver
    const bounds = L.latLngBounds([
      [this.userLocation.lat, this.userLocation.lng],
      [deliveringDriver.latitude, deliveringDriver.longitude],
    ]);
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lon1: number, lat1: number, lon2: number, lat2: number): number {
    const R = 6371; // Radius of Earth in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Return in meters
  }

  toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  /**
   * Refresh user location (call this periodically or on button click)
   */
  refreshUserLocation(): void {
    this.getUserCurrentLocation();
  }
}
