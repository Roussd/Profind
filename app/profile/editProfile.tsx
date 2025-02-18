import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import NationalityPicker from '../../components/nationalityPicker';
import BirthDatePicker from '../../components/birthDatePicker';
import GenderPicker from '../../components/genderPicker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore, auth } from '../../config/firebase';

type UserProfile = {
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: string;
  email: string;
  telefono: string;
  nacionalidad?: string;
  genero?: string;
};

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

const EditProfileScreen = () => {
  const router = useRouter();

  const [form, setForm] = useState<UserProfile>({
    nombre: '',
    apellido: '',
    rut: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    nacionalidad: '',
    genero: '',
  });

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setForm({ ...form, [field]: value });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario.');
        return;
      }

      try {
        const userDoc = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          setForm({
            nombre: userData.nombre || '',
            apellido: userData.apellido || '',
            rut: userData.rut || '',
            telefono: userData.telefono || '',
            fechaNacimiento: userData.fechaNacimiento || '',
            nacionalidad: userData.nacionalidad || '',
            genero: userData.genero || '',
            email: auth.currentUser?.email || userData.email || '',
          });
        } else {
          Alert.alert('Error', 'No se encontraron datos para este usuario.');
        }
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        Alert.alert('Error', 'Hubo un problema al cargar los datos del usuario.');
      }
    };

    fetchUserData();
  }, []);

  const validateForm = () => {
    if (!form.nombre || !form.apellido || !form.email || !form.telefono) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert('Error', 'Por favor, ingresa un correo válido.');
      return false;
    }

    const phoneRegex = /^[0-9]{9,15}$/;
    if (!phoneRegex.test(form.telefono)) {
      Alert.alert('Error', 'Por favor, ingresa un número de teléfono válido.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener el usuario actual.');
        return;
      }

      const userDoc = doc(firestore, 'users', userId);
      await updateDoc(userDoc, form);

      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      router.push('/profile');
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      Alert.alert('Error', 'No se pudieron guardar los datos.');
    }
  };

  const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChangeText,
    editable = true,
    keyboardType = 'default',
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.disabledInput]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back-outline" size={20} color="#4F46E5" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always">
        <View style={styles.formContainer}>
          <InputField
            label="Nombre"
            value={form.nombre}
            onChangeText={(text) => handleInputChange('nombre', text)}
          />
          <InputField
            label="Apellido"
            value={form.apellido}
            onChangeText={(text) => handleInputChange('apellido', text)}
          />
          <InputField
            label="RUT"
            value={form.rut}
            editable={false}
            onChangeText={() => {}}
          />
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de Nacimiento</Text>
            <BirthDatePicker
              selectedDate={new Date(form.fechaNacimiento)}
              onSelect={(date) =>
                handleInputChange('fechaNacimiento', date.toISOString())
              }
            />
          </View>
          <InputField
            label="Email"
            value={form.email}
            editable={false}
            onChangeText={() => {}}
          />
          <InputField
            label="Teléfono"
            value={form.telefono}
            onChangeText={(text) => handleInputChange('telefono', text)}
            keyboardType="phone-pad"
          />
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nacionalidad</Text>
            <NationalityPicker
              selectedNationality={form.nacionalidad || ''}
              onSelect={(nationality) => handleInputChange('nacionalidad', nationality)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Género</Text>
            <GenderPicker
              selectedGender={form.genero || ''}
              onSelect={(genero) => handleInputChange('genero', genero)}
            />
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
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
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
