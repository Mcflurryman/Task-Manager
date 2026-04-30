"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
};

const statusLabels: Record<Task["status"], string> = {
  TODO: "Pendiente",
  IN_PROGRESS: "En progreso",
  DONE: "Completada",
};

const priorityLabels: Record<Task["priority"], string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

const boardColumns: Array<{ status: Task["status"]; title: string }> = [
  { status: "TODO", title: "Pendientes" },
  { status: "IN_PROGRESS", title: "En progreso" },
  { status: "DONE", title: "Completadas" },
];

const Dashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams?.get("userId");
  const selectedUserName = searchParams?.get("userName");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState("Cargando tareas...");
  const [isLoading, setIsLoading] = useState(true);
  const dashboardTitle = selectedUserId
    ? selectedUserName
      ? `Dashboard de ${selectedUserName}`
      : "Dashboard del empleado"
    : "Dashboard";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    const loadTasks = async () => {
      try {
        const tasksUrl = selectedUserId
          ? `http://localhost:3001/tasks/user/${selectedUserId}`
          : "http://localhost:3001/tasks";

        const res = await axios.get<Task[]>(tasksUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTasks(res.data);
        setMessage("");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        setMessage("No se pudieron cargar las tareas.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadTasks();
  }, [router, selectedUserId]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await axios.post(
          "http://localhost:3001/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch {
        setMessage("No se pudo cerrar sesion en el servidor.");
      }
    }

    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <section className="dashboard">
      <header className="dashboardHeader">
        <div>
          <p className="dashboardEyebrow">Task Manager</p>
          <h1>{dashboardTitle}</h1>
        </div>

        <div className="dashboardActions">
          {selectedUserId && (
            <button type="button" onClick={() => router.push("/employees")}>
              Empleados
            </button>
          )}

          <button type="button" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </header>

      {message && <p className="dashboardMessage">{message}</p>}

      {!isLoading && (
        <div className="trelloBoard">
          {boardColumns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.status
            );

            return (
              <section className="trelloColumn" key={column.status}>
                <header className="trelloColumnHeader">
                  <h2>{column.title}</h2>
                  <span>{columnTasks.length}</span>
                </header>

                <div className="trelloColumnBody">
                  {columnTasks.length === 0 ? (
                    <p className="emptyColumn">
                      Todavia no hay tareas para mostrar.
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <article className="taskCard" key={task.id}>
                        <div className="taskCardHeader">
                          <h3>{task.title}</h3>
                          <span className={`priority priority-${task.priority}`}>
                            {priorityLabels[task.priority]}
                          </span>
                        </div>

                        {task.description && <p>{task.description}</p>}

                        <div className="taskMeta">
                          <span>{statusLabels[task.status]}</span>
                          {task.dueDate && (
                            <span>
                              {new Date(task.dueDate).toLocaleDateString(
                                "es-ES"
                              )}
                            </span>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Dashboard;
