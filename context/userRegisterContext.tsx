import React, { createContext, useContext, useState } from "react";

// Define la interfaz para el contexto
interface RegisterContextType {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: Date;
  genero: string;
  telefono: string;
  profileType: string; 
  imageUrl: string; 
  service: string; 
  servicePrice: string; 
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
    fechaNacimiento: new Date(), 
    telefono: "",
    profileType: "", 
    imageUrl: "", 
    service: "", 
    servicePrice: "", 
    genero: "",
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