import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../../config/firebase';
import { useRouter } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import * as FileSystem from 'expo-file-system';

const EditProfilePicture = () => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const storage = getStorage();

  const pickImage = async () => {
    let permissionResult = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permisos requeridos',
          'Debes permitir acceso a la galería para cambiar tu foto de perfil.'
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image || !auth.currentUser?.uid) {
      Alert.alert('Error', 'Selecciona una imagen antes de continuar.');
      return;
    }
  
    setUploading(true);
    
    try {
      const { uri } = await FileSystem.getInfoAsync(image);
      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const buffer = Buffer.from(fileContent, 'base64');
      const uint8Array = new Uint8Array(buffer);

      const storageRef = ref(storage, `profilepicture/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, uint8Array, {
        contentType: 'image/jpeg',
      });


      const downloadURL = await getDownloadURL(storageRef);

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: downloadURL
        });
      }

      Alert.alert('Éxito', 'Foto actualizada correctamente');
      router.back();
      
    } catch (error) {
      console.error('Error completo:', error);
      Alert.alert('Error', 'Ocurrió un error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={40} color="#4F46E5" />
            <Text style={styles.placeholderText}>Seleccionar imagen</Text>
          </View>
        )}
      </TouchableOpacity>

      {uploading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <TouchableOpacity 
          style={styles.button} 
          onPress={uploadImage}
          disabled={!image}
        >
          <Text style={styles.buttonText}>Subir Foto</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#4F46E5',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfilePicture;