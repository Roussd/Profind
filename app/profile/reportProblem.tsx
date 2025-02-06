import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '../../config/firebase';

type ProblemType = 'technical' | 'professional' | 'billing' | 'other' | '';

const problemTypes = [
  { label: 'Problema técnico', value: 'technical', icon: 'build' },
  { label: 'Problema con un profesional', value: 'professional', icon: 'people' },
  { label: 'Problema de facturación', value: 'billing', icon: 'cash' },
  { label: 'Otro', value: 'other', icon: 'help-circle' },
];

const ReportProblemScreen = () => {
  const router = useRouter();
  const [problemType, setProblemType] = useState<ProblemType>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('Selecciona un tipo de problema');

  const handleSelect = (value: ProblemType, label: string) => {
    setProblemType(value);
    setSelectedLabel(label);
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!problemType || !description) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      await addDoc(collection(firestore, 'reports'), {
        problemType,
        description,
        status: 'pending',
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'no-email',
        createdAt: serverTimestamp()
      });
      
      Alert.alert('Éxito', 'Tu reporte ha sido enviado. Nos pondremos en contacto contigo pronto.');
      router.back();
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      Alert.alert('Error', 'Ocurrió un error al enviar el reporte. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Text style={styles.headerTitle}>Reportar un Problema</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tipo de Problema</Text>
            <TouchableOpacity 
              style={styles.dropdownTrigger}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.selectedLabelText}>{selectedLabel}</Text>
              <Ionicons name="chevron-down" size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción del Problema</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={6}
              onChangeText={setDescription}
              value={description}
              placeholder="Describe el problema en detalle..."
              placeholderTextColor="#9CA3AF"
              editable={!isSubmitting}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Ionicons name="send-outline" size={18} color="white" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Enviando...' : ' Enviar Reporte'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de selección */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar tipo de problema</Text>
            
            {problemTypes.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.modalItem}
                onPress={() => handleSelect(item.value as ProblemType, item.label)}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color="#4F46E5" 
                  style={styles.modalIcon}
                />
                <Text style={styles.modalItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  selectedLabelText: {
    color: '#1F2937',
    fontSize: 16,
  },
  dropdownContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    maxHeight: 200,
    backgroundColor: '#FFF',
    elevation: 3,
  },
  dropdownItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  itemIcon: {
    marginRight: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 100,
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  backButton: {
    position: 'absolute',
    top: 20,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    marginTop: -30,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  textArea: {
    height: 140,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  modalIcon: {
    marginRight: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportProblemScreen;