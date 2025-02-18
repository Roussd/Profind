import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

const UserAgreementScreen = () => {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.title}>Acuerdo de Usuario</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>1. Aceptación de los Términos</Text>
        <Text style={styles.paragraph}>
          Al utilizar nuestra aplicación, usted acepta cumplir con estos términos y condiciones. Si no está de acuerdo
          con alguna parte de los términos, no podrá utilizar nuestros servicios.
        </Text>

        <Text style={styles.sectionTitle}>2. Descripción del Servicio</Text>
        <Text style={styles.paragraph}>
          Nuestra aplicación proporciona una plataforma para conectar a profesionales con clientes que buscan sus
          servicios. Los usuarios pueden tanto ofrecer como contratar servicios a través de la plataforma.
        </Text>

        <Text style={styles.sectionTitle}>3. Registro de Cuenta</Text>
        <Text style={styles.paragraph}>
          Para utilizar nuestros servicios, debe crear una cuenta proporcionando información precisa y completa. Usted
          es responsable de mantener la confidencialidad de su cuenta y contraseña.
        </Text>

        <Text style={styles.sectionTitle}>4. Uso del Servicio</Text>
        <Text style={styles.paragraph}>
          4.1 Como Cliente: Al contratar servicios, usted se compromete a proporcionar información precisa sobre el
          trabajo requerido, pagar puntualmente por los servicios recibidos y proporcionar un ambiente de trabajo seguro
          cuando sea aplicable.
        </Text>
        <Text style={styles.paragraph}>
          4.2 Como Profesional: Al ofrecer sus servicios, usted se compromete a proporcionar servicios de calidad,
          cumplir con los plazos acordados, mantener las calificaciones y certificaciones necesarias, y cumplir con
          todas las leyes y regulaciones aplicables.
        </Text>

        <Text style={styles.sectionTitle}>5. Tarifas y Pagos</Text>
        <Text style={styles.paragraph}>
          Nuestra plataforma cobra una comisión por cada transacción completada. Los pagos se procesan a través de
          nuestro sistema seguro. Los profesionales recibirán el pago una vez que el cliente haya confirmado la
          finalización satisfactoria del servicio.
        </Text>

        <Text style={styles.sectionTitle}>6. Cancelaciones y Reembolsos</Text>
        <Text style={styles.paragraph}>
          Las políticas de cancelación y reembolso varían según el tipo de servicio. En general, las cancelaciones deben
          realizarse con al menos 24 horas de anticipación para evitar cargos. Los reembolsos se manejarán caso por
          caso.
        </Text>

        <Text style={styles.sectionTitle}>7. Responsabilidad y Garantías</Text>
        <Text style={styles.paragraph}>
          No garantizamos la calidad, seguridad o legalidad de los servicios ofrecidos. Los usuarios utilizan la
          plataforma bajo su propio riesgo. No somos responsables de las disputas entre clientes y profesionales.
        </Text>

        <Text style={styles.sectionTitle}>8. Propiedad Intelectual</Text>
        <Text style={styles.paragraph}>
          Todo el contenido de la aplicación, incluyendo logotipos, textos e imágenes, es propiedad de nuestra empresa y
          está protegido por leyes de propiedad intelectual.
        </Text>

        <Text style={styles.sectionTitle}>9. Modificaciones del Acuerdo</Text>
        <Text style={styles.paragraph}>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor
          inmediatamente después de su publicación en la aplicación.
        </Text>

        <Text style={styles.sectionTitle}>10. Terminación</Text>
        <Text style={styles.paragraph}>
          Nos reservamos el derecho de terminar o suspender su cuenta y acceso a los servicios en cualquier momento, por
          cualquier motivo, sin previo aviso.
        </Text>

        <Text style={styles.sectionTitle}>11. Ley Aplicable</Text>
        <Text style={styles.paragraph}>
          Este acuerdo se regirá e interpretará de acuerdo con las leyes del país en el que nuestra empresa está
          registrada, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
        </Text>

        <Text style={styles.sectionTitle}>12. Contacto</Text>
        <Text style={styles.paragraph}>
          Si tiene alguna pregunta sobre este Acuerdo de Usuario, por favor contáctenos a través de [correo electrónico
          de contacto].
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

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
})

export default UserAgreementScreen

