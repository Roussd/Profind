import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface PaymentMethod {
  id: string;
  type: "credit" | "debit";
  last4: string;
  brand: string;
}

interface PaymentMethodListProps {
  methods: PaymentMethod[];
  onDelete: (id: string) => void;
}

const PaymentMethodList: React.FC<PaymentMethodListProps> = ({ methods, onDelete }) => {
  return (
    <View style={styles.listContainer}>
      {methods.length === 0 ? (
        <Text style={styles.emptyText}>No hay métodos de pago registrados.</Text>
      ) : (
        methods.map((method) => (
          <View key={method.id} style={styles.itemContainer}>
            <View style={styles.itemInfo}>
              <Ionicons
                name={method.type === "credit" ? "card" : "cash"}
                size={24}
                color="#4F46E5"
              />
              <Text style={styles.itemText}>
                {method.brand} terminada en {method.last4}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onDelete(method.id)}>
              <Ionicons name="trash-outline" size={24} color="#FF4136" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#888",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
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
  },
  itemText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#4e4e4e",
  },
});

export default PaymentMethodList;
