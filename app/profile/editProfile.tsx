import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
  birthDate?: string;
  nacionalidad?: string; 
  gender?: string;
};

const EditProfileScreen = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    fechaNacimiento: '',
    email: '',
    telefono: '',
    birthDate: '',
    nacionalidad: '',
    gender: '',
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
            fechaNacimiento: userData.fechaNacimiento || '',
            telefono: userData.telefono || '',
            birthDate: userData.birthDate || '',
            nacionalidad: userData.nacionalidad || '',
            gender: userData.gender || '',
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Ionicons name="arrow-back-outline" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={form.nombre}
              onChangeText={(text) => handleInputChange('nombre', text)}
            />
          </View>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={styles.input}
              value={form.apellido}
              onChangeText={(text) => handleInputChange('apellido', text)}
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>RUT</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={form.rut}
            editable={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha de Nacimiento</Text>
          <BirthDatePicker
            selectedDate={new Date(form.birthDate)}
            onSelect={(date) => handleInputChange('birthDate', date.toISOString())}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={form.email}
            editable={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={form.telefono}
            keyboardType="phone-pad"
            onChangeText={(text) => handleInputChange('telefono', text)}
          />
        </View>
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Nacionalidad</Text>
            <NationalityPicker
              selectedNationality={form.nacionalidad}
              onSelect={(nationality) => handleInputChange('nacionalidad', nationality)}
            />
          </View>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Género</Text>
            <GenderPicker
              selectedGender={form.gender}
              onSelect={(gender) => handleInputChange('gender', gender)}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>GUARDAR</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  },
  content: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
