import React, { useState, useEffect } from "react";
import {
  View,
  Text,
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
  onSnapshot,
} from "firebase/firestore";
import { firestore, auth } from "../../config/firebase";
import BackButton from "../../components/backButton";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";

interface Location {
  latitude: number;
  longitude: number;
}

interface User {
  id: string;
  nombre: string;
  apellido: string;
  service: string;
  selectedLocation?: Location;
  solicitudEnviada?: boolean;
  price?: number; // Nuevo campo para el precio
}

interface Service {
  id: string;
  name: string;
}

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number>(50); // Distancia en km
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 1000]); // Rango de precios
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const servicesRef = collection(firestore, "services");
      const snapshot = await getDocs(servicesRef);
      const servicesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setServices(servicesList);
    };

    fetchServices();
  }, []);

  useEffect(() => {
    let unsubscribeEmployees: () => void = () => {};
    let unsubscribeLocation: () => void = () => {};

    const fetchData = async () => {
      await Promise.all([fetchUserLocation(), fetchEmployees()]);
      setLoading(false);
    };

    fetchData();

    return () => {
      unsubscribeEmployees?.();
    };
  }, []);

  const fetchEmployees = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("profileType", "in", ["1", "3"]));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const employees = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const userData = doc.data();

            const solicitudesRef = collection(firestore, "solicitudes");
            const solicitudQuery = query(
              solicitudesRef,
              where("clienteId", "==", user?.uid),
              where("profesionalId", "==", doc.id)
            );

            const solicitudSnapshot = await getDocs(solicitudQuery);
            const tieneSolicitud = !solicitudSnapshot.empty;

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
              price: userData.price || 0, // Asignar un valor por defecto si no existe
            };
          })
        ).then((results) => results.filter(Boolean));

        setUsers(employees);
        applyFilters(employees);
      });

      return unsubscribe;
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

  const applyFilters = (usersList: User[]) => {
    let filtered = usersList;

    // Filtrar por servicios seleccionados
    if (selectedServices.length > 0) {
      filtered = filtered.filter((user) =>
        selectedServices.includes(user.service)
      );
    }

    // Filtrar por distancia
    if (userLocation) {
      filtered = filtered.filter((user) => {
        if (!user.selectedLocation) return false;
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          user.selectedLocation.latitude,
          user.selectedLocation.longitude
        );
        return distance <= selectedDistance;
      });
    }

    // Filtrar por rango de precios
    filtered = filtered.filter(
      (user) =>
        user.price >= selectedPriceRange[0] && user.price <= selectedPriceRange[1]
    );

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    applyFilters(users);
  }, [selectedServices, selectedDistance, selectedPriceRange, users]);

  const handleContratar = async (professionalId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Debes iniciar sesión para contratar servicios");
        return;
      }

      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      const userData = userDoc.data();

      const solicitudRef = collection(firestore, "solicitudes");
      const nuevaSolicitud = {
        clienteId: user.uid,
        clienteNombre: `${userData?.nombre} ${userData?.apellido}`.trim() || "Cliente Anónimo",
        profesionalId: professionalId,
        servicio: users.find((u) => u.id === professionalId)?.service || "",
        fecha: new Date(),
        estado: "pendiente",
      };

      await addDoc(solicitudRef, nuevaSolicitud);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === professionalId
            ? { ...user, solicitudEnviada: true }
            : user
        )
      );

      setFilteredUsers((prev) =>
        prev.map((user) =>
          user.id === professionalId
            ? { ...user, solicitudEnviada: true }
            : user
        )
      );

      alert("Solicitud enviada correctamente");
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      alert("Error al enviar la solicitud");

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === professionalId
            ? { ...user, solicitudEnviada: false }
            : user
        )
      );

      setFilteredUsers((prev) =>
        prev.map((user) =>
          user.id === professionalId
            ? { ...user, solicitudEnviada: false }
            : user
        )
      );
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
        <View style={styles.iconContainer}>
          <Ionicons name="person-circle-outline" size={30} color="#6D28D9" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.nombre}</Text>
          <Text style={styles.userService}>{item.service}</Text>
        </View>
        <View style={styles.extraInfo}>
          <Text style={styles.ratingText}>4.5</Text>
          <FontAwesome name="star" size={14} color="#6D28D9" />
          <Text style={styles.distanceText}>{distance}</Text>
          <Ionicons name="location-outline" size={14} color="#6D28D9" />
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

      {/* Filtros horizontales */}
      <View style={styles.filtersContainer}>
        <Picker
          selectedValue={selectedServices[0] || ""}
          onValueChange={(itemValue) =>
            setSelectedServices(itemValue ? [itemValue] : [])
          }
          style={styles.filterPicker}
        >
          <Picker.Item label="Todos los servicios" value="" />
          {services.map((service) => (
            <Picker.Item
              key={service.id}
              label={service.name}
              value={service.name}
            />
          ))}
        </Picker>

        <View style={styles.sliderContainer}>
          <Text>Distancia: {selectedDistance} km</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={selectedDistance}
            onValueChange={setSelectedDistance}
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text>Precio: ${selectedPriceRange[0]} - ${selectedPriceRange[1]}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1000}
            step={10}
            value={selectedPriceRange[1]}
            onValueChange={(value) =>
              setSelectedPriceRange([selectedPriceRange[0], value])
            }
          />
        </View>
      </View>

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
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterPicker: {
    flex: 1,
    marginRight: 8,
  },
  sliderContainer: {
    flex: 1,
    marginLeft: 8,
  },
  slider: {
    width: "100%",
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
    flex: 1,
  },
  extraInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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