import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SupportScreen = () => {
  const router = useRouter();

  const SupportItem = ({ icon, title, subtitle, onPress }: { icon: string; title: string; subtitle: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.supportItem} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={24} color="#4F46E5" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={20} color="#4F46E5" />
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Soporte</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>¿Cómo podemos ayudarte?</Text>
        
        <View style={styles.supportSection}>
          <SupportItem
            icon="help-circle-outline"
            title="Preguntas Frecuentes"
            subtitle="Encuentra respuestas rápidas a preguntas comunes"
            onPress={() => router.push('/profile/faq')}
          />
          <SupportItem
            icon="chatbubble-ellipses-outline"
            title="Chat en Vivo"
            subtitle="Habla con un agente de soporte en tiempo real" // aqui deberia mandarlo a whatsapp
            onPress={() => console.log('Iniciar chat en vivo')}
          />
          <SupportItem
            icon="mail-outline"
            title="Enviar un Correo"
            subtitle="Contáctanos por correo electrónico" // deberia abrir el correo
            onPress={() => console.log('Abrir formulario de correo')}
          />
          <SupportItem
            icon="call-outline"
            title="Llamar a Soporte"
            subtitle="Habla directamente con nuestro equipo"
            onPress={() => console.log('Iniciar llamada')}
          />
          <SupportItem
            icon="document-text-outline"
            title="Reportar un Problema"
            subtitle="Informa sobre problemas técnicos o de servicio"
            onPress={() => router.push('/profile/reportProblem')}
          />
        </View>

        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>¿Es una emergencia?</Text>
          <TouchableOpacity style={styles.emergencyButton} onPress={() => console.log('Llamada de emergencia')}>
            <Ionicons name="alert-circle-outline" size={24} color="white" />
            <Text style={styles.emergencyButtonText}>Contacto de Emergencia</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  supportSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  emergencySection: {
    marginTop: 20,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 12,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SupportScreen;
