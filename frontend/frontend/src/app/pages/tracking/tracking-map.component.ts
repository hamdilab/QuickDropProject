import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import {
  TrackingService,
  DriverLocation,
  NearbyDriver,
} from '../../core/tracking.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Leaflet
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-tracking-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-map.component.html',
  styleUrls: ['./tracking-map.component.css'],
})
export class TrackingMapComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: false }) mapContainer?: any;

  map: L.Map | null = null;
  driverMarkers: { [key: string]: L.Marker } = {};
  nearbyDrivers: NearbyDriver[] = [];
  myLocation: { lat: number; lng: number } = { lat: 43.75, lng: 7.25 };
  isConnecting = false;
  connectionStatus = 'Déconnexion';
  currentStatus = 'AVAILABLE';
  private destroy$ = new Subject<void>();

  statuses = [
    { value: 'AVAILABLE', label: '🟢 Disponible', color: '#10b981' },
    { value: 'DELIVERING', label: '🔴 En livraison', color: '#ef4444' },
    { value: 'OFFLINE', label: '⚫ Hors ligne', color: '#6b7280' },
  ];

  constructor(
    private trackingService: TrackingService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.isConnecting = true;
    this.trackingService.connectWebSocket();

    this.trackingService
      .isConnectedToWebSocket()
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected) => {
        this.connectionStatus = connected ? 'En ligne' : 'Déconnexion';
        this.isConnecting = false;
      });

    this.trackingService
      .subscribeToDriverUpdates('')
      .pipe(takeUntil(this.destroy$))
      .subscribe((location) => this.updateDriverMarker(location));

    setTimeout(() => this.initMap(), 500);
    this.getCurrentLocation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.trackingService.disconnectWebSocket();
    if (this.map) this.map.remove();
  }

  initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    this.map = L.map(this.mapContainer.nativeElement).setView(
      [43.7051, 7.2658],
      13,
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    const locationIcon = L.icon({
      iconUrl: 'assets/marker-icon-blue.png',
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    });

    L.marker([this.myLocation.lat, this.myLocation.lng], { icon: locationIcon })
      .addTo(this.map)
      .bindPopup('📍 Ma position')
      .openPopup();
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.myLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (this.map)
            this.map.setView([this.myLocation.lat, this.myLocation.lng], 14);
          this.sendLocationUpdate();
        },
        () => {
          this.myLocation = { lat: 43.7051, lng: 7.2658 };
        },
      );
    }
  }

  sendLocationUpdate(): void {
    const driverId = this.authService.getUsername() || 'driver1';
    const location: DriverLocation = {
      driverId,
      longitude: this.myLocation.lng,
      latitude: this.myLocation.lat,
      speed: 30,
      heading: 180,
      accuracy: 10,
      status: this.currentStatus as any,
    };

    this.trackingService.updateDriverLocation(location).subscribe();
    this.trackingService.sendDriverLocation(location);
  }

  updateDriverMarker(location: DriverLocation): void {
    if (!this.map) return;
    const marker = this.driverMarkers[location.driverId];

    if (marker) {
      marker.setLatLng([location.latitude, location.longitude]);
    } else {
      const icon = L.icon({
        iconUrl: this.getStatusIcon(location.status),
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });

      const newMarker = L.marker([location.latitude, location.longitude], {
        icon,
      }).addTo(this.map).bindPopup(`
          <div style="text-align: center;">
            <strong>Livreur ${location.driverId}</strong><br/>
            <span style="color: ${this.getStatusColor(location.status)}">
              ${location.status}
            </span><br/>
            Vitesse: ${location.speed} km/h
          </div>
        `);

      this.driverMarkers[location.driverId] = newMarker;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'assets/marker-icon-green.png';
      case 'DELIVERING':
        return 'assets/marker-icon-red.png';
      default:
        return 'assets/marker-icon-gray.png';
    }
  }

  getStatusColor(status: string): string {
    const statusObj = this.statuses.find((s) => s.value === status);
    return statusObj?.color || '#6b7280';
  }

  findNearbyDrivers(): void {
    const request = {
      longitude: this.myLocation.lng,
      latitude: this.myLocation.lat,
      radiusMeters: 5000,
    };

    this.trackingService.findNearbyDrivers(request).subscribe({
      next: (drivers) => (this.nearbyDrivers = drivers),
      error: (err) => console.error('Error finding nearby drivers:', err),
    });
  }

  changeStatus(status: string): void {
    const driverId = this.authService.getUsername() || 'driver1';
    this.currentStatus = status;

    this.trackingService.updateDriverStatus(driverId, status).subscribe({
      next: (updated) => this.updateDriverMarker(updated),
      error: (err) => console.error('Error updating status:', err),
    });
  }
}
