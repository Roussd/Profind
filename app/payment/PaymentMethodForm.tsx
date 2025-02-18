import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PaymentMethodFormProps {
  onSubmit: (cardNumber: string, cardBrand: string, cardType: "credit" | "debit") => void;
  onCancel: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ onSubmit, onCancel }) => {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [nickname, setNickname] = useState("");
  const [cardBrand, setCardBrand] = useState("");
  const [cardType, setCardType] = useState<"credit" | "debit">("credit");


  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D+/g, "");
    const limited = cleaned.slice(0, 16);
    let formatted = "";
    for (let i = 0; i < limited.length; i += 4) {
      formatted += limited.substring(i, i + 4) + " ";
    }
    formatted = formatted.trim();
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (text: string) => {

    let cleaned = text.replace(/[^\d\/]/g, "");

    if (cleaned.length === 2 && !cleaned.includes("/")) {
      cleaned = cleaned + "/";
    }

    if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 5);
    }
    setExpiryDate(cleaned);
  };


  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D+/g, "");
    setCvv(cleaned.slice(0, 3));
  };

  const handleSubmit = () => {

    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    if (cleanedCardNumber.length !== 16) {
      Alert.alert("Error", "El número de tarjeta debe tener 16 dígitos.");
      return;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiryDate)) {
      Alert.alert("Error", "La fecha de expiración debe tener el formato mm/yy y ser válida.");
      return;
    }

    if (cvv.length !== 3) {
      Alert.alert("Error", "El CVV debe tener 3 dígitos.");
      return;
    }
    onSubmit(cleanedCardNumber, cardBrand, cardType);
  };

  const getCardImage = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return require("../../assets/visa.png");
      case "mastercard":
        return require("../../assets/mastercard.png");
      default:
        return require("../../assets/generic-card.png");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={onCancel} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#4F46E5" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Añadir nuevo método</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.cardDetailsContainer}>
            <Text style={styles.cardDetailsTitle}>Detalles de Tarjeta</Text>
            <View style={styles.brandsContainer}>
              <TouchableOpacity onPress={() => setCardBrand("mastercard")}>
                <Image source={require("../../assets/mastercard.png")} style={styles.brandIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCardBrand("visa")}>
                <Image source={require("../../assets/visa.png")} style={styles.brandIcon} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre en la Tarjeta"
              placeholderTextColor="#A0AEC0"
              value={cardName}
              onChangeText={setCardName}
            />
            <TextInput
              style={styles.input}
              placeholder="Número de la Tarjeta"
              placeholderTextColor="#A0AEC0"
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.rowInput]}
                placeholder="mm/yy"
                placeholderTextColor="#A0AEC0"
                value={expiryDate}
                onChangeText={handleExpiryDateChange}
              />
              <TextInput
                style={[styles.input, styles.rowInput]}
                placeholder="CVV"
                placeholderTextColor="#A0AEC0"
                keyboardType="number-pad"
                value={cvv}
                onChangeText={handleCvvChange}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Apodo (opcional)"
              placeholderTextColor="#A0AEC0"
              value={nickname}
              onChangeText={setNickname}
            />

            <TouchableOpacity
              style={styles.toggleTypeButton}
              onPress={() => setCardType((prev) => (prev === "credit" ? "debit" : "credit"))}
            >
              <Ionicons
                name={cardType === "credit" ? "card-outline" : "cash-outline"}
                size={20}
                color="#4F46E5"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.toggleTypeButtonText}>
                {cardType === "credit" ? "Tarjeta de Crédito" : "Tarjeta de Débito"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.saveButtonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#4F46E5",
    textAlign: "center",
  },
  cardDetailsContainer: {
    margin: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDetailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
  },
  brandsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  brandIcon: {
    width: 50,
    height: 30,
    resizeMode: "contain",
    marginRight: 16,
  },
  input: {
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#2D3748",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowInput: {
    width: "48%",
  },
  toggleTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF4FF",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  toggleTypeButtonText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default PaymentMethodForm;
