import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { useFocusEffect } from 'expo-router';

const ProfileScreen = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
  });

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
          setUserData({
            nombre: userSnap.data().nombre || 'Usuario',
            email: auth.currentUser?.email || userSnap.data().email || 'No especificado',
          });
        } else {
          setUserData({
            nombre: 'Usuario',
            email: auth.currentUser?.email || 'No especificado',
          });
        }
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        Alert.alert('Error', 'Hubo un problema al cargar los datos del usuario.');
      }
    };

    fetchUserData();
  }, []);


  const fetchProfileImage = async () => {
    if (!auth.currentUser?.photoURL) {
      setProfileImage(null);
      return;
    }

    try {
      const downloadURL = await getDownloadURL(ref(getStorage(), auth.currentUser.photoURL));
      setProfileImage(downloadURL);
    } catch (error) {
      console.log('Error al obtener imagen:', error);
      setProfileImage(null);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProfileImage();
    }, [])
  );


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/home');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al cerrar sesión. Inténtalo de nuevo.');
    }
  };

  const MenuItem = ({
    icon,
    text,
    rightText = null,
    isLast = false,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    rightText?: string | null;
    isLast?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={[styles.menuItem, !isLast && styles.menuItemBorder]} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#4F46E5" style={styles.menuIcon} />
      <Text style={styles.menuText}>{text}</Text>
      {rightText && (
        <Text style={[styles.menuRightText, rightText.toLowerCase() === 'on' && styles.activeText]}>
          {rightText}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            router.push('/homePage');
          }}
        >
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back-outline" size={20} color="#4F46E5" />
          </View>
        </TouchableOpacity>


        <View style={styles.headerTop}>
        </View>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('../assets/images/default_avatar.jpg')
              }
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/profile/editProfilePicture')}
            >
              <Ionicons name="pencil" size={16} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{userData.nombre}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        <View style={styles.menuSection}>
          <MenuItem
            icon="person-outline"
            text="Editar perfil"
            onPress={() => router.push('../profile/editProfile')}
          />
          <MenuItem icon="notifications-outline" text="Notificaciones" rightText="ON" />
          <MenuItem icon="language-outline" text="Idioma" rightText="Español" isLast />
        </View>

        <View style={styles.menuSection}>
          <MenuItem
            icon="shield-checkmark-outline"
            text="Seguridad"
            onPress={() => router.push('../profile/security')}
          />
          <MenuItem icon="color-palette-outline" text="Tema" rightText="Modo Claro" />
          <MenuItem
            icon="card-outline"
            text="Gestionar Métodos de Pago" isLast
            onPress={() => router.push('../payment/paymentMethod')}
          />
        </View>

        <View style={styles.menuSection}>
          <MenuItem icon="help-circle-outline" text="Soporte" />
          <MenuItem icon="call-outline" text="Contacto" />
          <MenuItem icon="lock-closed-outline" text="Políticas de Privacidad" isLast />
        </View>
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color="#FFF" style={styles.menuIcon} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
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
    paddingBottom: 80,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 20,
    paddingTop: 10,
  },
  content: {
    flex: 1,
    marginTop: -60,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuRightText: {
    fontSize: 14,
    color: '#4F46E5',
  },
  activeText: {
    color: '#4F46E5',
    fontWeight: '600',
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  logoutSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 12,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

});

export default ProfileScreen;
