import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, firestore } from "../../config/firebase";
import Geocoder from "react-native-geocoding"; // Asegúrate de tener configurado Geocoder correctamente
import BackButton from '../../components/backButton';

export default function SavedLocations() {
  const router = useRouter();
  const [locations, setLocations] = useState<{ id: string; label: string; address?: string }[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<{ id: string; label: string; address?: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ id: string; label: string; address?: string } | null>(null);

  useEffect(() => {
    fetchSavedLocations();
  }, []);

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
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
        if (addressComponents[i].types.includes("administrative_area_level_1")) {
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

  const fetchSavedLocations = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const locationsRef = collection(firestore, "locations");
      const q = query(locationsRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);

      const locationsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          let address = data.address;

          if (!address && data.latitude && data.longitude) {
            address = await getAddressFromCoordinates(data.latitude, data.longitude);
          }

          return {
            id: doc.id,
            label: data.label || "Sin etiqueta",
            address: address || "Dirección no disponible",
          };
        })
      );

      setLocations(locationsData);
      setFilteredLocations(locationsData);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  interface Location {
    id: string;
    label: string;
    address?: string;
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

  const handleSelectLocation = () => {
    if (!selectedLocation) {
      alert("Por favor, selecciona una ubicación.");
      return;
    }

    alert(`Ubicación seleccionada: ${selectedLocation.label}`);
    router.push("location/searchEmployee");
  };

  const renderItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        selectedLocation?.id === item.id && styles.selectedItem,
      ]}
      onPress={() => setSelectedLocation(item)}
    >
      <Text style={styles.locationLabel}>{item.label}</Text>
      <Text style={styles.locationAddress}>{item.address || "Dirección no disponible"}</Text>
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
        ListEmptyComponent={<Text style={styles.emptyText}>No hay ubicaciones guardadas.</Text>}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("location/createLocation")}
      >
        <Text style={styles.addButtonText}>Registrar Nueva Ubicación</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.selectButton} onPress={handleSelectLocation}>
        <Text style={styles.selectButtonText}>Seleccionar Ubicación</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // (Estilos permanecen iguales)
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
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
});
