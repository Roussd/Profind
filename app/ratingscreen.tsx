import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from '../config/firebase'; // Asegúrate de tener bien configurado tu Firestore y Auth

const AddRatingScreen = ({ route }) => {
  const { userId } = route.params; // ID del usuario que recibe la valoración
  const router = useRouter();
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  const handleAddRating = async () => {
    if (!rating) {
      Alert.alert('Error', 'Por favor, ingrese una valoración.');
      return;
    }

    const ratingValue = parseInt(rating);
    if (ratingValue < 1 || ratingValue > 5) {
      Alert.alert('Error', 'La valoración debe estar entre 1 y 5.');
      return;
    }

    try {
      const raterId = auth.currentUser?.uid; // ID del usuario que da la valoración
      if (!raterId) {
        Alert.alert('Error', 'No se pudo identificar al usuario.');
        return;
      }

      const db = getFirestore();
      await addDoc(collection(db, 'ratings'), {
        userId,
        raterId,
        rating: ratingValue,
        comment,
      });

      Alert.alert('Éxito', 'Valoración agregada correctamente');
      router.push('/home'); // Redirigir a la pantalla principal
    } catch (error) {
      console.error('Error al agregar la valoración:', error);
      Alert.alert('Error', 'Hubo un problema al agregar la valoración. Inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Valoración</Text>
      <TextInput
        style={styles.input}
        placeholder="Valoración (1-5)"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Comentario (opcional)"
        value={comment}
        onChangeText={setComment}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddRating}>
        <Text style={styles.buttonText}>Agregar Valoración</Text>
      </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
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
    color: 'white',
    fontSize: 16,
  },
});

export default AddRatingScreen;