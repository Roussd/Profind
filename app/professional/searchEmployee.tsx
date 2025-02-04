import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import { firestore, auth } from "../../config/firebase";
import BackButton from "../../components/backButton";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

interface User {
  id: string;
  nombre: string;
  apellido: string;
  service: string;
  selectedLocation?: {
    latitude: number;
    longitude: number;
  };
  solicitudEnviada?: boolean;
}

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [serviceFilter, setServiceFilter] = useState("");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserLocation();
      await fetchEmployees();
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchEmployees = async () => {
    try {
      const user = auth.currentUser;
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("profileType", "in", ["1", "3"]));
      const snapshot = await getDocs(q);

      const employees = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const userData = doc.data();

          // Verificar si ya existe una solicitud
          const solicitudesRef = collection(firestore, "solicitudes");
          const solicitudQuery = query(
            solicitudesRef,
            where("clienteId", "==", user?.uid),
            where("profesionalId", "==", doc.id)
          );

          const solicitudSnapshot = await getDocs(solicitudQuery);
          const tieneSolicitud = !solicitudSnapshot.empty;

          // Obtener la ubicación seleccionada del empleado
          const locationsRef = collection(firestore, "locations");
          const locationQuery = query(
            locationsRef,
            where("selected", "==", true),
            where("userId", "==", doc.id)
          );

          const locationSnapshot = await getDocs(locationQuery);

          if (locationSnapshot.empty) {
            console.log(`Empleado ${doc.id} no tiene ubicación seleccionada`);
            return null;
          }

          const location = locationSnapshot.docs[0]?.data();

          return {
            id: doc.id,
            nombre: userData.nombre,
            apellido: userData.apellido,
            service: userData.service,
            selectedLocation: location
              ? { latitude: location.latitude, longitude: location.longitude }
              : undefined,
            solicitudEnviada: tieneSolicitud,
          };
        })
      ).then((results) => results.filter(Boolean));

      setUsers(employees);
      setFilteredUsers(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoading(false);
    }
  };

  const fetchUserLocation = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const locationsRef = collection(firestore, "locations");
      const q = query(
        locationsRef,
        where("userId", "==", user.uid),
        orderBy("selected", "desc")
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const locationData = snapshot.docs[0].data();
        setUserLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  };

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

  const handleFilter = (text: string) => {
    setServiceFilter(text);
    if (!text.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.service.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleContratar = async (professionalId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Debes iniciar sesión para contratar servicios");
        return;
      }

      //Obtener datos del cliente
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      const userData = userDoc.data();
      
      // Crear documento en colección de solicitudes
      const solicitudRef = collection(firestore, "solicitudes");
      const nuevaSolicitud = {
        clienteId: user.uid,
        clienteNombre: `${userData?.nombre} ${userData?.apellido}`.trim() || "Cliente Anónimo",
        profesionalId: professionalId,
        servicio: users.find((u) => u.id === professionalId)?.service || "",
        fecha: new Date().toISOString(),
        estado: "pendiente",
      };

      await addDoc(collection(firestore, "solicitudes"), nuevaSolicitud);

      // Actualizar estado local
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === professionalId
            ? { ...user, solicitudEnviada: true }
            : user
        )
      );

      alert("Solicitud enviada correctamente");
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      alert("Error al enviar la solicitud");
    }
  };

  const renderItem = ({ item }: { item: User }) => {
    let distance = "N/A";
    if (userLocation && item.selectedLocation) {
      const distanceValue = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        item.selectedLocation.latitude,
        item.selectedLocation.longitude
      );
      distance = `${distanceValue.toFixed(1)} km`;
    }
  
    return (
      <View style={styles.userCard}>
        {/* Icono de usuario */}
        <View style={styles.iconContainer}>
          <Ionicons name="person-circle-outline" size={30} color="#6D28D9" />
        </View>
  
        {/* Información del usuario */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.nombre}</Text>
          <Text style={styles.userService}>{item.service}</Text>
        </View>
  
        {/* Rating y distancia */}
        <View style={styles.extraInfo}>
          <Text style={styles.ratingText}>4.5</Text>
          <FontAwesome name="star" size={14} color="#6D28D9" />
          <Text style={styles.distanceText}>{distance}</Text>
          <Ionicons name="location-outline" size={14} color="#6D28D9" />
          {/* Botón de contratar */}
        <TouchableOpacity
          style={[
            styles.contractButton,
            item.solicitudEnviada && styles.contractButtonDisabled,
          ]}
          onPress={() => handleContratar(item.id)}
          disabled={item.solicitudEnviada}
        >
          <Text style={styles.contractButtonText}>
            {item.solicitudEnviada ? "Solicitado" : "Contratar"}
          </Text>
        </TouchableOpacity>
        </View>
      </View>
    );
  };
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>Profesionales</Text>
      <TextInput
        style={styles.filterInput}
        placeholder="Filtrar por tipo de servicio..."
        value={serviceFilter}
        onChangeText={handleFilter}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron usuarios.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 50,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // Alinea a la derecha
    alignItems: "center", // Asegura que el botón esté centrado verticalmente
    marginTop: 10,
    paddingRight: 10, // Añade un poco de separación del borde derecho
  },
  filterInput: {
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  infoRow: {
    flexDirection: "row", // Alinea elementos en fila
    justifyContent: "space-between", // Distribuye espacio entre textos y botón
    alignItems: "center", // Asegura alineación vertical
    marginTop: 8, // Separación del nombre
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6D28D9",
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1, // Toma el espacio disponible
  },
  extraInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // Espaciado entre elementos
  },
  ratingText: {
    fontSize: 14,
    color: "#6D28D9",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userService: {
    fontSize: 14,
    color: "#6D28D9",
  },
  userDistance: {
    fontSize: 14,
    color: "#666",
  },
  distanceText: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contractButton: {
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    alignItems: "center",
  },
  contractButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  contractButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default UsersScreen;
