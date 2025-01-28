import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../config/firebase";
import BackButton from "../../components/backButton";

const UsersScreen = () => {
  const [users, setUsers] = useState<
    { id: string; nombre: string; service: string }[]
  >([]);
  const [filteredUsers, setFilteredUsers] = useState<
    { id: string; nombre: string; service: string }[]
  >([]);
  const [serviceFilter, setServiceFilter] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("profileType", "in", ["1", "3"]));
      const snapshot = await getDocs(q);

      const usersData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre,
          service: data.service,
        };
      });

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleFilter = (text: string) => {
    setServiceFilter(text);
    if (!text.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((users) =>
        users.service.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const renderItem = ({
    item,
  }: {
    item: { id: string; nombre: string; service: string };
  }) => (
    <View style={styles.userCard}>
      <Text style={styles.userName}>{item.nombre}</Text>
      <Text style={styles.userService}>Servicio: {item.service}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>Usuarios Registrados</Text>
      <TextInput
        style={styles.filterInput}
        placeholder="Filtrar por tipo de servicio..."
        value={serviceFilter}
        onChangeText={handleFilter}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron usuarios.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 50,
    color: "#333",
  },
  filterInput: {
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  userCard: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userService: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
});

export default UsersScreen;
