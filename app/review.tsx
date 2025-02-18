import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Importar useLocalSearchParams
import { collection, query, getDocs } from 'firebase/firestore';
import { firestore } from '../config/firebase';

interface Review {
  id: string;
  stars: number;
  comment: string;
  type: 'positive' | 'negative';
  date: string;
}

const ReviewScreen = () => {
  const router = useRouter();
  const { professionalId } = useLocalSearchParams(); // Obtener el ID del profesional
  const [selectedCategory, setSelectedCategory] = useState<'positive' | 'negative'>('positive');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener reseñas desde Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (!professionalId) return;

        // Consultar las reseñas del profesional seleccionado
        const ratingsRef = collection(firestore, 'ratings', professionalId.toString(), 'valoraciones');
        const q = query(ratingsRef);
        const snapshot = await getDocs(q);

        const reviewsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            stars: data.rating,
            comment: data.comment,
            type: data.rating >= 4 ? 'positive' : 'negative',
            date: data.createdAt.toDate().toLocaleDateString('es-ES'),
          };
        });

        setReviews(reviewsData);
      } catch (error) {
        console.error('Error obteniendo reseñas:', error);
        Alert.alert('Error', 'No se pudieron cargar las reseñas');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [professionalId]); // Dependencia: professionalId

  const renderStars = (stars: number) => {
    return [1, 2, 3, 4, 5].map((num) => (
      <Ionicons
        key={num}
        name={num <= stars ? 'star' : 'star-outline'}
        size={24}
        color="#FFD700"
      />
    ));
  };

  const renderReview = (review: Review) => (
    <View key={review.id} style={styles.reviewContainer}>
      <View style={styles.starsContainer}>{renderStars(review.stars)}</View>
      <Text style={styles.comment}>{review.comment}</Text>
      <Text style={styles.date}>{review.date}</Text>
    </View>
  );

  const filteredReviews = reviews.filter(review => review.type === selectedCategory);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

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
        {filteredReviews.length > 0 ? (
          filteredReviews.map(renderReview)
        ) : (
          <Text style={styles.noReviewsText}>No hay reseñas {selectedCategory === 'positive' ? 'positivas' : 'negativas'}.</Text>
        )}
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
    top: 20,
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
    marginTop: 60,
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
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noReviewsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});

export default ReviewScreen;