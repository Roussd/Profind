import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRegisterContext } from '../../context/userRegisterContext'; // Importa el hook
import { checkRut, prettifyRut } from 'react-rut-formatter'; // Importa las funciones de react-rut-formatter
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'; // Importar funciones de Firebase
import BirthDatePicker from '../../components/birthDatePicker'; // Importar el componente BirthDatePicker

const RegisterScreen = () => {
  const router = useRouter();
  const { setRegisterData } = useRegisterContext(); // Usar el hook directamente
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [rut, setRut] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [telefono, setTelefono] = useState('');

  const checkRutInDatabase = async (rut) => {
    const db = getFirestore();
    const q = query(collection(db, 'users'), where('rut', '==', rut));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const isAdult = (birthDate) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const handleContinue = async () => {
    if (!nombre || !apellido || !rut || !fechaNacimiento || !telefono) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(nombre) || !nameRegex.test(apellido)) {
      Alert.alert('Error', 'El nombre y apellido solo deben contener letras.');
      return;
    }

    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(telefono)) {
      Alert.alert('Error', 'El número de teléfono solo debe contener números.');
      return;
    }

    if (!checkRut(rut)) {
      Alert.alert('Error', 'RUT inválido. Por favor, ingresa un RUT válido.');
      return;
    }

    if (!isAdult(fechaNacimiento)) {
      Alert.alert('Error', 'Debes ser mayor de 18 años para registrarte.');
      return;
    }

    const isRutRegistered = await checkRutInDatabase(rut);
    if (isRutRegistered) {
      Alert.alert('Error', 'El RUT ya está registrado.');
      return;
    }

    // Almacenar datos en el contexto
    setRegisterData({
      nombre,
      apellido,
      rut: prettifyRut(rut),
      fechaNacimiento,
      telefono,
    });

    // Pasar a la pantalla de selección de servicios
    router.push('/register/profiletype');
  };

  return (
    <View style={styles.container}>
      {/* Botón para volver */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Registrarse</Text>
      <Text style={styles.subtitle}>
        Crea una cuenta para empezar a promocionar tus servicios con el mundo!
      </Text>

      {/* Campo Nombre */}
      <Text style={styles.inputLabel}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Juan"
        value={nombre}
        onChangeText={setNombre}
      />

      {/* Campo Apellido */}
      <Text style={styles.inputLabel}>Apellido</Text>
      <TextInput
        style={styles.input}
        placeholder="Perez"
        value={apellido}
        onChangeText={setApellido}
      />

      {/* Contenedor para RUT y Teléfono */}
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>RUT</Text>
          <TextInput
            style={styles.input}
            placeholder="12.345.678-9"
            value={rut}
            onChangeText={setRut}
            onBlur={() => setRut(prettifyRut(rut))}
            keyboardType="default"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="912345678"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Campo Fecha de nacimiento */}
      <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
      <BirthDatePicker
        selectedDate={fechaNacimiento}
        onSelect={setFechaNacimiento}
      />

      {/* Botón Continuar */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -80,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1E293B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 14,
    color: '#1E293B',
  },
  continueButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;