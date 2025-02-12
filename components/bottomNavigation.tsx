import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';


interface BottomNavigationProps {
  onRatingPress?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onRatingPress }) => {
  const router = useRouter();

  const handleRatingPress = () => {
    if (onRatingPress) {
      onRatingPress();
    }
  };

  return (
    <View style={styles.navigation}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/homePage')}
      >
        <FontAwesome5 name="home" size={24} color="#4F46E5" />
        <Text style={styles.navText}>Inicio</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={handleRatingPress}>
        <FontAwesome5 name="heart" size={24} color="#E63946" />
        <Text style={styles.navText}>Favoritos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, styles.navItemCenter]}
        onPress={() => router.push('/location/savedLocations')}
      >
        <FontAwesome5 name="search" size={28} color="#FFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/professional/dashboard')}
      >
        <MaterialIcons name="message" size={24} color="#4F46E5" />
        <Text style={styles.navText}>Pedidos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/profile')}
      >
        <FontAwesome5 name="user" size={24} color="#4F46E5" />
        <Text style={styles.navText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
  },
  navItemCenter: {
    backgroundColor: '#4F46E5',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  navText: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BottomNavigation;
