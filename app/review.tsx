import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const reviews = [
  { id: 1, stars: 5, comment: 'Excelente servicio, muy profesional.', type: 'positive' },
  { id: 2, stars: 4, comment: 'Muy buen trabajo, pero llegó un poco tarde.', type: 'positive' },
  { id: 3, stars: 3, comment: 'El trabajo fue aceptable, pero podría mejorar.', type: 'neutral' },
  { id: 4, stars: 2, comment: 'No quedé satisfecho con el servicio.', type: 'negative' },
  { id: 5, stars: 1, comment: 'Jonathan Olivares quemo mi casa intentando cambiar una ampolleta.', type: 'negative' },
];

const ReviewScreen = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('positive');

  const renderStars = (stars) => {
    const starElements = [];
    for (let i = 0; i < 5; i++) {
      starElements.push(
        <Ionicons
          key={i}
          name={i < stars ? 'star' : 'star-outline'}
          size={24}
          color="#FFD700"
        />
      );
    }
    return starElements;
  };

  const renderReview = (review) => (
    <View key={review.id} style={styles.reviewContainer}>
      <View style={styles.starsContainer}>{renderStars(review.stars)}</View>
      <Text style={styles.comment}>{review.comment}</Text>
    </View>
  );

  const filteredReviews = reviews.filter(review => review.type === selectedCategory);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Reseñas</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuButton, selectedCategory === 'positive' && styles.selectedMenuButton]}
          onPress={() => setSelectedCategory('positive')}
        >
          <Text style={styles.menuButtonText}>Positivas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuButton, selectedCategory === 'negative' && styles.selectedMenuButton]}
          onPress={() => setSelectedCategory('negative')}
        >
          <Text style={styles.menuButtonText}>Negativas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.reviewsContainer} persistentScrollbar={true}>
        {filteredReviews.map(renderReview)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 20, // Ajustar la posición para que esté por encima del título
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
    marginTop: 60, // Ajustar el margen superior para que no se superponga con el botón de volver atrás
    marginBottom: 30,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  selectedMenuButton: {
    backgroundColor: '#4F46E5',
  },
  menuButtonText: {
    fontSize: 16,
    color: 'white',
  },
  reviewsContainer: {
    marginTop: 20,
  },
  reviewContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  comment: {
    fontSize: 16,
    color: '#333',
  },
});

export default ReviewScreen;