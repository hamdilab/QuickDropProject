# Guide d'importation des données de test pour le Tracking Service

## 📍 Données géographiques - Tunisie

Les données suivantes utilisent des coordonnées réelles de villes tunisiennes :

| Ville | Longitude | Latitude |
|-------|-----------|----------|
| Tunis Centre | 10.1815 | 36.8065 |
| La Marsa | 10.3250 | 36.8775 |
| Le Manar | 10.1950 | 36.8400 |
| Ariana | 10.2367 | 36.8422 |
| Ennasr | 10.2800 | 36.8100 |
| Sidi Bou Said | 10.3500 | 36.8500 |
| Ben Arous | 10.1700 | 36.7950 |

---

## 📥 Méthode 1: Import via MongoDB Compass (RECOMMANDÉ)

### Étape 1: Ouvrir MongoDB Compass
- Déjà connecté à `localhost:27017`
- Sélectionner la base `quickdrop_tracking`

### Étape 2: Importer driver_locations
1. Click sur la collection `driver_locations`
2. Click sur **"Add Data"** ou **"Import Data"**
3. Sélectionner le fichier: `Tracking-Service/data/driver_locations_seed.json`
4. Valider l'import

### Étape 3: Importer order_tracking
1. Click sur la collection `order_tracking`
2. Click sur **"Add Data"**
3. Sélectionner: `Tracking-Service/data/order_tracking_seed.json`
4. Valider

### Étape 4: Importer trip_history
1. Click sur la collection `trip_history`
2. Click sur **"Add Data"**
3. Sélectionner: `Tracking-Service/data/trip_history_seed.json`
4. Valider

---

## 🖥️ Méthode 2: Import via mongosh (Terminal)

```bash
# Se diriger vers le dossier data
cd Tracking-Service/data

# Importer driver_locations
mongosh quickdrop_tracking --eval "
db.driver_locations.drop();
db.driver_locations.insertMany([
  { driverId: 'DRV001', coordinates: { type: 'Point', coordinates: [10.1815, 36.8065] }, speed: 25.5, heading: 45, accuracy: 8.0, timestamp: new Date(), status: 'AVAILABLE', currentOrderId: null },
  { driverId: 'DRV002', coordinates: { type: 'Point', coordinates: [10.3250, 36.8775] }, speed: 0.0, heading: 120, accuracy: 5.0, timestamp: new Date(), status: 'AVAILABLE', currentOrderId: null },
  { driverId: 'DRV003', coordinates: { type: 'Point', coordinates: [10.1950, 36.8400] }, speed: 32.0, heading: 270, accuracy: 10.0, timestamp: new Date(), status: 'DELIVERING', currentOrderId: 'ORD-TN-001' },
  { driverId: 'DRV004', coordinates: { type: 'Point', coordinates: [10.2367, 36.8422] }, speed: 18.5, heading: 90, accuracy: 7.0, timestamp: new Date(), status: 'AVAILABLE', currentOrderId: null },
  { driverId: 'DRV005', coordinates: { type: 'Point', coordinates: [10.2800, 36.8100] }, speed: 28.0, heading: 180, accuracy: 6.0, timestamp: new Date(), status: 'DELIVERING', currentOrderId: 'ORD-TN-002' }
])
"

# Vérifier l'import
mongosh quickdrop_tracking --eval "db.driver_locations.countDocuments()"
```

---

## ✅ Vérification après import

### Dans MongoDB Compass, exécuter ces requêtes :

```javascript
// Compter les livreurs
db.driver_locations.countDocuments()
// Résultat attendu: 8

// Voir les livreurs disponibles
db.driver_locations.find({ status: 'AVAILABLE' })

// Voir les livreurs en livraison
db.driver_locations.find({ status: 'DELIVERING' })

// Tester l'index géospatial (trouver livreurs dans un rayon)
db.driver_locations.find({
  coordinates: {
    $nearSphere: {
      $geometry: {
        type: "Point",
        coordinates: [10.1815, 36.8065]
      },
      $maxDistance: 5000 // 5km
    }
  }
})
```

---

## 📊 Résumé des données injectées

### Driver Locations (8 livreurs)
- **DRV001**: Tunis Centre - AVAILABLE
- **DRV002**: La Marsa - AVAILABLE  
- **DRV003**: Le Manar - DELIVERING (commande ORD-TN-001)
- **DRV004**: Ariana - AVAILABLE
- **DRV005**: Ennasr - DELIVERING (commande ORD-TN-002)
- **DRV006**: Sidi Bou Said - OFFLINE
- **DRV007**: Ben Arous - AVAILABLE
- **DRV008**: Centreville - DELIVERING (commande ORD-TN-003)

### Order Tracking (4 commandes)
- **ORD-TN-001**: Tunis → Ariana - IN_TRANSIT (12 min ETA)
- **ORD-TN-002**: Ariana → La Marsa - IN_TRANSIT (18 min ETA)
- **ORD-TN-003**: Ben Arous → Sidi Bou Said - PICKING_UP (25 min ETA)
- **ORD-TN-004**: Tunis → La Marsa - PENDING (en attente)

### Trip History (3 trajets)
- **Trajet 1**: DRV003 - EN COURS (3.2km)
- **Trajet 2**: DRV005 - EN COURS (5.8km)
- **Trajet 3**: DRV001 - COMPLÉTÉ (4.5km, 30min)

---

## 🚀 Lancer le service et tester

```bash
# Depuis le dossier Tracking-Service
cd QuickDropProject/Tracking-Service

# Lancer avec Maven
./mvnw spring-boot:run

# Ou depuis IntelliJ, exécuter TrackingServiceApplication.java
```

### Test API après démarrage :

```bash
# Vérifier si le service est up
curl http://localhost:8086/actuator/health

# Récupérer tous les livreurs
curl http://localhost:8086/api/v1/drivers/status/AVAILABLE

# Récupérer une commande spécifique
curl http://localhost:8086/api/v1/orders/ORD-TN-001

# Trouver livreurs proches de Tunis Centre (dans un rayon de 5km)
curl -X POST http://localhost:8086/api/v1/drivers/nearby \
  -H "Content-Type: application/json" \
  -d '{
    "longitude": 10.1815,
    "latitude": 36.8065,
    "radiusMeters": 5000
  }'
```

---

## 🗺️ Visualiser sur une carte

Utilise ce lien Google Maps pour visualiser les positions :
https://www.google.com/maps/search/?api=1&query=36.8065,10.1815|36.8775,10.3250|36.8400,10.1950

---

## 🔄 Mettre à jour les données régulièrement

Si tu veux simuler des mouvements de livreurs :

```javascript
// Dans MongoDB Compass ou mongosh
db.driver_locations.updateOne(
  { driverId: "DRV001" },
  { 
    $set: { 
      coordinates: { type: "Point", coordinates: [10.1900, 36.8150] },
      speed: 28.0,
      heading: 45,
      timestamp: new Date(),
      status: "DELIVERING"
    }
  }
)
```

---

**Bon développement !** 🚀
