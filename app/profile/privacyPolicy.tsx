import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicyScreen = () => {
  const router = useRouter();

  const PolicySection = ({ title, content }: { title: string; content: string }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back-outline" size={20} color="#4F46E5" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Políticas de Privacidad</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Última actualización: 3 de Febrero de 2025</Text>
        
        <PolicySection
          title="1. Recopilación de Información"
          content="Recopilamos información personal que usted proporciona directamente, como su nombre, dirección de correo electrónico, número de teléfono, y detalles de pago. También recopilamos información sobre su uso de nuestros servicios, incluyendo su ubicación cuando utiliza la aplicación."
        />
        
        <PolicySection
          title="2. Uso de la Información"
          content="Utilizamos su información para proporcionar, personalizar y mejorar nuestros servicios, procesar pagos, comunicarnos con usted, y con fines de seguridad y prevención de fraudes."
        />
        
        <PolicySection
          title="3. Compartir Información"
          content="Podemos compartir su información con profesionales que prestan servicios a través de nuestra plataforma, socios de negocio, y cuando sea necesario por razones legales o de seguridad."
        />
        
        <PolicySection
          title="4. Protección de Datos"
          content="Implementamos medidas de seguridad diseñadas para proteger su información personal contra acceso no autorizado y uso indebido."
        />
        
        <PolicySection
          title="5. Sus Derechos"
          content="Usted tiene derecho a acceder, corregir o eliminar su información personal. También puede optar por no recibir comunicaciones de marketing."
        />
        
        <PolicySection
          title="6. Cambios en la Política"
          content="Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios significativos a través de la aplicación o por correo electrónico."
        />
        
        <PolicySection
          title="7. Contacto"
          content="Si tiene preguntas sobre esta política de privacidad, por favor contáctenos a través de la sección de Soporte en la aplicación."
        />
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
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
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
  content: {
    flex: 1,
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default PrivacyPolicyScreen;
