import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { firestore, auth } from "../../config/firebase";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";

const WorkerSettingsScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    hourlyRate: 0,
    maxDistance: 0,
    categories: [],
    autoAccept: false,
    schedule: "",
    experience: "",
    certifications: "",
  });

  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    const fetchWorkerSettings = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert("Error", "No se pudo obtener la información del usuario.");
        return;
      }
      try {
        const userDoc = doc(firestore, "users", userId);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData({
            hourlyRate: data.hourlyRate || 0,
            maxDistance: data.maxDistance || 0,
            categories: data.categories || [],
            autoAccept: data.autoAccept || false,
            schedule: data.schedule || "",
            experience: data.experience || "",
            certifications: data.certifications || "",
          });

          setSelectedServices(Array.isArray(data.categories) ? data.categories : []);
        }
      } catch (error) {
        console.error("Error al obtener los ajustes del trabajador:", error);
        Alert.alert("Error", "Hubo un problema al cargar los ajustes del trabajador.");
      }
    };

    fetchWorkerSettings();
  }, []);

  const handleUpdateSetting = async (setting: string, value: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const userDoc = doc(firestore, "users", userId);
      await updateDoc(userDoc, { [setting]: value });
      setUserData((prevData) => ({ ...prevData, [setting]: value }));
      Alert.alert("Éxito", "Ajuste actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar el ajuste:", error);
      Alert.alert("Error", "No se pudo actualizar el ajuste.");
    }
  };


  const openServiceSelectionModal = async () => {
    setIsServiceModalVisible(true);
    setLoadingServices(true);
    try {
      const servicesSnapshot = await getDocs(collection(firestore, "services"));
      const list = servicesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return { label: data.name, value: doc.id };
      });
      setServicesList(list);
    } catch (error) {
      console.error("Error fetching services:", error);
      Alert.alert("Error", "Hubo un problema al obtener los servicios.");
    } finally {
      setLoadingServices(false);
    }
  };


  const toggleServiceSelection = (serviceLabel: string) => {
    setSelectedServices((prevSelected) => {
      if (prevSelected.includes(serviceLabel)) {
        return prevSelected.filter((s) => s !== serviceLabel);
      } else {
        return [...prevSelected, serviceLabel];
      }
    });
  };


  const confirmServiceSelection = () => {
    handleUpdateSetting("categories", selectedServices);
    setIsServiceModalVisible(false);
  };

  const promptForSetting = (
    setting: string,
    title: string,
    currentValue: string | number,
    keyboardType: "default" | "numeric" = "default"
  ) => {
    if (Platform.OS === "ios" && Alert.prompt) {
      Alert.prompt(
        title,
        "",
        (text) => {
          if (text !== null) {
            let newValue: any = text;
            if (typeof currentValue === "number") {
              newValue = Number.parseFloat(text);
              if (isNaN(newValue)) {
                Alert.alert("Error", "Ingrese un número válido.");
                return;
              }
            }
            handleUpdateSetting(setting, newValue);
          }
        },
        "plain-text",
        currentValue.toString(),
        keyboardType
      );
    } else {
      Alert.alert("Funcionalidad no disponible", "La edición directa no está soportada en este dispositivo.");
    }
  };

  const SettingItem = ({
    icon,
    title,
    value,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string | number | boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={22} color="#4F46E5" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {typeof value === "boolean" ? (
          <Switch
            value={value}
            onValueChange={(newValue) => handleUpdateSetting("autoAccept", newValue)}
            thumbColor="#4F46E5"
            trackColor={{ false: "#ccc", true: "#4F46E5" }}
          />
        ) : (
          <Text style={styles.settingValue}>{value}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back-outline" size={20} color="#4F46E5" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajustes de Trabajador</Text>
      </View>
      <ScrollView style={styles.content}>
        <SettingItem
          icon="cash-outline"
          title="Tarifa por hora"
          value={`$${userData.hourlyRate}/hr`}
          onPress={() =>
            promptForSetting("hourlyRate", "Editar tarifa por hora", userData.hourlyRate, "numeric")
          }
        />
        <SettingItem
          icon="locate-outline"
          title="Distancia máxima"
          value={`${userData.maxDistance} km`}
          onPress={() =>
            promptForSetting("maxDistance", "Editar distancia máxima (km)", userData.maxDistance, "numeric")
          }
        />
        <SettingItem
          icon="list-outline"
          title="Categorías de servicio"
          value={userData.categories.length ? userData.categories.join(", ") : "No especificado"}
          onPress={openServiceSelectionModal}
        />
        <SettingItem icon="checkmark-circle-outline" title="Auto-aceptar trabajos" value={userData.autoAccept} />
        <SettingItem
          icon="briefcase-outline"
          title="Experiencia y habilidades"
          value={userData.experience || "No especificado"}
          onPress={() => promptForSetting("experience", "Editar experiencia y habilidades", userData.experience)}
        />
        <SettingItem
          icon="document-text-outline"
          title="Certificaciones"
          value={userData.certifications || "No especificado"}
          onPress={() => promptForSetting("certifications", "Editar certificaciones", userData.certifications)}
        />
      </ScrollView>


      <Modal
        visible={isServiceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsServiceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona tus servicios</Text>
            {loadingServices ? (
              <ActivityIndicator size="large" color="#4F46E5" />
            ) : (
              <ScrollView style={styles.servicesModalList}>
                {servicesList.map((service) => (
                  <TouchableOpacity
                    key={service.value}
                    style={[
                      styles.serviceOption,
                      selectedServices.includes(service.label) && styles.selectedOption,
                    ]}
                    onPress={() => toggleServiceSelection(service.label)}
                  >
                    <Ionicons
                      name={selectedServices.includes(service.label) ? "checkbox" : "square-outline"}
                      size={24}
                      color="black"
                    />
                    <Text style={styles.serviceOptionText}>{service.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.modalButton} onPress={confirmServiceSelection}>
              <Text style={styles.modalButtonText}>Confirmar selección</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalClose} onPress={() => setIsServiceModalVisible(false)}>
              <Ionicons name="close" size={24} color="#4F46E5" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F6" },
  header: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#333" },
  backButton: { position: "absolute", top: 20, left: 20, zIndex: 10 },
  backButtonContainer: {
    backgroundColor: "#FFF",
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { flex: 1, padding: 20 },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  settingIconContainer: { marginRight: 16 },
  settingContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  settingValue: { fontSize: 14, color: "#666" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10, color: "#333" },
  servicesModalList: { maxHeight: 300, width: "100%" },
  serviceOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
  },
  selectedOption: { backgroundColor: "#e0e0e0" },
  serviceOptionText: { fontSize: 16, marginLeft: 10 },
  modalButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  modalButtonText: { color: "white", fontSize: 16 },
  modalClose: { marginTop: 10 },
});

export default WorkerSettingsScreen;
