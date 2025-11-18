import { createContext, useContext, useState, useEffect } from "react";
import axios, { HttpStatusCode } from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const Client = axios.create({
  baseURL: "http://localhost:8080/api/v1/users"
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const router = useNavigate();

  // Restore user on page load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUserData(JSON.parse(savedUser));
  }, []);

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
        const user = response.data.user; // <-- full user object from backend
        localStorage.setItem("user", JSON.stringify(user));
        setUserData(user); // <-- store full user for Dashboard
        router("/dashboard");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserData(null);
    router("/login");
  };

  const value = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
