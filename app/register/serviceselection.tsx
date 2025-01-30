import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRegisterContext } from '../../context/userRegisterContext'; // Importa el hook

const ServiceSelectionScreen = () => {
  const router = useRouter();
  const { setRegisterData } = useRegisterContext(); // Usar el hook directamente
  const [selectedService, setSelectedService] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const services = [
    { label: 'Gasfiter', value: 'gasfiter' },
    { label: 'Electricista', value: 'electricista' },
    { label: 'Carpintero', value: 'carpintero' },
  ];

  const handleContinue = () => {
    if (!selectedService) {
      Alert.alert('Error', 'Por favor, selecciona un servicio.');
      return;
    }

    // Almacenar datos en el contexto
    setRegisterData({
      service: selectedService,
    });

    router.push('/register/serviceprice'); // Avanzar a la siguiente pantalla
  };

  const renderService = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownOption}
      onPress={() => {
        setSelectedService(item.label);
        setDropdownVisible(false);
      }}
    >
      <Text style={styles.dropdownOptionText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>¿Qué servicios ofrecerás?</Text>
      <Image source={require('../../assets/images/people.png')} style={styles.imagen} />

      <TouchableOpacity
        style={styles.dropdownTrigger}
        onPress={() => setDropdownVisible(true)}
      >
        <Text style={styles.dropdownText}>
          {selectedService || 'Seleccione una opción'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="gray" />
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <FlatList
              data={services}
              keyExtractor={(item) => item.value}
              renderItem={renderService}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpContainer}>
        <Text style={styles.helpText}>¿Necesitas ayuda?</Text>
        <Ionicons name="help-circle-outline" size={20} color="black" />
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
  imagen: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  dropdownOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownOptionText: {
    fontSize: 14,
  },
  continueButton: {
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
  continueButtonText: {
    color: 'white',
    fontSize: 16,
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  helpText: {
    fontSize: 14,
    marginRight: 5,
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
});

export default ServiceSelectionScreen;