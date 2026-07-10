import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { TrackingService, OrderTracking, DriverLocation } from '../../core/tracking.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Import Leaflet
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Données statiques pour simulation (Nice, France)
const STATIC_DATA = {
  // Adresses de restaurants fixes
  restaurants: [
    {
      id: 'REST001',
      name: 'La Petite Maison',
      address: '11 Rue Saint-François de Paule, 06300 Nice',
      latitude: 43.6985,
      longitude: 7.2755
    },
    {
      id: 'REST002',
      name: 'Chez Pippo',
      address: '15 Av. Jean Médecin, 06000 Nice',
      latitude: 43.7034,
      longitude: 7.2663
    },
    {
      id: 'REST003',
      name: 'Le Got',
      address: '35 Bd Victor Hugo, 06000 Nice',
      latitude: 43.7019,
      longitude: 7.2580
    }
  ],
  
  // Adresses clients fixes
  customers: [
    {
      id: 'CUST001',
      name: 'Maison Client Test',
      address: 'Promenade des Anglais, 06000 Nice',
      latitude: 43.6951,
      longitude: 7.2658
    },
    {
      id: 'CUST002',
      name: 'Appartement Centre Ville',
      address: 'Rue de la Liberté, 06000 Nice',
      latitude: 43.7050,
      longitude: 7.2700
    },
    {
      id: 'CUST003',
      name: 'Villa Mont Boron',
      address: 'Boulevard du Mont Boron, 06300 Nice',
      latitude: 43.6950,
      longitude: 7.2850
    }
  ],
  
  // Livreurs disponibles
  drivers: [
    {
      id: 'LIV001',
      name: 'Jean Dupont',
      phone: '+33 6 12 34 56 78'
    },
    {
      id: 'LIV002',
      name: 'Marie Martin',
      phone: '+33 6 98 76 54 32'
    },
    {
      id: 'LIV003',
      name: 'Pierre Bernard',
      phone: '+33 6 55 44 33 22'
    }
  ],
  
  // Commandes pré-définies avec toutes les informations
  orders: [
    {
      orderId: 'ORD001',
      restaurantId: 'REST001',
      customerId: 'CUST001',
      driverId: 'LIV001',
      status: 'IN_TRANSIT' as const,
      pickupTime: new Date(Date.now() - 15 * 60000).toISOString(), // 15 min ago
      items: ['Paella à la catalane', 'Salade niçoise', 'Tarte tropézienne'],
      total: 45.50
    },
    {
      orderId: 'ORD002',
      restaurantId: 'REST002',
      customerId: 'CUST002',
      driverId: 'LIV002',
      status: 'PENDING' as const,
      pickupTime: null,
      items: ['Pizza 4 fromages', 'Salade composer'],
      total: 28.00
    },
    {
      orderId: 'ORD003',
      restaurantId: 'REST003',
      customerId: 'CUST003',
      driverId: 'LIV003',
      status: 'DELIVERED' as const,
      pickupTime: new Date(Date.now() - 45 * 60000).toISOString(),
      actualDeliveryTime: new Date(Date.now() - 20 * 60000).toISOString(),
      items: ['Burger artisanal', 'Frites maison', 'Soda'],
      total: 32.00
    }
  ]
};

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css'],
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  @ViewChild('mapContainer') mapContainerRef?: ElementRef;
  private map: L.Map | null = null;
  private driverMarker: L.Marker | null = null;
  private routePolyline: L.Polyline | null = null;
  private deliveryRoute: L.Polyline | null = null;

  // Form state
  orderIdInput = '';
  order: any = null; // Utilise notre commande statique
  isTracking = false;
  isLoading = false;
  
  // Display helpers
  currentTime: string = '';
  formattedPickupTime: string = '';
  formattedDeliveryTime: string = '';
  
  // Real-time driver location
  currentDriverLocation: any = null;
  etaMinutes: number = 0;
  distanceKm: number = 0;
  
  // Simulation
  private simulationInterval: any = null;
  private progress: number = 0;

  // Status configuration
  statusColors: { [key: string]: string } = {
    PENDING: '#f59e0b',
    PICKING_UP: '#3b82f6',
    IN_TRANSIT: '#8b5cf6',
    DELIVERED: '#10b981',
  };

  statusLabels: { [key: string]: string } = {
    PENDING: '⏳ En attente de collecte',
    PICKING_UP: '🏪 Collecte en cours',
    IN_TRANSIT: '🚚 En route vers chez vous',
    DELIVERED: '✅ Déjà livré',
  };

  constructor(
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentTime = this.formatTime(new Date().toISOString());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopSimulation();
    
    if (this.map) {
      this.map.remove();
    }
  }

  trackOrder(): void {
    if (!this.orderIdInput.trim()) return;

    this.isLoading = true;
    
    const orderId = this.orderIdInput.trim().toUpperCase();
    
    // Trouver la commande dans nos données statiques
    const staticOrder = STATIC_DATA.orders.find(o => o.orderId === orderId);
    
    setTimeout(() => {
      if (staticOrder) {
        // Charger les données complètes de la commande
        this.loadOrderWithDetails(staticOrder);
        this.isLoading = false;
      } else {
        this.isLoading = false;
        alert(`Commande ${orderId} non trouvée.\n\nCommandes disponibles :\n- ORD001 (Livraison en cours)\n- ORD002 (En attente)\n- ORD003 (Déjà livrée)`);
      }
    }, 800);
  }

  loadOrderWithDetails(staticOrder: any): void {
    const restaurant = STATIC_DATA.restaurants.find(r => r.id === staticOrder.restaurantId);
    const customer = STATIC_DATA.customers.find(c => c.id === staticOrder.customerId);
    const driver = STATIC_DATA.drivers.find(d => d.id === staticOrder.driverId);
    
    if (!restaurant || !customer || !driver) return;
    
    // Créer l'objet commande complet
    this.order = {
      ...staticOrder,
      restaurant: restaurant,
      customer: customer,
      driver: driver,
      events: this.generateOrderEvents(staticOrder, restaurant, customer)
    };
    
    this.isTracking = true;
    this.currentTime = this.formatTime(new Date().toISOString());
    
    if (this.order.pickupTime) {
      this.formattedPickupTime = this.formatTime(this.order.pickupTime);
    }
    if (this.order.actualDeliveryTime) {
      this.formattedDeliveryTime = this.formatTime(this.order.actualDeliveryTime);
    }
    
    // Initialiser la carte et la simulation
    setTimeout(() => {
      this.initMap();
      this.startDriverSimulation();
    }, 500);
  }

  generateOrderEvents(order: any, restaurant: any, customer: any): any[] {
    const events = [];
    const now = new Date();
    
    // Event: Commande créée
    events.push({
      eventType: 'ORDER_CREATED',
      description: `Commande passée chez ${restaurant.name}`,
      timestamp: new Date(now.getTime() - 60 * 60000).toISOString(), // 1 hour ago
      location: { latitude: restaurant.latitude, longitude: restaurant.longitude }
    });
    
    // Event: Confirmée
    events.push({
      eventType: 'ORDER_CONFIRMED',
      description: 'Commande confirmée par le restaurant',
      timestamp: new Date(now.getTime() - 55 * 60000).toISOString(),
      location: { latitude: restaurant.latitude, longitude: restaurant.longitude }
    });
    
    if (order.status !== 'PENDING') {
      // Event: Livreur assigné
      events.push({
        eventType: 'DRIVER_ASSIGNED',
        description: `Livreur ${order.driverId} assigné`,
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
        location: { latitude: restaurant.latitude, longitude: restaurant.longitude }
      });
      
      // Event: Collecte
      if (order.pickupTime) {
        events.push({
          eventType: 'PICKED_UP',
          description: 'Colletée au restaurant',
          timestamp: order.pickupTime,
          location: { latitude: restaurant.latitude, longitude: restaurant.longitude }
        });
      }
    }
    
    if (order.status === 'DELIVERED' && order.actualDeliveryTime) {
      // Event: Livré
      events.push({
        eventType: 'DELIVERED',
        description: `Livré à ${customer.address}`,
        timestamp: order.actualDeliveryTime,
        location: { latitude: customer.latitude, longitude: customer.longitude }
      });
    }
    
    return events;
  }

  initMap(): void {
    if (!this.order || !this.mapContainerRef?.nativeElement) return;

    if (this.map) {
      this.map.remove();
    }

    const restaurant = this.order.restaurant;
    const customer = this.order.customer;

    // Position de départ ou d'arrivée
    const startPos = this.getCurrentDriverPosition();
    const centerLat = startPos.latitude || customer.latitude;
    const centerLng = startPos.longitude || customer.longitude;

    // Créer la carte
    this.map = L.map(this.mapContainerRef.nativeElement).setView([centerLat, centerLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    // Marker Restaurant
    const restaurantIcon = this.createCustomIcon('🏪', '#f59e0b');
    L.marker([restaurant.latitude, restaurant.longitude], { icon: restaurantIcon })
      .addTo(this.map!)
      .bindPopup(`<strong>🏪 ${restaurant.name}</strong><br>${restaurant.address}`)
      .openPopup();

    // Marker Client
    const homeIcon = this.createCustomIcon('🏠', '#10b981');
    L.marker([customer.latitude, customer.longitude], { icon: homeIcon })
      .addTo(this.map!)
      .bindPopup(`<strong>🏠 Destination</strong><br>${customer.address}`);

    // Initialiser le livreur
    if (startPos.latitude && startPos.longitude) {
      this.addDriverMarker(startPos.latitude, startPos.longitude, this.order.status);
    }

    // Dessiner le trajet
    if (startPos.latitude && startPos.longitude) {
      this.drawRoute(startPos.latitude, startPos.longitude, customer.latitude, customer.longitude);
    }

    // Centrer la vue sur tout
    const bounds = L.latLngBounds([
      [restaurant.latitude, restaurant.longitude],
      [customer.latitude, customer.longitude]
    ]);
    
    if (startPos.latitude && startPos.longitude) {
      bounds.extend([startPos.latitude, startPos.longitude]);
    }
    
    this.map.fitBounds(bounds.pad(0.2));

    console.log('Carte initialisée avec succès');
  }

  createCustomIcon(emoji: string, color: string): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `<div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">${emoji}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  }

  getCurrentDriverPosition(): { latitude?: number; longitude?: number } {
    const order = this.order;
    
    if (order.status === 'PENDING') {
      // Pas encore collecté, position près du restaurant
      return {
        latitude: order.restaurant.latitude + 0.001,
        longitude: order.restaurant.longitude + 0.001
      };
    } else if (order.status === 'DELIVERED') {
      // Déjà livré, au client
      return {
        latitude: order.customer.latitude,
        longitude: order.customer.longitude
      };
    } else {
      // En transit, commencer depuis le restaurant
      return {
        latitude: order.restaurant.latitude,
        longitude: order.restaurant.longitude
      };
    }
  }

  addDriverMarker(lat: number, lng: number, status: string): void {
    if (!this.map) return;

    // Remove existing marker
    if (this.driverMarker) {
      this.map!.removeLayer(this.driverMarker);
    }

    const driverIcon = L.divIcon({
      className: '',
      html: `<div style="
        background: ${status === 'DELIVERED' ? '#10b981' : '#ef4444'};
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        animation: pulse 2s infinite;
      ">🚗</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    this.driverMarker = L.marker([lat, lng], { icon: driverIcon })
      .addTo(this.map!)
      .bindPopup(`
        <div style="min-width: 200px;">
          <strong style="font-size: 16px;">👤 ${this.order.driver.name}</strong><br/>
          <small>📞 ${this.order.driver.phone}</small><br/><br/>
          <strong style="color: #8b5cf6;">${this.getStatusLabel(this.order.status)}</strong><br/>
          <small>⏱️ ETA: ~${this.etaMinutes} min</small>
        </div>
      `);
  }

  drawRoute(startLat: number, startLng: number, endLat: number, endLng: number): void {
    if (!this.map) return;

    // Remove old polyline
    if (this.routePolyline) {
      this.map!.removeLayer(this.routePolyline);
    }

    const latLngs: [number, number][] = [
      [startLat, startLng],
      [endLat, endLng]
    ];

    this.routePolyline = L.polyline(latLngs, {
      color: '#8b5cf6',
      weight: 5,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(this.map!);

    // Update ETA
    const dLat = Math.abs(endLat - startLat);
    const dLng = Math.abs(endLng - startLng);
    const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
    this.distanceKm = Math.round(distance * 10) / 10;
    this.etaMinutes = Math.max(2, Math.round((this.distanceKm / 30) * 60));

    // Store full route for animation
    this.deliveryRoute = this.routePolyline;
  }

  startDriverSimulation(): void {
    if (this.order.status !== 'IN_TRANSIT') return;

    const start = {
      lat: this.order.restaurant.latitude,
      lng: this.order.restaurant.longitude
    };
    
    const end = {
      lat: this.order.customer.latitude,
      lng: this.order.customer.longitude
    };

    this.progress = 0;

    this.simulationInterval = setInterval(() => {
      this.progress += 2; // Progress by 2% every 2 seconds
      
      if (this.progress >= 100) {
        this.progress = 100;
        this.stopSimulation();
        
        // Arrivé au client
        this.updateDriverPosition(end.lat, end.lng);
        this.calculateEta(end.lat, end.lng);
        return;
      }

      // Interpolate position
      const currentLat = start.lat + (end.lat - start.lat) * (this.progress / 100);
      const currentLng = start.lng + (end.lng - start.lng) * (this.progress / 100);

      this.updateDriverPosition(currentLat, currentLng);
      this.calculateEta(end.lat, end.lng);

    }, 2000);
  }

  updateDriverPosition(lat: number, lng: number): void {
    if (!this.map || !this.driverMarker) return;

    this.driverMarker.setLatLng([lat, lng]);
    
    // Calculate heading
    const angle = Math.atan2(
      this.order.customer.longitude - lng,
      this.order.customer.latitude - lat
    ) * 180 / Math.PI + 90;

    // Update popup with heading
    this.driverMarker.bindPopup(`
      <div style="min-width: 200px;">
        <strong style="font-size: 16px;">👤 ${this.order.driver.name}</strong><br/>
        <small>📞 ${this.order.driver.phone}</small><br/><br/>
        <strong style="color: #ef4444;">🚚 En livraison</strong><br/>
        <small>⚡ Vitesse: ${Math.floor(20 + Math.random() * 30)} km/h</small><br/>
        <small>🧭 Cap: ${Math.floor(angle)}°</small><br/>
        <small>⏱️ ETA: ~${this.etaMinutes} min</small>
      </div>
    `);

    // Pan map to driver (optional - can be too aggressive)
    // this.map.panTo([lat, lng]);
  }

  calculateEta(targetLat: number, targetLng: number): void {
    if (!this.currentDriverLocation) return;

    const dLat = Math.abs(targetLat - this.currentDriverLocation.latitude);
    const dLng = Math.abs(targetLng - this.currentDriverLocation.longitude);
    const remainingDistance = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
    
    this.etaMinutes = Math.max(1, Math.round((remainingDistance / 30) * 60));
  }

  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  hasEvents(): boolean {
    return !!this.order?.events && this.order.events.length > 0;
  }

  resetSearch(): void {
    this.orderIdInput = '';
    this.isTracking = false;
    this.stopSimulation();
    
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    
    this.order = null;
    this.currentDriverLocation = null;
    this.driverMarker = null;
    this.routePolyline = null;
  }

  windowOpen(): void {
    if (typeof window !== 'undefined' && this.order?.customer?.latitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.order.customer.latitude},${this.order.customer.longitude}`;
      window.open(url, '_blank');
    }
  }
}
