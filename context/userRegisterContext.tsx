import React, { createContext, useContext, useState } from "react";

interface RegisterData {
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
  service: string[];
  servicePrice: string;
}

interface RegisterContextType extends RegisterData {
  setRegisterData: (data: Partial<RegisterData>) => void;
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

export const RegisterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [registerData, setRegisterDataState] = useState<RegisterData>({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    rut: "",
    fechaNacimiento: new Date(),
    genero: "",
    telefono: "",
    profileType: "",
    imageUrl: "",
    service: [], 
    servicePrice: "",
  });

  const updateRegisterData = (data: Partial<RegisterData>) => {
    setRegisterDataState((prev) => ({ ...prev, ...data }));
  };

  return (
    <RegisterContext.Provider
      value={{
        ...registerData,          
        setRegisterData: updateRegisterData, 
      }}
    >
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegisterContext = () => {
  const context = useContext(RegisterContext);
  if (!context) {
    throw new Error("useRegisterContext debe ser usado dentro de un RegisterProvider");
  }
  return context;
};
