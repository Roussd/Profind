import React, { Component } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { auth, firestore } from "../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import Geocoder from "react-native-geocoding";
import { collection, addDoc } from "firebase/firestore";

import {
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  View,
  Text,
} from "react-native";

const apiUrl = process.env.EXPO_FIREBASE_API_KEY;
Geocoder.init(apiUrl);

export default class Map extends Component {
  state = {
    location: {
      latitude: 0,
      longitude: 0,
    },
    searchQuery: "",
    markerPosition: null as { latitude: number; longitude: number } | null,
    currentLocation: null as { latitude: number; longitude: number } | null,
    currentAddress: "", // Corregido: currentAddress en lugar de CurrentAddress
    saveAs: "",
  };

  private map: MapView | null = null;

  componentDidMount() {
    this.getCurrentLocation();
  }

  getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "La aplicación necesita acceder a tu ubicación para funcionar correctamente."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      this.setState({
        location: { latitude, longitude },
        markerPosition: { latitude, longitude },
        currentLocation: { latitude, longitude },
      });

      this.map?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      this.getAddressFromCoordinates(latitude, longitude);
    } catch (error) {
      console.error("Error al obtener la ubicación:", error);
      Alert.alert(
        "Error",
        "No se pudo obtener la ubicación. Intenta nuevamente más tarde."
      );
    }
  };

  getAddressFromCoordinates = async (latitude: number, longitude: number) => {
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

      this.setState({ currentAddress: address });
    } catch (error) {
      console.error("Error al obtener la dirección:", error);
    }
  };

  onSearchLocation = async () => {
    try {
      const { searchQuery } = this.state;

      if (!searchQuery.trim()) {
        Alert.alert("Error", "Por favor, introduce un lugar para buscar.");
        return;
      }

      const result = await Geocoder.from(searchQuery);

      if (result.results.length > 0) {
        const { lat, lng } = result.results[0].geometry.location;

        this.setState({
          location: { latitude: lat, longitude: lng },
          markerPosition: { latitude: lat, longitude: lng },
          searchQuery: "",
        });

        this.map?.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        this.getAddressFromCoordinates(lat, lng);
      } else {
        Alert.alert("Error", "No se encontró la ubicación especificada.");
      }
    } catch (error) {
      console.error("Error al buscar la ubicación:", error);
      Alert.alert(
        "Error",
        "No se pudo buscar la ubicación. Verifica tu conexión a internet."
      );
    }
  };

  onSaveLocation = async () => {
    const { markerPosition, saveAs } = this.state;

    if (!markerPosition) {
      Alert.alert("Error", "Por favor, selecciona una ubicación primero.");
      return;
    }

    if (!saveAs) {
      Alert.alert("Error", "Por favor, Selecciona una etiqueta para guardar.");
      return;
    }

    try {
      // Obtener el UID del usuario autenticado
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "No hay un usuario autenticado.");
        return;
      }

      // Datos a guardar
      const locationData = {
        latitude: markerPosition.latitude,
        longitude: markerPosition.longitude,
        label: saveAs,
        timestamp: new Date(),
        userId: user.uid,
        email: user.email,
      };

      // Guardar en Firestore
      await addDoc(collection(firestore, "locations"), locationData);

      Alert.alert(
        "Ubicación guardada",
        `La ubicación fue guardada exitosamente. Como (${saveAs}).`
      );
    } catch (error) {
      console.error("Error al guardar la ubicación:", error);
      Alert.alert(
        "Error",
        "No se pudo guardar la ubicación. Intenta de nuevo."
      );
    }
  };

  centerMapOnCurrentLocation = () => {
    const { currentLocation } = this.state;
    if (currentLocation) {
      this.map?.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  render() {
    const { location, markerPosition, searchQuery, saveAs, currentLocation, currentAddress } =
      this.state;
    return (
      <View style={styles.container}>
        <MapView
          ref={(ref) => (this.map = ref)}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude || 37.7749,
            longitude: location.longitude || -122.4194,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {markerPosition && (
            <Marker
              coordinate={markerPosition}
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                this.setState({ markerPosition: { latitude, longitude } });
                this.getAddressFromCoordinates(latitude, longitude);
              }}
            />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={this.centerMapOnCurrentLocation}
        >
          <MaterialIcons name="my-location" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.saveWrapper}>
          <Text style={styles.labelText}>Selecciona tu ubicación</Text>

          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder={
                currentAddress
                  ? `Ubicación actual: ${currentAddress}`
                  : "Escribe una ubicación"
              }
              value={searchQuery}
              onChangeText={(text) => this.setState({ searchQuery: text })}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={this.onSearchLocation}
            >
              <MaterialIcons name="search" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsWrapper}>
            {["Casa", "Oficina", "Otro"].map((label) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.optionButton,
                  saveAs === label && styles.optionButtonSelected,
                ]}
                onPress={() => this.setState({ saveAs: label })}
              >
                <Text
                  style={
                    saveAs === label
                      ? styles.optionTextSelected
                      : styles.optionText
                  }
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={this.onSaveLocation}
          >
            <Text style={styles.saveButtonText}>Guardar Dirección</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  searchButton: {
    padding: 10,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: "absolute",
    top: 570,
    right: 10,
    backgroundColor: "#4F46E5",
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
  saveWrapper: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  locationInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f7f7f7",
    marginBottom: 15,
  },
  optionsWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  optionButtonSelected: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  optionText: {
    color: "#000",
  },
  optionTextSelected: {
    color: "#fff",
  },
  saveButton: {
    padding: 15,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
});