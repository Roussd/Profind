import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, collection, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  requestId?: string;
  professionalData?: {
    id: string;
    nombre: string;
  };
  clientData?: {
    id: string;
    nombre: string;
  };
  servicio?: string;
}

const RatingModal = ({
  visible,
  onClose,
  requestId,
  professionalData,
  clientData,
  servicio,
}: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user || !requestId || !professionalData || !clientData || !servicio) {
        console.log('Datos:', requestId, professionalData, clientData, servicio);
        Alert.alert('Error', 'Faltan datos necesarios');
        return;
      }

      // Verificar si ya existe una valoración
      const solicitudRef = doc(firestore, 'solicitudes', requestId);
      const solicitudSnap = await getDoc(solicitudRef);
      
      if (solicitudSnap.exists() && solicitudSnap.data().rated) {
        Alert.alert('Error', 'Ya existe una valoración para esta solicitud');
        return;
      }

      // Obtener nombre del profesional desde Firestore
      const professionalRef = doc(firestore, 'users', professionalData.id);
      const professionalSnap = await getDoc(professionalRef);
      const professionalName = professionalSnap.data()?.nombre || "Profesional";

      // Crear referencia con estructura correcta
      const ratingsRef = doc(collection(firestore, 'ratings', professionalData.id, 'valoraciones'));

      await setDoc(ratingsRef, {
        profesional: {
          id: professionalData.id,
          nombre: professionalName, // Nombre real desde Firestore
        },
        cliente: {
          id: clientData.id,
          nombre: clientData.nombre,
        },
        servicio,
        requestId, 
        rating,
        comment,
        createdAt: new Date(),
      });

      // Marcar como valorado en la solicitud
      await updateDoc(solicitudRef, { rated: true });

      Alert.alert('Éxito', 'Valoración enviada correctamente');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo enviar la valoración');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((num) => (
      <TouchableOpacity
        key={num}
        onPress={() => setRating(num)}
        disabled={loading}
      >
        <Ionicons
          name={num <= rating ? 'star' : 'star-outline'}
          size={32}
          color="#FFD700"
          style={styles.star}
        />
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>

          <Text style={styles.title}>Calificar Servicio</Text>

          <View style={styles.starsContainer}>{renderStars()}</View>

          <TextInput
            style={styles.input}
            placeholder="Escribe tu comentario..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar Valoración</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1e293b',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top',
    color: '#1e293b',
  },
  button: {
    backgroundColor: '#6d28d9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RatingModal;