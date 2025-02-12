import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PaymentMethodList, { PaymentMethod } from "./PaymentMethodList";
import PaymentMethodForm from "./PaymentMethodForm";

const PaymentMethodsScreen = () => {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddPaymentMethod = (cardNumber: string, cardBrand: string, cardType: "credit" | "debit") => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: cardType,
      last4: cardNumber.slice(-4),
      brand: cardBrand || "Desconocido",
    };
    setPaymentMethods((prev) => [...prev, newMethod]);
    setModalVisible(false);
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <PaymentMethodForm onSubmit={handleAddPaymentMethod} onCancel={() => setModalVisible(false)} />
      </Modal>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#4F46E5" />
      </TouchableOpacity>

      <Text style={styles.title}>Métodos de Pago</Text>

      <PaymentMethodList methods={paymentMethods} onDelete={handleDeletePaymentMethod} />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.addButtonText}>Añadir método de pago</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "white",
    borderRadius: 30,
    padding: 10,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4F46E5",
    textAlign: "center",
    marginBottom: 20,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#4F46E5",
    borderRadius: 24,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default PaymentMethodsScreen;
