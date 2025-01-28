import { ExpoRoot } from "expo-router";
import { RegisterProvider } from "./context/userRegisterContext"; // Importa el contexto

export default function App() {
  const ctx = require.context("./app");
  return (
    <RegisterProvider>
      <ExpoRoot context={ctx} />
    </RegisterProvider>
  );
}
