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
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import MultiSlider from '@ptomasroos/react-native-multi-slider';

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
    let unsubscribeEmployees: () => void = () => { };
    let unsubscribeLocation: () => void = () => { };

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

      {/* Chips de filtros activos */}
      <View style={styles.activeFiltersContainer}>
        {selectedServices[0] && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>{selectedServices[0]}</Text>
            <TouchableOpacity onPress={() => setSelectedServices([])}>
              <MaterialIcons name="close" size={16} color="#6D28D9" />
            </TouchableOpacity>
          </View>
        )}
        {selectedDistance < 100 && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>{selectedDistance} km</Text>
            <TouchableOpacity onPress={() => setSelectedDistance(100)}>
              <MaterialIcons name="close" size={16} color="#6D28D9" />
            </TouchableOpacity>
          </View>
        )}
        {(selectedPriceRange[0] > 0 || selectedPriceRange[1] < 1000) && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>
              ${selectedPriceRange[0]}-${selectedPriceRange[1]}
            </Text>
            <TouchableOpacity onPress={() => setSelectedPriceRange([0, 1000])}>
              <MaterialIcons name="close" size={16} color="#6D28D9" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filtros mejorados */}
      <View style={styles.filtersContainer}>
        {/* Filtro de Servicio */}
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <MaterialIcons name="category" size={16} color="#6D28D9" />
            <Text style={styles.filterLabel}>Servicio</Text>
          </View>
          <View style={styles.selectContainer}>
            <Picker
              selectedValue={selectedServices[0] || ""}
              onValueChange={(itemValue) =>
                setSelectedServices(itemValue ? [itemValue] : [])
              }
              dropdownIconColor="#6D28D9"
            >
              <Picker.Item label="Selecciona un servicio" value="" />
              {services.map((service) => (
                <Picker.Item
                  key={service.id}
                  label={service.name}
                  value={service.name}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Filtro de Distancia */}
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <MaterialIcons name="location-on" size={16} color="#6D28D9" />
            <Text style={styles.filterLabel}>Distancia máxima</Text>
            <Text style={styles.filterValue}>{selectedDistance} km</Text>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={100}
            step={10}
            value={selectedDistance}
            onValueChange={setSelectedDistance}
            minimumTrackTintColor="#6D28D9"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#6D28D9"
          />
        </View>

        {/* Filtro de Precio */}
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <MaterialIcons name="attach-money" size={16} color="#6D28D9" />
            <Text style={styles.filterLabel}>Rango de precios</Text>
            <Text style={styles.filterValue}>
              ${selectedPriceRange[0]} - ${selectedPriceRange[1]}
            </Text>
          </View>
          <MultiSlider
            values={[selectedPriceRange[0], selectedPriceRange[1]]}
            sliderLength={300}
            onValuesChange={(values) => setSelectedPriceRange(values as [number, number])}
            min={0}
            max={1000}
            step={10}
            allowOverlap={false}
            markerStyle={{
              height: 24,
              width: 24,
              backgroundColor: '#6D28D9'
            }}
            selectedStyle={{
              backgroundColor: '#6D28D9',
            }}
            trackStyle={{
              backgroundColor: '#E5E7EB',
              height: 4,
            }}
          />
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron profesionales.</Text>
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 50,
    color: "#333",
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 8,
  },
  filterValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D28D9',
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  filterChipText: {
    color: '#6D28D9',
    fontSize: 12,
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