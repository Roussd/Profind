import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where, writeBatch, doc, orderBy, onSnapshot, deleteDoc } from "firebase/firestore";
import { auth, firestore } from "../../config/firebase";
import Geocoder from "react-native-geocoding"; // Asegúrate de tener configurado Geocoder correctamente
import BackButton from "../../components/backButton";
import { MaterialIcons } from "@expo/vector-icons";

export default function SavedLocations() {
  const router = useRouter();
  const [locations, setLocations] = useState<
    { id: string; label: string; address?: string }[]
  >([]);
  const [filteredLocations, setFilteredLocations] = useState<
    { id: string; label: string; address?: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    id: string;
    label: string;
    address?: string;
  } | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const locationsRef = collection(firestore, "locations");
    const q = query(
      locationsRef,
      where("userId", "==", user.uid),
      orderBy("selected", "desc")
    );

    // Listener en tiempo real
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const locationsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          let address = data.address;

          // Solo busca dirección si no existe y hay coordenadas
          if (!address && data.latitude && data.longitude) {
            address = await getAddressFromCoordinates(data.latitude, data.longitude);
          }

          return {
            id: doc.id,
            label: data.label || "Sin etiqueta",
            address: address || "Dirección no disponible",
            selected: data.selected || false,
          };
        })
      );

      setLocations(locationsData);
      setFilteredLocations(locationsData);
      const activeLocation = locationsData.find((loc) => loc.selected);
      if (activeLocation) {
        setSelectedLocation(activeLocation);
      }
    });

    return unsubscribe;
  }, []);

  const handleDeleteLocation = async (locationId: string) => {
    Alert.alert(
      "Eliminar ubicación",
      "¿Estás seguro de que deseas eliminar esta ubicación?",
      [
        {
          text: "Cancelar",
          style: "cancel", 
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, "locations", locationId));
              console.log("Ubicación eliminada", "La ubicación ha sido eliminada correctamente.");
            } catch (error) {
              console.error("Error al eliminar la ubicación:", error);
              Alert.alert("Error", "No se pudo eliminar la ubicación.");
            }
          },
          style: "destructive", 
        },
      ],
      { cancelable: true } 
    );
  };

  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      const response = await Geocoder.from(latitude, longitude);
      const addressComponents = response.results[0].address_components;
      let address = "";

      for (let i = 0; i < addressComponents.length; i++) {
        if (addressComponents[i].types.includes("street_number")) {
          address += addressComponents[i].long_name + " ";
        }
        if (addressComponents[i].types.includes("route")) {
          address += addressComponents[i].long_name + ", ";
        }
        if (addressComponents[i].types.includes("locality")) {
          address += addressComponents[i].long_name + ", ";
        }
        if (
          addressComponents[i].types.includes("administrative_area_level_1")
        ) {
          address += addressComponents[i].short_name + ", ";
        }
        if (addressComponents[i].types.includes("country")) {
          address += addressComponents[i].long_name + ", ";
        }
        if (addressComponents[i].types.includes("postal_code")) {
          address += addressComponents[i].long_name;
        }
      }

      return address.trim();
    } catch (error) {
      console.error("Error fetching address from coordinates:", error);
      return "Dirección no disponible";
    }
  };


  interface Location {
    id: string;
    label: string;
    address?: string;
    selected?: boolean;
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter((location: Location) =>
        location.label.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  };

  const handleSelectLocation = async () => {
    if (!selectedLocation) {
      alert("Por favor, selecciona una ubicación.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Usuario no autenticado.");
        return;
      }

      // 1. Obtener todas las ubicaciones del usuario
      const locationsRef = collection(firestore, "locations");
      const q = query(locationsRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);

      // 2. Crear un batch para actualizaciones atómicas
      const batch = writeBatch(firestore);

      // 3. Desmarcar todas las ubicaciones
      snapshot.forEach((locationDoc) => {
        const docRef = doc(firestore, "locations", locationDoc.id);
        batch.update(docRef, { selected: false });
      });

      // 4. Marcar la ubicación seleccionada
      const selectedDocRef = doc(firestore, "locations", selectedLocation.id);
      batch.update(selectedDocRef, { selected: true });

      // 5. Ejecutar el batch
      await batch.commit();

      // 6. Actualizar el estado local y UI
      setSelectedLocation(null);

      router.push("professional/searchEmployee");
    } catch (error) {
      console.error("Error al seleccionar ubicación:", error);
      alert("Error al guardar la selección.");
    }
  };

  const renderItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        item.selected && styles.selectedItem, 
        selectedLocation?.id === item.id && { 
          borderColor: "#10B981",
          backgroundColor: "#D1FAE5"
        }
      ]}
      onPress={() => setSelectedLocation(item)}
    >
      <Text style={styles.locationLabel}>{item.label}</Text>
      {item.selected && (
        <Text style={styles.activeBadge}>ACTIVA</Text>
      )}
      <Text style={styles.locationAddress}>{item.address}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteLocation(item.id)}
      >
        <MaterialIcons name="delete" size={24} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BackButton />

      <Text style={styles.headerText}>Mis Ubicaciones Guardadas</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar ubicación..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay ubicaciones guardadas.</Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("location/createLocation")}
      >
        <Text style={styles.addButtonText}>Registrar Nueva Ubicación</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={handleSelectLocation}
      >
        <Text style={styles.selectButtonText}>Seleccionar Ubicación</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  deleteButton: {
    marginLeft: 10,
    left: 280,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 50,
  },
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  locationItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f7f7f7",
  },
  selectedItem: {
    borderColor: "#4F46E5",
    backgroundColor: "#E5E7EB",
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  locationAddress: {
    fontSize: 14,
    color: "#555",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 20,
  },
  addButton: {
    padding: 15,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectButton: {
    padding: 15,
    backgroundColor: "#10B981",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  selectButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#10B981',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  }
});
