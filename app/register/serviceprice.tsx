import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore'; // Importa updateDoc
import { auth, firestore } from '../../config/firebase'; // Asegúrate de tener bien configurado tu Firestore y Auth
import { useRegisterContext } from '../../context/userRegisterContext'; // Importa el hook

const ServicePricingScreen = () => {
  const router = useRouter();
  const { nombre, apellido, rut, fechaNacimiento, telefono, profileType, imageUrl, service, setRegisterData } = useRegisterContext(); // Usar el hook directamente
  const [price, setPrice] = useState('');

  const handleContinue = async () => {
    if (!price) {
      Alert.alert('Error', 'Por favor, ingrese el precio del servicio.');
      return;
    }

    const priceRegex = /^[0-9]+$/;
    if (!priceRegex.test(price)) {
      Alert.alert('Error', 'El precio solo debe contener números.');
      return;
    }

    try {
      const userId = auth.currentUser?.uid; // Obtén el ID del usuario autenticado
      if (!userId) {
        Alert.alert('Error', 'No se pudo identificar al usuario.');
        return;
      }

      // Actualizar la información en Firestore
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, {
        nombre,
        apellido,
        rut,
        fechaNacimiento,
        telefono,
        profileType,
        imageUrl,
        service,
        servicePrice: price,
      });

      Alert.alert('Éxito', 'Información registrada correctamente');
      router.push('/register/finishregister');
    } catch (error) {
      console.error('Error al registrar la información:', error);
      Alert.alert('Error', 'Hubo un problema al registrar la información. Inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>¿Cuál es el precio del servicio a ofrecer?</Text>
      <Image source={require('../../assets/images/money.png')} style={styles.image} />

      {/* Input Precio */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="$"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric" // Asegura que solo se puedan ingresar números
        />
        <TouchableOpacity style={styles.iconButton} onPress={handleContinue}>
          <Ionicons name="arrow-forward-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  iconButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    padding: 10,
    marginLeft: 10,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 8,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },
});

export default ServicePricingScreen;