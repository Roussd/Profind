import React, { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"


const initialPaymentMethods = [
  { id: "1", type: "credit", last4: "4242", brand: "Visa" },
  { id: "2", type: "debit", last4: "5555", brand: "Mastercard" },
]

const PaymentMethodsScreen = () => {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods)

  const handleAddPaymentMethod = () => {
    // falta la logica
    Alert.alert("Añadir método de pago", "Aquí se abriría la pantalla para añadir un nuevo método de pago.")
  }

  const handleDeletePaymentMethod = (id: string) => {
    Alert.alert("Eliminar método de pago", "¿Estás seguro de que quieres eliminar este método de pago?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
        },
      },
    ])
  }

  const renderPaymentMethod = ({ item }) => (
    <View style={styles.paymentMethodItem}>
      <View style={styles.paymentMethodInfo}>
        <Ionicons name={item.type === "credit" ? "card" : "cash"} size={24} color="#4F46E5" />
        <Text style={styles.paymentMethodText}>
          {item.brand} terminada en {item.last4}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDeletePaymentMethod(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#FF4136" />
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#4F46E5" />
      </TouchableOpacity>

      <Text style={styles.title}>Métodos de Pago</Text>

      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentMethod}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.addButtonText}>Añadir método de pago</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4F46E5",
    textAlign: "center",
    marginBottom: 30,
  },
  list: {
    flex: 1,
  },
  paymentMethodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paymentMethodInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#4e4e4e",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#4F46E5",
    borderRadius: 24,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
})

export default PaymentMethodsScreen

