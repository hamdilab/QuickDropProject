#!/bin/bash

echo "========================================"
echo "QuickDrop - Nettoyage complet MongoDB"
echo "========================================"
echo ""

# Nettoyer toutes les collections
echo "🗑️  Nettoyage des collections..."
mongosh quickdrop_tracking --eval '
db.driver_locations.drop();
db.order_tracking.drop();
db.trip_history.drop();
print("✅ Collections nettoyées");
'

# Insérer les livreurs
echo ""
echo "🚚 Insertion des 8 livreurs de Tunisie..."
mongosh quickdrop_tracking --eval '
var drivers = [
  {driverId: "DRV001", coordinates: {type: "Point", coordinates: [10.1815, 36.8065]}, speed: 25.5, heading: 45, accuracy: 8.0, timestamp: new Date(), status: "AVAILABLE", currentOrderId: null},
  {driverId: "DRV002", coordinates: {type: "Point", coordinates: [10.3250, 36.8775]}, speed: 0.0, heading: 120, accuracy: 5.0, timestamp: new Date(), status: "AVAILABLE", currentOrderId: null},
  {driverId: "DRV003", coordinates: {type: "Point", coordinates: [10.1950, 36.8400]}, speed: 32.0, heading: 270, accuracy: 10.0, timestamp: new Date(), status: "DELIVERING", currentOrderId: "ORD-TN-001"},
  {driverId: "DRV004", coordinates: {type: "Point", coordinates: [10.2367, 36.8422]}, speed: 18.5, heading: 90, accuracy: 7.0, timestamp: new Date(), status: "AVAILABLE", currentOrderId: null},
  {driverId: "DRV005", coordinates: {type: "Point", coordinates: [10.2800, 36.8100]}, speed: 28.0, heading: 180, accuracy: 6.0, timestamp: new Date(), status: "DELIVERING", currentOrderId: "ORD-TN-002"},
  {driverId: "DRV006", coordinates: {type: "Point", coordinates: [10.3500, 36.8500]}, speed: 0.0, heading: 0, accuracy: 12.0, timestamp: new Date(), status: "OFFLINE", currentOrderId: null},
  {driverId: "DRV007", coordinates: {type: "Point", coordinates: [10.1700, 36.7950]}, speed: 22.0, heading: 315, accuracy: 9.0, timestamp: new Date(), status: "AVAILABLE", currentOrderId: null},
  {driverId: "DRV008", coordinates: {type: "Point", coordinates: [10.2100, 36.8200]}, speed: 35.0, heading: 60, accuracy: 5.5, timestamp: new Date(), status: "DELIVERING", currentOrderId: "ORD-TN-003"}
];

var result = db.driver_locations.insertMany(drivers);
print("✅ " + Object.keys(result.insertedIds).length + " livreurs insérés");
'

# Créer les index
echo ""
echo "🔧 Création des index géospatiaux..."
mongosh quickdrop_tracking --eval '
db.driver_locations.createIndex({coordinates: "2dsphere"});
db.driver_locations.createIndex({driverId: 1});
db.driver_locations.createIndex({status: 1});
print("✅ Index créés");
'

# Vérification
echo ""
echo "========================================"
echo "✅ Vérification finale"
echo "========================================"
mongosh quickdrop_tracking --eval '
print("\n📊 Statistiques:");
print("   Total livreurs: " + db.driver_locations.countDocuments());
print("   AVAILABLE: " + db.driver_locations.find({status: "AVAILABLE"}).count());
print("   DELIVERING: " + db.driver_locations.find({status: "DELIVERING"}).count());
print("   OFFLINE: " + db.driver_locations.find({status: "OFFLINE"}).count());

print("\n📍 Livreurs dans MongoDB:");
db.driver_locations.find().forEach(doc => {
  print("   " + doc.driverId + " - [" + doc.coordinates.coordinates[0] + ", " + doc.coordinates.coordinates[1] + "] - " + doc.status);
});
'

echo ""
echo "========================================"
echo "✅ Prêt! Redémarrez le Tracking Service"
echo "========================================"
echo ""
echo "Commandes:"
echo "  1. Arrêter le service actuel (Ctrl+C)"
echo "  2. mvn spring-boot:run"
echo "  3. Ouvrir http://localhost:4200"
echo ""
