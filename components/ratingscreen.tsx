import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const AddRatingScreen = ({ onClose }) => {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const userName = 'John Doe'; // Local variable for the user's name

  const handleAddRating = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor, ingrese una valoración.');
      return;
    }
    onClose(); // Cerrar el modal después de añadir la valoración
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => (
      <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
        <Ionicons
          name={index < rating ? 'star' : 'star-outline'}
          size={32}
          color={index < rating ? '#FFD700' : '#000'}
          style={styles.star}
        />
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Añadir Valoración</Text>
          <View style={styles.profileContainer}>
            <Ionicons name="person-circle-outline" size={80} color="#4F46E5" />
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.starsContainer}>{renderStars()}</View>
          <TextInput
            style={styles.input}
            placeholder="Comentario"
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={handleAddRating}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddRatingScreen;