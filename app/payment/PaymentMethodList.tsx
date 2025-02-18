import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export interface PaymentMethod {
  id: string
  type: "credit" | "debit"
  last4: string
  brand: string
}

interface PaymentMethodListProps {
  methods: PaymentMethod[]
  onDelete: (id: string) => void
}

const PaymentMethodList: React.FC<PaymentMethodListProps> = ({ methods, onDelete }) => {
  const getCardImage = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return require("../../assets/visa.png")
      case "mastercard":
        return require("../../assets/mastercard.png")
      default:
        return require("../../assets/generic-card.png")
    }
  }

  return (
    <View style={styles.listContainer}>
      {methods.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>No hay métodos de pago registrados.</Text>
        </View>
      ) : (
        methods.map((method) => (
          <View key={method.id} style={styles.itemContainer}>
            <View style={styles.itemInfo}>
              <Image source={getCardImage(method.brand)} style={styles.cardImage} />
              <View style={styles.cardDetails}>
                <Text style={styles.brandText}>{method.brand}</Text>
                <Text style={styles.last4Text}>•••• {method.last4}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => onDelete(method.id)} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  listContainer: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#888",
    marginTop: 16,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardImage: {
    width: 40,
    height: 25,
    resizeMode: "contain",
  },
  cardDetails: {
    marginLeft: 12,
  },
  brandText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  last4Text: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: "#FF4136",
    borderRadius: 8,
    padding: 8,
  },
})

export default PaymentMethodList

