import { createContext, useContext, useState } from "react";
import axios, { HttpStatusCode } from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const Client = axios.create({
  baseURL: "http://localhost:8080/api/v1/users"
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const router = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      const response = await Client.post("/register", { name, username, password });

      if (response.status === HttpStatusCode.Created) {
        return response.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await Client.post("/login", { username, password });

      if (response.status === HttpStatusCode.Ok) {
        localStorage.setItem("token", response.data.token);
        setUserData({ username });
        router("/dashboard"); // example navigation
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const value = {
    userData,
    setUserData,
    handleRegister,
    handleLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
