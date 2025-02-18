import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth"
import { doc, updateDoc, deleteDoc } from "firebase/firestore"
import { firestore, auth } from "../../config/firebase"

const SecurityScreen = () => {
  const router = useRouter()
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false)
  const [isSuspendModalVisible, setSuspendModalVisible] = useState(false)
  const [password, setPassword] = useState("")

  const handleChangePassword = () => {
    router.push("/profile/changePassword")
  }

  const handleDeleteAccount = () => {
    setDeleteModalVisible(true)
  }

  const handleSuspendAccount = () => {
    setSuspendModalVisible(true)
  }

  const confirmDeleteAccount = async () => {
    try {
      const user = auth.currentUser
      if (!user || !user.email) {
        Alert.alert("Error", "Usuario no autenticado.")
        return
      }

      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)

      const userDoc = doc(firestore, "users", user.uid)
      await deleteDoc(userDoc)

      await deleteUser(user)

      Alert.alert("Cuenta eliminada", "Tu cuenta ha sido eliminada permanentemente.")
      setDeleteModalVisible(false)
      setPassword("")
      router.push("/login")
    } catch (error) {
      console.error("Error al eliminar cuenta:", error)
      Alert.alert("Error", "No se pudo eliminar la cuenta. Verifica tu contraseña.")
      setPassword("")
    }
  }

  const confirmSuspendAccount = async () => {
    try {
      const user = auth.currentUser
      if (!user || !user.email) {
        Alert.alert("Error", "Usuario no autenticado.")
        return
      }

      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)

      const userDoc = doc(firestore, "users", user.uid)
      await updateDoc(userDoc, {
        suspended: true,
        suspendedAt: new Date().toISOString(),
      })

      Alert.alert("Cuenta suspendida", "Tu cuenta ha sido suspendida temporalmente.")
      setSuspendModalVisible(false)
      setPassword("")
      await auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error al suspender cuenta:", error)
      Alert.alert("Error", "No se pudo suspender la cuenta. Verifica tu contraseña.")
      setPassword("")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back-outline" size={20} color="#4F46E5" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguridad</Text>
      </View>
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Cambiar Contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleDeleteAccount}>
          <Text style={[styles.buttonText, styles.dangerButtonText]}>Eliminar Cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleSuspendAccount}>
          <Text style={[styles.buttonText, styles.dangerButtonText]}>Suspender Cuenta</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={isDeleteModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Estás seguro?</Text>
            <Text style={styles.modalText}>
              Esta acción eliminará tu cuenta permanentemente. Por favor, ingresa tu contraseña para confirmar.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={confirmDeleteAccount}>
              <Text style={styles.buttonText}>Confirmar Eliminación</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setDeleteModalVisible(false)
                setPassword("")
              }}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isSuspendModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Estás seguro?</Text>
            <Text style={styles.modalText}>
              Esta acción suspenderá tu cuenta temporalmente. Por favor, ingresa tu contraseña para confirmar.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={confirmSuspendAccount}>
              <Text style={styles.buttonText}>Confirmar Suspensión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setSuspendModalVisible(false)
                setPassword("")
              }}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
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
  content: {
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  dangerButtonText: {
    color: "#EF4444",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 8,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F6F6F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: "#F6F6F6",
  },
  cancelButtonText: {
    color: "#333",
  },
})

export default SecurityScreen

