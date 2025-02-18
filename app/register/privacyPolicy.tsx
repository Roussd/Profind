import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const PrivacyPolicyScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.title}>Políticas de Privacidad</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Última actualización: 3 de Febrero de 2025</Text>

        <Text style={styles.sectionTitle}>1. Recopilación de Información</Text>
        <Text style={styles.paragraph}>
          Recopilamos información personal que usted proporciona directamente, como su nombre, dirección de correo electrónico, número de teléfono, y detalles de pago. También recopilamos información sobre su uso de nuestros servicios, incluyendo su ubicación cuando utiliza la aplicación.
        </Text>

        <Text style={styles.sectionTitle}>2. Uso de la Información</Text>
        <Text style={styles.paragraph}>
          Utilizamos su información para proporcionar, personalizar y mejorar nuestros servicios, procesar pagos, comunicarnos con usted, y con fines de seguridad y prevención de fraudes.
        </Text>

        <Text style={styles.sectionTitle}>3. Compartir Información</Text>
        <Text style={styles.paragraph}>
          Podemos compartir su información con profesionales que prestan servicios a través de nuestra plataforma, socios de negocio, y cuando sea necesario por razones legales o de seguridad.
        </Text>

        <Text style={styles.sectionTitle}>4. Protección de Datos</Text>
        <Text style={styles.paragraph}>
          Implementamos medidas de seguridad diseñadas para proteger su información personal contra acceso no autorizado y uso indebido.
        </Text>

        <Text style={styles.sectionTitle}>5. Sus Derechos</Text>
        <Text style={styles.paragraph}>
          Usted tiene derecho a acceder, corregir o eliminar su información personal. También puede optar por no recibir comunicaciones de marketing.
        </Text>

        <Text style={styles.sectionTitle}>6. Cambios en la Política</Text>
        <Text style={styles.paragraph}>
          Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios significativos a través de la aplicación o por correo electrónico.
        </Text>

        <Text style={styles.sectionTitle}>7. Contacto</Text>
        <Text style={styles.paragraph}>
          Si tiene preguntas sobre esta política de privacidad, por favor contáctenos a través de la sección de Soporte en la aplicación.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  lastUpdated: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4F46E5",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
    marginBottom: 15,
  },
});

export default PrivacyPolicyScreen;
