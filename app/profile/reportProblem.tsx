import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '../../config/firebase';

type ProblemType = 'technical' | 'professional' | 'billing' | 'other' | '';

const ReportProblemScreen = () => {
  const router = useRouter();
  const [problemType, setProblemType] = useState<ProblemType>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={problemType}
                onValueChange={(itemValue: ProblemType) => setProblemType(itemValue)}
                dropdownIconColor="#4F46E5"
              >
                <Picker.Item 
                  label="Selecciona un tipo de problema" 
                  value="" 
                  style={styles.placeholderText}
                />
                <Picker.Item label="Problema técnico" value="technical" />
                <Picker.Item label="Problema con un profesional" value="professional" />
                <Picker.Item label="Problema de facturación" value="billing" />
                <Picker.Item label="Otro" value="other" />
              </Picker>
            </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
});

export default ReportProblemScreen;