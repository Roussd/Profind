import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BackButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.backButton} onPress={() => router.push('/homePage')}>
      <Ionicons name="arrow-back" size={24} color="#4F46E5" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
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
    zIndex: 10,
  },
});

export default BackButton;