import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, firestore } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const SplashScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const checkUser = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Si el usuario está autenticado, verifica el estado de profileCompleted
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.profileCompleted) {
            router.replace('/homePage'); // Redirige a la pantalla principal
          } else {
            router.replace('/home'); // Redirige a la pantalla de registro
          }
        } else {
          Alert.alert('Error', 'No se pudo encontrar la información del usuario.');
        }
      } else {
        // Si no está autenticado, redirige a la pantalla de inicio
        router.replace('/home'); // Cambia esto si tu pantalla de inicio tiene otra ruta
      }
    });

    // Limpia el listener al desmontar el componente
    return () => checkUser();
  }, []);

  return (
    <View style={styles.container}>
      {/* Imagen del logo */}
      <Image source={require('../assets/images/iniciologo.png')} style={styles.logo} />
      <Text style={styles.title}>Cargando...</Text>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 20,
  },
});

export default SplashScreen;