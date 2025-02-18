import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, SafeAreaView, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import PaymentMethodList, { type PaymentMethod } from "./PaymentMethodList"
import PaymentMethodForm from "./PaymentMethodForm"

const PaymentMethodsScreen = () => {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [modalVisible, setModalVisible] = useState(false)

  const handleAddPaymentMethod = (cardNumber: string, cardBrand: string, cardType: "credit" | "debit") => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: cardType,
      last4: cardNumber.slice(-4),
      brand: cardBrand || "Desconocido",
    }
    setPaymentMethods((prev) => [...prev, newMethod])
    setModalVisible(false)
  }

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back-outline" size={20} color="#4F46E5" />
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>Métodos de Pago</Text>
      </View>

      <ScrollView style={styles.content}>
        <PaymentMethodList methods={paymentMethods} onDelete={handleDeletePaymentMethod} />

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Añadir método de pago</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <PaymentMethodForm onSubmit={handleAddPaymentMethod} onCancel={() => setModalVisible(false)} />
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
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
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backButtonContainer: {
    backgroundColor: "#FFF",
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})

export default PaymentMethodsScreen

