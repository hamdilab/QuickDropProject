# QuickDrop - Tracking Service

## Description
Tracking Service is a microservice in the QuickDrop delivery platform that handles:
- Real-time GPS tracking of drivers
- Order tracking and status updates
- ETA (Estimated Time of Arrival) calculations
- Trip history management
- WebSocket/SSE for live updates

## Tech Stack
- **Framework**: Spring Boot 3
- **Database**: MongoDB
- **Communication**: REST API + WebSocket (STOMP)
- **Service Discovery**: Eureka
- **Inter-service Communication**: OpenFeign
- **Documentation**: Swagger/OpenAPI
- **Build Tool**: Maven

## Features

### 1. Driver Location Management
- Update driver GPS coordinates in real-time
- Track driver status (AVAILABLE, DELIVERING, OFFLINE)
- Find nearby drivers using geospatial queries
- Calculate distance between points using Haversine formula

### 2. Order Tracking
- Create and manage order tracking records
- Update order status (PENDING, PICKING_UP, IN_TRANSIT, DELIVERED)
- Track order lifecycle with event timeline
- Get tracking info by order ID, driver ID, or customer ID

### 3. ETA Calculation
- Calculate estimated time of arrival
- Adjust ETA based on time of day (peak/off-peak hours)
- Distance calculation between any two points
- Real-time speed-based ETA updates

### 4. Trip History
- Record complete trip history for drivers
- Store all location points during a trip
- Calculate trip statistics (distance, duration, average speed)
- Query trips by driver and date range

### 5. Real-time Updates (WebSocket)
- Live driver location broadcasts
- Order status updates via WebSocket
- ETA updates in real-time

## API Endpoints

### Driver Location
- `POST /api/v1/drivers/location` - Update driver location
- `GET /api/v1/drivers/{driverId}/location` - Get driver location
- `POST /api/v1/drivers/nearby` - Find nearby drivers
- `GET /api/v1/drivers/status/{status}` - Get drivers by status
- `PUT /api/v1/drivers/{driverId}/status` - Update driver status

### Order Tracking
- `POST /api/v1/orders` - Create order tracking
- `GET /api/v1/orders/{orderId}` - Get order tracking
- `PUT /api/v1/orders/{orderId}/location` - Update order location
- `PUT /api/v1/orders/{orderId}/status` - Update order status
- `POST /api/v1/orders/{orderId}/pickup` - Mark as picked up
- `POST /api/v1/orders/{orderId}/deliver` - Mark as delivered
- `GET /api/v1/orders/driver/{driverId}` - Get driver's active orders
- `GET /api/v1/orders/customer/{customerId}` - Get customer's orders

### ETA
- `POST /api/v1/eta/calculate` - Calculate ETA
- `GET /api/v1/eta/driver/{driverId}` - Calculate ETA from driver location
- `GET /api/v1/eta/distance` - Calculate distance between points

### Trip History
- `POST /api/v1/trips` - Start a new trip
- `PUT /api/v1/trips/{tripId}/location` - Add location point
- `POST /api/v1/trips/{tripId}/complete` - Complete trip
- `GET /api/v1/trips/{tripId}` - Get trip details
- `GET /api/v1/trips/driver/{driverId}` - Get driver's trips

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MongoDB 7.0+
- Docker (optional, for running MongoDB and Eureka)

### Running MongoDB and Eureka with Docker

```bash
# Start MongoDB only
docker-compose up -d mongodb

# Start MongoDB and MongoDB Express (Web UI)
docker-compose up -d mongodb mongodb-express

# To build Eureka server first (you need to build it separately):
cd ../Eureka/EurekaDernier
./mvnw clean package
# Copy the JAR to Tracking-Service directory
cp target/EurekaDernier-0.0.1-SNAPSHOT.jar ../Tracking-Service/eureka-server.jar

# Then start Eureka
docker-compose up -d eureka-server
```

### Running the Application

**Option 1: With Eureka (Default)**
```bash
# Make sure Eureka server is running on port 8761
./mvnw spring-boot:run
```

**Option 2: Local Mode (Without Eureka)**
```bash
# Run with local profile to disable Eureka
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Option 3: Development Mode**
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Option 4: Production Mode**
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

### Environment Variables

You can override configuration using environment variables:

```bash
# Custom MongoDB connection
export MONGODB_HOST=your-mongodb-host
export MONGODB_PORT=27017
export MONGODB_DATABASE=quickdrop_tracking

# Custom Eureka configuration
export EUREKA_URL=http://your-eureka-server:8761/eureka/
export EUREKA_HOSTNAME=your-eureka-hostname

# Custom server port
export SERVER_PORT=8084

# Disable Eureka for testing
export EUREKA_REGISTER=false
export EUREKA_FETCH=false
```

### Verify Services are Running

**Eureka Service Registry:**
```
http://localhost:8761
```
You should see "tracking-service" registered when your service is running.

**Swagger UI:**
```
http://localhost:8084/swagger-ui.html
```

**API Documentation:**
```
http://localhost:8084/api-docs
```

**MongoDB Express (Web UI):**
```
http://localhost:8081
Username: admin
Password: admin123
```

## Database Schema

### Collections

#### driver_locations
```json
{
  "_id": "ObjectId",
  "driverId": "string",
  "coordinates": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "speed": "number (km/h)",
  "heading": "number (degrees)",
  "accuracy": "number (meters)",
  "timestamp": "DateTime",
  "status": "string (AVAILABLE|DELIVERING|OFFLINE)",
  "currentOrderId": "string"
}
```

#### order_tracking
```json
{
  "_id": "ObjectId",
  "orderId": "string",
  "driverId": "string",
  "customerId": "string",
  "restaurantLocation": { "type": "Point", "coordinates": [...] },
  "customerLocation": { "type": "Point", "coordinates": [...] },
  "currentDriverLocation": { "type": "Point", "coordinates": [...] },
  "status": "string",
  "estimatedArrivalMinutes": "number",
  "pickupTime": "DateTime",
  "actualDeliveryTime": "DateTime",
  "events": [
    {
      "eventType": "string",
      "description": "string",
      "timestamp": "DateTime",
      "location": { "type": "Point", "coordinates": [...] },
      "etaMinutes": "number"
    }
  ],
  "lastUpdated": "DateTime"
}
```

#### trip_history
```json
{
  "_id": "ObjectId",
  "driverId": "string",
  "orderId": "string",
  "locationPoints": [
    {
      "location": { "type": "Point", "coordinates": [...] },
      "timestamp": "DateTime",
      "speed": "number",
      "heading": "number"
    }
  ],
  "startLocation": { "type": "Point", "coordinates": [...] },
  "destinationLocation": { "type": "Point", "coordinates": [...] },
  "startTime": "DateTime",
  "endTime": "DateTime",
  "totalDistanceKm": "number",
  "totalDurationMinutes": "number",
  "status": "string (IN_PROGRESS|COMPLETED|CANCELLED)",
  "averageSpeed": "number (km/h)"
}
```

## WebSocket Configuration

### Connection
- Endpoint: `ws://localhost:8084/ws-tracking`
- Protocol: STOMP over WebSocket (SockJS fallback available)

### Subscriptions
- `/topic/locations` - All driver location updates
- `/topic/driver/{driverId}` - Specific driver location updates
- `/topic/order/{orderId}` - Order status updates
- `/topic/eta/{orderId}` - ETA updates for orders

### Publishing
- `/app/location.update` - Update driver location

## Configuration

### application.yml
Key configuration options:
- `server.port`: 8084
- `spring.data.mongodb.uri`: MongoDB connection string
- `eureka.client.service-url.defaultZone`: Eureka server URL
- `springdoc.swagger-ui.path`: Swagger UI path

## Testing

### Run Tests
```bash
./mvnw test
```

### Run with Coverage
```bash
./mvnw clean test jacoco:report
```

## Integration with Other Services

### User Service
- Validate driver IDs
- Get driver information

### Order Service
- Validate order IDs
- Get order details
- Fetch restaurant and delivery locations

## Future Enhancements
- [ ] Implement geofencing alerts
- [ ] Add route optimization
- [ ] Implement traffic-aware ETA calculations
- [ ] Add historical traffic data analysis
- [ ] Implement batch location updates
- [ ] Add MongoDB change streams for real-time updates
- [ ] Implement location data archival strategy
- [ ] Add analytics and reporting features

## Author
Channoufi Med Yassin

## License
Proprietary - QuickDrop Project
