import React, { createContext, useContext, useState } from "react";

// Define la interfaz para el contexto
interface RegisterContextType {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: Date; // Cambiar a Date
  telefono: string;
  profileType: string; // Nuevo campo agregado
  imageUrl: string; // Nuevo campo agregado
  service: string; // Nuevo campo agregado
  servicePrice: string; // Nuevo campo agregado
  setRegisterData: (data: Partial<RegisterContextType>) => void;
}

// Crea el contexto
const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

// Proveedor del contexto
export const RegisterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registerData, setRegisterData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    fechaNacimiento: new Date(), // Inicializa como Date
    telefono: "",
    profileType: "", // Inicializa el nuevo campo
    imageUrl: "", // Inicializa el nuevo campo
    service: "", // Inicializa el nuevo campo
    servicePrice: "", // Inicializa el nuevo campo
  });

  const updateRegisterData = (data: Partial<RegisterContextType>) => {
    setRegisterData((prev) => ({ ...prev, ...data }));
  };

  return (
    <RegisterContext.Provider value={{ ...registerData, setRegisterData: updateRegisterData }}>
      {children}
    </RegisterContext.Provider>
  );
};

// Hook para usar el contexto fácilmente
export const useRegisterContext = () => {
  const context = useContext(RegisterContext);
  if (!context) {
    throw new Error("useRegisterContext debe ser usado dentro de un RegisterProvider");
  }
  return context;
};