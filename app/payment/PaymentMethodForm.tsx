import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert 
} from "react-native";

interface PaymentMethodFormProps {
  onSubmit: (cardNumber: string, cardBrand: string, cardType: "credit" | "debit") => void;
  onCancel: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ onSubmit, onCancel }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardBrand, setCardBrand] = useState("");
  const [cardType, setCardType] = useState<"credit" | "debit">("credit");

  const handleSubmit = () => {
    if (cardNumber.trim().length < 4) {
      Alert.alert("Error", "El número de tarjeta debe tener al menos 4 dígitos.");
      return;
    }
    onSubmit(cardNumber, cardBrand, cardType);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.formContainer}>
        <Text style={styles.header}>Agregar Método de Pago</Text>
        <TextInput
          style={styles.input}
          placeholder="Número de tarjeta"
          keyboardType="number-pad"
          value={cardNumber}
          onChangeText={setCardNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Marca (Visa, Mastercard, etc.)"
          value={cardBrand}
          onChangeText={setCardBrand}
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setCardType((prev) => (prev === "credit" ? "debit" : "credit"))}
        >
          <Text style={styles.toggleButtonText}>
            Tipo: {cardType === "credit" ? "Crédito" : "Débito"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Guardar Método</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F4F7FA",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4F46E5",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F9F9F9",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
  toggleButton: {
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  toggleButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default PaymentMethodForm;
