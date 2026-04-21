"use client";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setMessage("No valid");
		setIsError(true);
        return;
      }

      const data = await res.json();
      console.log(data);
      setMessage("If email was correct, check your inbox gmail and type the SecurityCode");
	  setIsError(false);
    } catch {
      setMessage("No se pudo conectar con el backend (http://localhost:3001).");
    }
  };

  return (
	

    <div className={"login"} >
      <form className={"card"} onSubmit={handleSubmit}>
		<h1 className={"titleLogin"}>LogIn</h1>
		<div><label htmlFor="email">Email</label>
        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
		</div>
		<div><label htmlFor="password">Password</label>
        <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
		</div>
        <button type="submit">Entrar</button>
        {message && <p className={isError ? "error" : "success"}>{message}</p>}
      </form>
    </div>
  );
};

export default Login;
