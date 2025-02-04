import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { collection, query, where, getDocs, updateDoc, orderBy, doc } from "firebase/firestore";
import { auth, firestore } from "../../config/firebase";
import BackButton from "../../components/backButton";
import { FontAwesome } from "@expo/vector-icons";

interface Request {
  id: string;
  clienteId: string;
  clienteNombre: string;
  servicio: string;
  fecha: string;
  estado: "pendiente" | "aceptada" | "rechazada" | "completada";
}

const ProfessionalDashboard = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(firestore, "solicitudes"),
          where("profesionalId", "==", user.uid),
          orderBy("fecha", "desc")
        );

        const snapshot = await getDocs(q);
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Request[];

        setRequests(requestsData);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId: string, newStatus: "aceptada" | "rechazada") => {
    try {
      const requestRef = doc(firestore, "solicitudes", requestId);
      await updateDoc(requestRef, { estado: newStatus });
      
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

  const renderItem = ({ item }: { item: Request }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.serviceText}>{item.servicio}</Text>
        <Text style={styles.dateText}>
          {new Date(item.fecha).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.clientText}>Cliente: {item.clienteNombre}</Text>
      
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
    </View>
  );

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
    marginBottom: 12,
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
});

export default ProfessionalDashboard;