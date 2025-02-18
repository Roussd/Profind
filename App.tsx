import { ExpoRoot } from "expo-router";
import { RegisterProvider } from "./context/userRegisterContext";

export default function App() {
  // @ts-ignore
  const ctx = require.context("./app");
  return (
    <RegisterProvider>
        <ExpoRoot context={ctx} />
    </RegisterProvider>
  );
}

// se ignora el error de context, ya que no se puede importar el contexto de la forma tradicional
// este error aparece porque require.context no forma parte de la API estándar de node ni de typeScript