import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

const FAQScreen = () => {
  const router = useRouter()

  const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
    <View style={styles.faqItem}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back-outline" size={20} color="#4F46E5" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preguntas Frecuentes</Text>
      </View>
      <ScrollView style={styles.content}>
        <FAQItem
          question="¿Cómo puedo contactar a un profesional?"
          answer="Puedes buscar profesionales en la sección 'Buscar' de la app. Una vez que encuentres al profesional adecuado, puedes contactarlo directamente a través de la plataforma."
        />
        <FAQItem
          question="¿Cómo funciona el sistema de pagos?"
          answer="Los pagos se realizan de forma segura a través de nuestra plataforma. Puedes agregar tu método de pago en la sección 'Métodos de Pago' y se te cobrará automáticamente después de cada servicio."
        />
        <FAQItem
          question="¿Qué hago si tengo un problema con un profesional?"
          answer="Si tienes algún problema con un profesional, puedes reportarlo a través de la sección 'Reportar un Problema' en el menú de Soporte. Investigaremos el caso y tomaremos las medidas necesarias."
        />
        <FAQItem
          question="¿Cómo puedo cambiar mi información de perfil?"
          answer="Puedes editar tu información de perfil en la sección 'Editar Perfil' dentro del menú de tu cuenta. Allí podrás actualizar tus datos personales, foto de perfil y otra información relevante."
        />
        <FAQItem
          question="¿Cómo puedo cancelar una cita?"
          answer="Para cancelar una cita, ve a la sección 'Mis Citas' y selecciona la cita que deseas cancelar. Sigue las instrucciones para completar la cancelación. Ten en cuenta que pueden aplicarse cargos por cancelación dependiendo de la política del profesional."
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  header: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backButtonContainer: {
    backgroundColor: "#FFF",
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  faqItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
})

export default FAQScreen

