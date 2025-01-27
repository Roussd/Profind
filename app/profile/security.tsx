import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

const SecurityScreen = () => {
  const router = useRouter();
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isSuspendModalVisible, setSuspendModalVisible] = useState(false);
  const [password, setPassword] = useState('');

  const handleChangePassword = () => {
    router.push('/profile/changePassword');
  };
  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };

  const handleSuspendAccount = () => {
    setSuspendModalVisible(true);
  };

  const confirmDeleteAccount = () => {
    Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada permanentemente.');
    setDeleteModalVisible(false);
  };

  const confirmSuspendAccount = () => {
    Alert.alert('Cuenta suspendida', 'Tu cuenta ha sido suspendida temporalmente.');
    setSuspendModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/profile')}
      >
        <View style={styles.backButtonContainer}>
          <Ionicons name="arrow-back-outline" size={20} color="#4F46E5" />
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>Seguridad</Text>

      <TouchableOpacity style={styles.buttonlogin} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Cambiar Contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonregister} onPress={handleDeleteAccount}>
        <Text style={styles.buttonTextRegister}>Eliminar Cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonregister} onPress={handleSuspendAccount}>
        <Text style={styles.buttonTextRegister}>Suspender Cuenta</Text>
      </TouchableOpacity>

      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Estás seguro?</Text>
            <Text style={styles.modalText}>Esta acción eliminará tu cuenta permanentemente. Por favor, ingresa tu contraseña para confirmar.</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.buttonlogin} onPress={confirmDeleteAccount}>
              <Text style={styles.buttonText}>Confirmar Eliminación</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonregister} onPress={() => setDeleteModalVisible(false)}>
              <Text style={styles.buttonTextRegister}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isSuspendModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Estás seguro?</Text>
            <Text style={styles.modalText}>Esta acción suspenderá tu cuenta temporalmente. Por favor, ingresa tu contraseña para confirmar.</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.buttonlogin} onPress={confirmSuspendAccount}>
              <Text style={styles.buttonText}>Confirmar Suspensión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonregister} onPress={() => setSuspendModalVisible(false)}>
              <Text style={styles.buttonTextRegister}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonlogin: {
    backgroundColor: '#4F46E5',
    width: 280,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backButtonContainer: {
    backgroundColor: '#FFF',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  buttonregister: {
    backgroundColor: '#FFF',
    width: 280,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e7e7e7',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextRegister: {
    color: '#4e4e4e',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#4e4e4e',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#e7e7e7',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

export default SecurityScreen;
