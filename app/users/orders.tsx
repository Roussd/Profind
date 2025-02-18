import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, firestore } from "../../config/firebase";
import BackButton from "../../components/backButton";
import ClientRequest from "../../components/request/clientRequest";
import { Ionicons } from "@expo/vector-icons";

interface Request {
  id: string;
  profesionalId: string;
  profesionalNombre: string;
  servicio: string;
  fecha: string;
  estado: "pendiente" | "aceptada" | "rechazada" | "completada";
  profesionalLocation?: {
    latitude: number;
    longitude: number;
  };
}

const ClientOrders = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Obtener solicitudes enviadas por el cliente
        const requestsQuery = query(
          collection(firestore, "solicitudes"),
          where("clienteId", "==", user.uid),
          orderBy("fecha", "desc")
        );

        const snapshot = await getDocs(requestsQuery);

        const requestsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();

            // Manejo seguro de fechas
            const fecha = data.fecha?.toDate?.() || new Date(data.fecha);

            // Obtener ubicación del profesional
            const professionalLocationQuery = query(
              collection(firestore, "locations"),
              where("userId", "==", data.profesionalId),
              where("selected", "==", true)
            );

            const professionalLocationSnapshot = await getDocs(
              professionalLocationQuery
            );
            let profesionalLocation = undefined;

            if (!professionalLocationSnapshot.empty) {
              const locationData = professionalLocationSnapshot.docs[0].data();
              profesionalLocation = {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
              };
            }

            return {
              id: doc.id,
              profesionalId: data.profesionalId,
              profesionalNombre: data.profesionalNombre,
              servicio: data.servicio,
              fecha: fecha.toISOString(),
              estado: data.estado,
              profesionalLocation,
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

  const renderItem = ({ item }: { item: Request }) => {
    let distance = "Distancia no disponible";

    if (item.profesionalLocation) {
      const userLocation = { latitude: -33.45694, longitude: -70.64827 };
      const distanceValue = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        item.profesionalLocation.latitude,
        item.profesionalLocation.longitude
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
              year: "numeric",
            })}
          </Text>
        </View>

        <Text style={styles.clientText}>
          Profesional: {item.profesionalNombre}
        </Text>

        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={14} color="#6D28D9" />
          <Text style={styles.distanceText}>{distance}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.statusText,
              item.estado === "pendiente" && styles.pendingStatus,
              item.estado === "aceptada" && styles.acceptedStatus,
              item.estado === "rechazada" && styles.rejectedStatus,
            ]}
          >
            {item.estado.toUpperCase()}
          </Text>
        </View>

        {item.estado === "aceptada" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.trackButton]}
            onPress={() => setSelectedRequest(item)}
          >
            <Text style={styles.actionText}>Seguimiento</Text>
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
      <Text style={styles.header}>Mis Solicitudes</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No has enviado solicitudes</Text>
        }
        contentContainerStyle={styles.listContent}
      />
      {selectedRequest && selectedRequest.profesionalLocation && (
        <ClientRequest
          visible={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          professionalLocation={selectedRequest.profesionalLocation}
          clientLocation={{ latitude: -33.45694, longitude: -70.64827 }}
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
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  trackButton: {
    backgroundColor: "#3B82F6",
    marginTop: 12,
    fontWeight: "500",
  },
  actionText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
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
});

export default ClientOrders;
