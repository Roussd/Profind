import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const LoginScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkProfileCompletion(currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  const checkProfileCompletion = async (userId: string) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.profileCompleted) {
          router.replace('/homePage');
        } else {
          router.replace('/register/register');
        }
      } else {
        Alert.alert('Error', 'No se pudo encontrar la información del usuario.');
      }
    } catch (error: any) {
      console.error('Error al verificar el estado del perfil:', error);
      Alert.alert('Error', 'Hubo un problema al verificar el estado del perfil. Inténtalo de nuevo.');
    }
  };

  const handleRegister = () => {
    router.replace('/register/home');
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error al iniciar sesión.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Iniciar Sesión</Text>
      <Text style={styles.subtitle}>
        ¡Bienvenido/a de nuevo! Por favor inicia sesión para continuar
      </Text>

      <Text style={styles.inputText}>Correo electrónico</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="correoprueba@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.inputText}>Contraseña</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="**********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons
            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.rememberMeContainer}>
        <TouchableOpacity style={styles.checkbox} onPress={() => setRememberMe(!rememberMe)}>
          <Ionicons
            name={rememberMe ? 'checkbox-outline' : 'square-outline'}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
        <Text style={styles.rememberMeText}>Recordarme durante 30 días</Text>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        <Ionicons name="arrow-forward-outline" size={20} color="white" style={styles.iconRight} />
      </TouchableOpacity>

      <View style={styles.linksContainer}>
        <View style={styles.linkRow}>
          <Text>¿No tienes una cuenta aún? </Text>
          <TouchableOpacity onPress={() => router.push('/register/home')}>
            <Text style={styles.linkText}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.separatorContainer}>
        <View style={styles.line} />
        <View style={styles.circle} />
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.socialButton}>
        <Ionicons name="logo-google" size={22} />
        <Text style={styles.socialButtonText}>Iniciar sesión con Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialButton}>
        <Ionicons name="logo-facebook" size={22} />
        <Text style={styles.socialButtonText}>Iniciar sesión con Facebook</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputText: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: 'gray',
    borderRadius: 24,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
  },
  checkbox: {
    marginRight: 10,
  },
  rememberMeText: {
    color: 'gray',
    fontSize: 14,
    fontWeight: 'bold',
  },
  linksContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: 'gray',
    borderWidth: 2,
    marginHorizontal: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 0.8,
    borderColor: 'gray',
    height: 52,
    borderRadius: 24,
    paddingVertical: 15,
    marginBottom: 10,
  },
  socialButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
});

export default LoginScreen;
