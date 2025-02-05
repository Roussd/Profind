import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRegisterContext } from '../../context/userRegisterContext'; 
import { getFirestore, collection, getDocs } from 'firebase/firestore'; // Importar funciones de Firebase

const ServiceSelectionScreen = () => {
  const router = useRouter();
  const { setRegisterData } = useRegisterContext(); // Usar el hook directamente
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const db = getFirestore();
        const servicesCollection = collection(db, 'services');
        const servicesSnapshot = await getDocs(servicesCollection);
        const servicesList = servicesSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Service document data:', data); 
          return {
            label: data.name, 
            value: doc.id,
          };
        });
        console.log('Services fetched from Firebase:', servicesList);
        setServices(servicesList);
      } catch (error) {
        console.error('Error fetching services:', error);
        Alert.alert('Error', 'Hubo un problema al obtener los servicios. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      Alert.alert('Error', 'Por favor, selecciona al menos un servicio.');
      return;
    }

    // Almacenar datos en el contexto
    setRegisterData({
      service: selectedServices,
    });

    router.push('/register/serviceprice'); // Avanzar a la siguiente pantalla
  };

  const toggleServiceSelection = (service: string) => {
    setSelectedServices((prevSelectedServices) => {
      if (prevSelectedServices.includes(service)) {
        return prevSelectedServices.filter((s) => s !== service);
      } else {
        return [...prevSelectedServices, service];
      }
    });
  };

  const renderService = (service) => (
    <TouchableOpacity
      key={service.value}
      style={[
        styles.serviceOption,
        selectedServices.includes(service.label) && styles.selectedOption,
      ]}
      onPress={() => toggleServiceSelection(service.label)}
    >
      <Ionicons
        name={selectedServices.includes(service.label) ? 'checkbox' : 'square-outline'}
        size={24}
        color="black"
      />
      <Text style={styles.serviceOptionText}>{service.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>¿Qué servicios ofrecerás?</Text>
      <Image source={require('../../assets/images/people.png')} style={styles.imagen} />

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <ScrollView style={styles.servicesContainer} persistentScrollbar={true}>
          {services.map(renderService)}
        </ScrollView>
      )}

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
  servicesContainer: {
    maxHeight: 200, // Limitar la altura para mostrar solo 4 elementos
    marginBottom: 20,
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Reducir el tamaño vertical
    paddingHorizontal: 8, // Reducir el tamaño horizontal
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: '#e0e0e0',
  },
  serviceOptionText: {
    fontSize: 16,
    marginLeft: 10,
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