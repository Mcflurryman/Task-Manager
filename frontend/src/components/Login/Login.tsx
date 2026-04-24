"use client";

import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [step, setStep] = useState<"login" | "code">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3001/auth/login", {
        email,
        password,
      });

      const devCodeMessage = res.data?.devCode
        ? ` Codigo de desarrollo: ${res.data.devCode}`
        : "";
      const backendMessage =
        res.data?.message ??
        "Si el correo se envio correctamente, revisa tu bandeja de entrada.";

      setMessage(`${backendMessage}${devCodeMessage}`);
      setIsError(false);
      setStep("code");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setMessage("Email o password incorrectos.");
      } else {
        setMessage("No se pudo iniciar sesion. Intentalo de nuevo.");
      }
      setIsError(true);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3001/auth/verify-code", {
        email,
        code: securityCode,
      });

      localStorage.setItem("token", res.data.access_token);
      setMessage("Codigo correcto.");
      setIsError(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const backendMessage = error.response.data?.message;
        setMessage(
          backendMessage === "Codigo expirado"
            ? "El codigo ha caducado. Pide uno nuevo."
            : "El codigo no es valido."
        );
      } else {
        setMessage("No se pudo verificar el codigo.");
      }
      setIsError(true);
    }
  };

  return (
    <div className="login">
      {step === "login" ? (
        <form className="card" onSubmit={handleSubmit}>
          <h1 className="titleLogin">LogIn</h1>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          <button type="submit">Entrar</button>
          {message && <p className={isError ? "error" : "success"}>{message}</p>}
        </form>
      ) : (
        <form className="card" onSubmit={handleVerifyCode}>
          <h1 className="titleLogin">Codigo de seguridad</h1>

          <div>
            <label htmlFor="securityCode">Codigo</label>
            <input
              id="securityCode"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              type="text"
              required
            />
          </div>

          <button type="submit">Verificar codigo</button>
          {message && <p className={isError ? "error" : "success"}>{message}</p>}
        </form>
      )}
    </div>
  );
};

export default Login;
