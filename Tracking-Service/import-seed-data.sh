#!/bin/bash

# Script d'importation des données de test pour QuickDrop Tracking Service
# Utilise mongosh pour injecter directement les données JSON dans MongoDB

echo "========================================"
echo "QuickDrop - Import des données de test"
echo "========================================"
echo ""

# Vérifier que mongosh est installé
if ! command -v mongosh &> /dev/null; then
    echo "❌ Erreur: mongosh n'est pas installé"
    echo "Installez-le avec: brew install mongodb-community"
    exit 1
fi

# Vérifier que MongoDB est en cours d'exécution
echo "🔍 Vérification de la connexion à MongoDB..."
if ! mongosh --eval "db.runCommand({ping:1})" > /dev/null 2>&1; then
    echo "❌ Erreur: MongoDB n'est pas accessible sur localhost:27017"
    echo "Démarrez-le avec: docker-compose up -d (dans le dossier Tracking-Service)"
    exit 1
fi

echo "✅ MongoDB est accessible"
echo ""

# Chemin vers les fichiers JSON
DATA_DIR="$(dirname "$0")/data"

echo "📂 Fichiers de données trouvés:"
ls -lh "$DATA_DIR"/*.json 2>/dev/null || echo "Aucun fichier JSON trouvé"
echo ""

# Supprimer les anciennes collections et importer les nouvelles
echo "🗑️  Nettoyage des anciennes collections..."
mongosh quickdrop_tracking --eval "
db.driver_locations.drop();
db.order_tracking.drop();
db.trip_history.drop();
" > /dev/null 2>&1

echo "✅ Collections nettoyées"
echo ""

# Importer driver_locations
echo "🚚 Import des positions des livreurs..."
mongosh quickdrop_tracking --quiet --file "$DATA_DIR/driver_locations_seed.json" > /dev/null 2>&1
DRIVER_COUNT=$(mongosh quickdrop_tracking --quiet --eval "db.driver_locations.countDocuments()")
echo "✅ $DRIVER_COUNT livreurs importés"
echo ""

# Importer order_tracking
echo "📦 Import du suivi des commandes..."
mongosh quickdrop_tracking --quiet --file "$DATA_DIR/order_tracking_seed.json" > /dev/null 2>&1
ORDER_COUNT=$(mongosh quickdrop_tracking --quiet --eval "db.order_tracking.countDocuments()")
echo "✅ $ORDER_COUNT commandes importées"
echo ""

# Importer trip_history
echo "🛣️  Import de l'historique des trajets..."
mongosh quickdrop_tracking --quiet --file "$DATA_DIR/trip_history_seed.json" > /dev/null 2>&1
TRIP_COUNT=$(mongosh quickdrop_tracking --quiet --eval "db.trip_history.countDocuments()")
echo "✅ $TRIP_COUNT trajets importés"
echo ""

# Créer les index nécessaires
echo "🔧 Création des index géospatiaux..."
mongosh quickdrop_tracking --quiet --eval "
db.driver_locations.createIndex({ coordinates: '2dsphere' });
db.order_tracking.createIndex({ orderId: 1 });
db.order_tracking.createIndex({ driverId: 1 });
db.order_tracking.createIndex({ customerId: 1 });
db.trip_history.createIndex({ driverId: 1 });
db.trip_history.createIndex({ orderId: 1 });
" > /dev/null 2>&1

echo "✅ Index créés"
echo ""

# Résumé
echo "========================================"
echo "✅ Import terminé avec succès!"
echo "========================================"
echo ""
echo "📊 Résumé des données:"
echo "   • Livreurs: $DRIVER_COUNT"
echo "   • Commandes: $ORDER_COUNT"
echo "   • Trajets: $TRIP_COUNT"
echo ""
echo "📍 Positions des livreurs:"
mongosh quickdrop_tracking --quiet --eval "
print('   DRV001 - Tunis Centre - AVAILABLE');
print('   DRV002 - La Marsa - AVAILABLE');
print('   DRV003 - Le Manar - DELIVERING (ORD-TN-001)');
print('   DRV004 - Ariana - AVAILABLE');
print('   DRV005 - Ennasr - DELIVERING (ORD-TN-002)');
print('   DRV006 - Sidi Bou Said - OFFLINE');
print('   DRV007 - Ben Arous - AVAILABLE');
print('   DRV008 - Centreville - DELIVERING (ORD-TN-003)');
print('');
print('📦 Commandes actives:');
print('   ORD-TN-001 - Tunis → Ariana (Driver: DRV003)');
print('   ORD-TN-002 - Ariana → La Marsa (Driver: DRV005)');
print('   ORD-TN-003 - Ben Arous → Sidi Bou Said (Driver: DRV008)');
print('   ORD-TN-004 - Tunis → La Marsa (En attente)');
"

echo ""
echo "🌐 Tester l'API:"
echo "   curl http://localhost:8086/api/v1/drivers/status/AVAILABLE"
echo "   curl http://localhost:8086/api/v1/orders/customer/CUST-001"
echo ""
echo "✅ Prêt à démarrer le Tracking Service!"
echo ""
