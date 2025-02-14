import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity 
} from "react-native";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  orderBy, 
  doc 
} from "firebase/firestore";
import { auth, firestore } from "../../config/firebase";
import BackButton from "../../components/backButton";
import ClientRequest from "../../components/request/clientRequest";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

interface Request {
  id: string;
  clienteId: string;
  clienteNombre: string;
  servicio: string;
  fecha: string;
  estado: "pendiente" | "aceptada" | "rechazada" | "completada";
  clienteLocation?: {
    latitude: number;
    longitude: number;
  };
}

const ProfessionalDashboard = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [professionalLocation, setProfessionalLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Obtener ubicación del profesional
        const locationsRef = collection(firestore, "locations");
        const q = query(
          locationsRef,
          where("userId", "==", user.uid),
          where("selected", "==", true)
        );
        
        const locationSnapshot = await getDocs(q);
        if (!locationSnapshot.empty) {
          const locationData = locationSnapshot.docs[0].data();
          setProfessionalLocation({
            latitude: locationData.latitude,
            longitude: locationData.longitude
          });
        }

        // Obtener solicitudes
        const requestsQuery = query(
          collection(firestore, "solicitudes"),
          where("profesionalId", "==", user.uid),
          orderBy("fecha", "desc")
        );

        const snapshot = await getDocs(requestsQuery);
        
        const requestsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();

             // Manejo seguro de fechas
          const fecha = data.fecha?.toDate?.() || new Date(data.fecha);
            
            // Obtener ubicación del cliente
            const clientLocationQuery = query(
              collection(firestore, "locations"),
              where("userId", "==", data.clienteId),
              where("selected", "==", true)
            );
            
            const clientLocationSnapshot = await getDocs(clientLocationQuery);
            let clienteLocation = undefined;
            
            if (!clientLocationSnapshot.empty) {
              const locationData = clientLocationSnapshot.docs[0].data();
              clienteLocation = {
                latitude: locationData.latitude,
                longitude: locationData.longitude
              };
            }

            return {
              id: doc.id,
              clienteId: data.clienteId,
              clienteNombre: data.clienteNombre,
              servicio: data.servicio,
              fecha: fecha.toISOString(),
              estado: data.estado,
              clienteLocation
            };
          })
        );

        setRequests(requestsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleUpdateStatus = async (requestId: string, newStatus: "aceptada" | "rechazada") => {
    try {
      const requestRef = doc(firestore, "solicitudes", requestId);
      await updateDoc(requestRef, { estado: newStatus });
      
      if (newStatus === "aceptada") {
        const selected = requests.find(req => req.id === requestId);
        setSelectedRequest(selected || null);
      }
  
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, estado: newStatus } : req
        )
      );
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Error al actualizar el estado");
    }
  };
    
  const renderItem = ({ item }: { item: Request }) => {
    let distance = "Distancia no disponible";
    
    if (professionalLocation && item.clienteLocation) {
      const distanceValue = calculateDistance(
        professionalLocation.latitude,
        professionalLocation.longitude,
        item.clienteLocation.latitude,
        item.clienteLocation.longitude
      );
      distance = `${distanceValue.toFixed(1)} km`;
    }

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.serviceText}>{item.servicio}</Text>
          <Text style={styles.dateText}>
            {new Date(item.fecha).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </Text>
        </View>
        
        <Text style={styles.clientText}>Cliente: {item.clienteNombre}</Text>
        
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={14} color="#6D28D9" />
          <Text style={styles.distanceText}>{distance}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            item.estado === "pendiente" && styles.pendingStatus,
            item.estado === "aceptada" && styles.acceptedStatus,
            item.estado === "rechazada" && styles.rejectedStatus
          ]}>
            {item.estado.toUpperCase()}
          </Text>
        </View>

        {item.estado === "pendiente" && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleUpdateStatus(item.id, "aceptada")}
            >
              <Text style={styles.actionText}>Aceptar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleUpdateStatus(item.id, "rechazada")}
            >
              <Text style={styles.actionText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.estado === "aceptada" && (
          <TouchableOpacity 
          style={[styles.actionButton, styles.trackButton]}
          onPress={() => setSelectedRequest(item)}
        >
          <Text style={styles.actionText}>seguimiento</Text>
        </TouchableOpacity>
        )}
      </View>

      
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>Solicitudes de Servicio</Text>
      
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
        }
        contentContainerStyle={styles.listContent}
      />
      {selectedRequest && selectedRequest.clienteLocation && (
        <ClientRequest
          visible={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          professionalLocation={professionalLocation!}
          clientLocation={selectedRequest.clienteLocation}
          requestId={selectedRequest.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6D28D9",
    marginVertical: 20,
    textAlign: "center",
  },
  requestCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  dateText: {
    fontSize: 14,
    color: "#64748B",
  },
  clientText: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 14,
    color: "#64748B",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  pendingStatus: {
    backgroundColor: "#FEF3C7",
    color: "#D97706",
  },
  acceptedStatus: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
  },
  rejectedStatus: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#6D28D9",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  actionText: {
    color: "white",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 20,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  trackButton: {
    backgroundColor: "#3B82F6",
    marginTop: 12,
    fontWeight: "500"
  },
});

export default ProfessionalDashboard;