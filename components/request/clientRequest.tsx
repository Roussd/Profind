// components/clientRequest.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { doc, updateDoc } from "firebase/firestore";
import { firestore, auth } from "../../config/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import Geocoder from "react-native-geocoding";
import worker from "../../assets/images/trabajador1.png";
import client from "../../assets/images/cliente1.png";

interface ClientRequestProps {
  visible: boolean;
  onClose: () => void;
  professionalLocation: { latitude: number; longitude: number };
  clientLocation: { latitude: number; longitude: number };
  requestId: string;
}

const API_KEY = process.env.EXPO_FIREBASE_API_KEY;
Geocoder.init(API_KEY);

const ClientRequest: React.FC<ClientRequestProps> = ({
  visible,
  onClose,
  professionalLocation,
  clientLocation,
  requestId,
}) => {
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [cancelReason, setCancelReason] = useState("");
  const [addresses, setAddresses] = useState({
    professional: "",
    client: "",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const proAddress = await getAddress(professionalLocation);
        const cliAddress = await getAddress(clientLocation);
        setAddresses({ professional: proAddress, client: cliAddress });
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    if (visible) {
      fetchAddresses();
      fetchRoute();
    }
  }, [visible]);

  const getAddress = async (location: { latitude: number; longitude: number }) => {
    try {
      const response = await Geocoder.from(location.latitude, location.longitude);
      return response.results[0].formatted_address;
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Dirección no disponible";
    }
  };

  const fetchRoute = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${professionalLocation.latitude},${professionalLocation.longitude}&destination=${clientLocation.latitude},${clientLocation.longitude}&key=${API_KEY}`
      );
      const json = await response.json();
      const points = json.routes[0]?.overview_polyline?.points;
      if (points) {
        setRouteCoordinates(decodePolyline(points));
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const decodePolyline = (encoded: string) => {
    const poly = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return poly;
  };

  const handleComplete = async () => {
    try {
      const requestRef = doc(firestore, "solicitudes", requestId);
      await updateDoc(requestRef, {
        estado: "completada",
        fechaFinalizacion: new Date(),
      });
      onClose();
      Alert.alert("Servicio completado", "El servicio ha sido marcado como completado");
    } catch (error) {
      console.error("Error completing service:", error);
      Alert.alert("Error", "No se pudo completar el servicio");
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      Alert.alert("Error", "Debe ingresar un motivo de cancelación");
      return;
    }

    try {
      const requestRef = doc(firestore, "solicitudes", requestId);
      await updateDoc(requestRef, {
        estado: "rechazada",
        motivoCancelacion: cancelReason,
        fechaCancelacion: new Date(),
      });
      onClose();
      Alert.alert("Servicio cancelado", "El servicio ha sido cancelado exitosamente");
    } catch (error) {
      console.error("Error canceling service:", error);
      Alert.alert("Error", "No se pudo cancelar el servicio");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: professionalLocation.latitude,
            longitude: professionalLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={professionalLocation}
            title="Tu ubicación"
            description={addresses.professional}
            image={worker}
          />
          <Marker
            coordinate={clientLocation}
            title="Cliente"
            pinColor="#4F46E5"
            description={addresses.client}
            image={client}
          />
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#4F46E5"
              strokeWidth={4}
            />
          )}
        </MapView>

        <View style={styles.controlsContainer}>
          <TextInput
            style={styles.input}
            placeholder="Motivo de cancelación (obligatorio)"
            value={cancelReason}
            onChangeText={setCancelReason}
            multiline
          />

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.completeButton]}
              onPress={handleComplete}
            >
              <Text style={styles.buttonText}>Marcar como completado</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancelar servicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  map: {
    flex: 1,
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: "#10B981",
  },
  cancelButton: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ClientRequest;