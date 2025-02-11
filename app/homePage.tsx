import React, { useState } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
  Modal,
} from "react-native"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import BottomNavigation from "components/bottomNavigation"
import { LinearGradient } from "expo-linear-gradient"
import AddRatingScreen from "../components/ratingscreen";
import { useRouter } from 'expo-router';

const { width } = Dimensions.get("window")


const categories = [
  { id: "1", name: "Electricidad", icon: "bolt", color: "#4F46E5" },
  { id: "2", name: "Limpieza", icon: "broom", color: "#10B981" },
  { id: "3", name: "Jardinería", icon: "leaf", color: "#059669" },
  { id: "4", name: "Plomería", icon: "faucet", color: "#2563EB" },
  { id: "5", name: "Carpintería", icon: "hammer", color: "#D97706" },
]

interface Professional {
  id: string
  name: string
  profession: string
  rating: number
  reviews: number
  price: string
  available: boolean
  image: string
}

const professionals = [
  {
    id: "1",
    name: "Carlos Rodríguez",
    profession: "Jardinería",
    rating: 4.8,
    reviews: 127,
    price: "$25/hr",
    available: true,
  },
  {
    id: "2",
    name: "Ana Martínez",
    profession: "Limpieza",
    rating: 4.9,
    reviews: 89,
    price: "$30/hr",
    available: true,
  },
]


export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false); 
  const router = useRouter();
  const scrollY = new Animated.Value(0);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 80],
    extrapolate: "clamp",
  });

  const renderProfessionalCard = ({ item }: { item: Professional }) => (
    <TouchableOpacity style={styles.professionalCard}>
      <Image source={{ uri: item.image }} style={styles.professionalImage} />
      <View style={styles.professionalInfo}>
        <Text style={styles.professionalName}>{item.name}</Text>
        <Text style={styles.professionText}>{item.profession}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewsText}>({item.reviews})</Text>
        </View>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
      <TouchableOpacity style={styles.contactButton}>
        <Text style={styles.contactButtonText}>Contactar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={["#4F46E5", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <Text style={styles.title}>ProFind</Text>
          <TouchableOpacity onPress={() => router.push('/review')} style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar servicios..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.bannerContainer}>
          <Image source={require("../assets/images/work.png")} style={styles.banner} />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>ENCUENTRA PROFESIONALES DE CONFIANZA</Text>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.category,
                { backgroundColor: category.color },
                selectedCategory === category.id && styles.categorySelected,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <FontAwesome5 name={category.icon} size={24} color="#FFF" />
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.professionalsSection}>
          <Text style={styles.sectionTitle}>Profesionales Destacados</Text>
          {professionals.length > 0 ? (
            <FlatList
              data={professionals}
              renderItem={renderProfessionalCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noProfessionals}>
              <Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
              <Text style={styles.noProfessionalsTitle}>No hay profesionales disponibles</Text>
              <Text style={styles.noProfessionalsText}>
                No encontramos profesionales en esta categoría por el momento
              </Text>
            </View>
          )}
        </View>
        </ScrollView>

<BottomNavigation onRatingPress={() => setIsRatingModalVisible(true)} />

<Modal
  animationType="slide"
  transparent={true}
  visible={isRatingModalVisible}
  onRequestClose={() => setIsRatingModalVisible(false)}
>
  <AddRatingScreen onClose={() => setIsRatingModalVisible(false)} />
</Modal>
</View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    justifyContent: "flex-end",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    margin: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#1F2937",
  },
  bannerContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  banner: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingLeft: 16,
    marginBottom: 24,
  },
  category: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginRight: 12,
    padding: 12,
    justifyContent: "space-between",
  },
  categorySelected: {
    transform: [{ scale: 1.05 }],
  },
  categoryName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  professionalsSection: {
    paddingBottom: 100,
  },
  professionalCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  professionalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  professionalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  professionText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#1F2937",
  },
  reviewsText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  priceText: {
    marginTop: 4,
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },
  contactButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
  },
  contactButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  noProfessionals: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  noProfessionalsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    textAlign: "center",
  },
  noProfessionalsText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
})

