"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Employee = {
  id: number;
  name: string;
  email: string;
  role: "EMPLOYEE";
  companyId: number | null;
  assignedTasks: {
    id: number;
    title: string;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
  }[];
};


const Employees = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [message, setMessage] = useState("Cargando empleados...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    const loadEmployees = async () => {
      try {
        const res = await axios.get<Employee[]>(
          "http://localhost:3001/users/employees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEmployees(res.data);
        setMessage("");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        if (axios.isAxiosError(error) && error.response?.status === 403) {
          router.push("/dashboard");
          return;
        }

        setMessage("No se pudieron cargar los empleados.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadEmployees();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <section className="dashboard">
      <header className="dashboardHeader">
        <div>
          <p className="dashboardEyebrow">Super admin</p>
          <h1>Empleados</h1>
        </div>

        <button type="button" onClick={handleLogout}>
          Cerrar sesion
        </button>
      </header>

      {message && <p className="dashboardMessage">{message}</p>}

      {!isLoading && !message && (
        <div className="employeeList">
          {employees.length === 0 ? (
            <p className="emptyColumn">Todavia no hay empleados.</p>
          ) : (
            employees.map((employee) => (
              <button
                className="employeeCard"
                key={employee.id}
                onClick={() => router.push(`/dashboard?userId=${employee.id}`)}
                type="button"
              >
                <div className="employeeAvatar" aria-hidden="true">
                  {employee.name.charAt(0).toUpperCase()}
                </div>

                <div className="employeeInfo">
                  <span>{employee.name}</span>
                  <small>{employee.email}</small>
                  <small>{employee.assignedTasks}</small>
                  
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default Employees;
