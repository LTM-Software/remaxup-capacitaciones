"use client";
import React, { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import {
  jwtHandler,
  refreshTokenJWT,
} from "@/components/jwtHandler";
import { Agent, Email } from "@/types/next-auth";

interface FormValues {
  name: string;
  email: string;
  role: string;
  password: string;
  agentId?: string;
}

export type User = {
  id?: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  agentId?: string;
};

type UserManagementProps = {
  onCancel: (value: boolean) => void;
  user?: User | undefined;
  handleRefreshUsers: (user: any) => void;
};

const AGENTES_API_URL =
  process.env.NEXT_PUBLIC_REMAX_API_AGENTES_URL || "";

const api = {
  createUser: async (user: User) => {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      toast.error("Error al crear el usuario");
      throw new Error("Error al crear el usuario");
    }
    return response.json();
  },
  updateUser: async (user: User) => {
    const response = await fetch(`/api/user/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      toast.error("Error al actualizar el usuario");
      throw new Error("Error al actualizar el usuario");
    }
    return response.json();
  },
  getRemaxAgents: async () => {
    let token = localStorage.getItem("remax-token") || "";
    const { valid, expired } = await jwtHandler(token);

    if (expired || !valid) {
      try {
        const tokenToast = toast.loading(
          "Token expirado. Refrescando..."
        );
        const newToken = await refreshTokenJWT();

        newToken &&
          (token = newToken) &&
          toast.dismiss(tokenToast);
      } catch (error) {
        // Si falla el refresh, continuamos sin token o lanzamos el error
        console.error("Error al refrescar token:", error);
        // No lanzamos el error aquí, dejamos que el fetch intente con el token viejo o vacío
      }
    }

    console.log("token", token);
    try {
      const response = await fetch(AGENTES_API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener los agentes de Remax");
      }
      const data = await response.json();
      const agents = data.data;
      return agents;
    } catch (error) {
      console.error("Error al obtener agentes de Remax:", error);
      // Retornamos un array vacío en lugar de undefined para que el código pueda continuar
      return [];
    }
  },
};

export const UserManagement = ({
  onCancel,
  user,
  handleRefreshUsers,
}: UserManagementProps) => {
  const [editUser, setEditUser] = useState<User | undefined>(
    user
  );

  const formSchema = z.object({
    name: z.string().nonempty("El nombre no puede estar vacío"),
    email: z
      .string()
      .email("El email no es válido")
      .min(1, "El email no puede estar vacío"),
    role: z
      .string()
      .nonempty("El rol no puede estar vacío")
      .default("USER"),
    password: user
      ? z.string().optional()
      : z
          .string()
          .nonempty("La contraseña no puede estar vacía"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: (editUser as User)?.name,
      email: (editUser as User)?.email,
      role: (editUser as User)?.role,
      password: undefined,
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(prevState => !prevState);
  };

  const onSubmit: SubmitHandler<FormValues> = async data => {
    if (!user) {
      // si estoy creando un user, busco los agentes de remax, y busco si el email del user coincide con algun agente
      // si coincide, le asigno el id del agente a la propiedad agentId del user
      let foundAgent = null;

      try {
        const agents = await api.getRemaxAgents();
        console.log("agents", agents);
        const registrationEmail = data.email;
        console.log("data", data);
        console.log("registrationEmail", registrationEmail);

        if (agents && agents.length > 0) {
          foundAgent = agents.find((agent: Agent) =>
            agent.emails.some(
              (email: Email) =>
                email.primary === true &&
                email.value === registrationEmail
            )
          );
        }

        if (!foundAgent) {
          toast.error(
            "No se encontro el email del agente en Remax. El usuario se creará sin agentId."
          );
        }
      } catch (error) {
        console.error(
          "Error al obtener agentes de Remax:",
          error
        );
        toast.error(
          "No se pudieron obtener los agentes de Remax. El usuario se creará sin agentId."
        );
      }

      api.createUser({ ...data, agentId: foundAgent?.id }).then(
        res => {
          toast.success("Usuario creado");
          handleRefreshUsers({
            ...data,
            id: res.id,
            agentId: foundAgent?.id,
          });
        },
        err => {
          toast.error(
            "Error al crear el usuario. Intente nuevamente."
          );
          console.log("error", err);
        }
      );
    } else {
      api.updateUser({ ...data, id: user.id }).then(
        res => {
          toast.success("Usuario actualizado");
          handleRefreshUsers({
            ...data,
            id: res.id,
          });
        },
        err => {
          console.log("error", err);
        }
      );
    }
    onCancel(true);
    reset({
      name: "",
      email: "",
      role: "",
      password: "",
    });
  };

  const onCancelEdit = () => {
    setEditUser(undefined);
    reset({
      name: "",
      email: "",
      role: "",
      password: "",
    });
    onCancel(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    // @ts-ignore
    setEditUser(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="mt-4 absolute top-10 right-0 border border-solid bg-white shadow-lg rounded-md p-4 w-[400px] md:w-[700px] min-h-1/2 z-10">
      <h1 className="text-lg font-semibold mb-2">Usuario:</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input
                id="name"
                placeholder="Nombre y Apellido"
                value={(editUser as User)?.name}
                {...register("name", {
                  onChange: handleInputChange,
                })}
              />
            </FormControl>
            {errors.name && (
              <FormMessage>{errors.name.message}</FormMessage>
            )}
          </FormItem>
          <FormItem className="mt-4">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                id="email"
                placeholder="ejemplo@email.com"
                value={(editUser as User)?.email}
                {...register("email", {
                  onChange: handleInputChange,
                })}
              />
            </FormControl>
            {errors.email && (
              <FormMessage>{errors.email.message}</FormMessage>
            )}
          </FormItem>
          {/* <FormItem className="mt-4">
            <FormLabel>Id de Agente (RED Remax)</FormLabel>
            <FormControl>
              <Input
                id="agentId"
                placeholder="AR.42.170.XX"
                value={(editUser as User)?.agentId}
                {...register("agentId", {
                  onChange: handleInputChange,
                })}
              />
            </FormControl>
            {errors.agentId && (
              <FormMessage>{errors.agentId.message}</FormMessage>
            )}
          </FormItem> */}
          <FormItem className="mt-4 flex flex-col">
            <FormLabel>Rol</FormLabel>
            <FormControl>
              <select
                id="role"
                {...register("role", {
                  onChange: handleInputChange,
                })}
                value={(editUser as User)?.role}
                className="input border w-fit py-2 px-1 rounded-md"
              >
                <option value="USER">Agente</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </FormControl>
            {errors.role && (
              <FormMessage>{errors.role.message}</FormMessage>
            )}
          </FormItem>
          <FormItem className="mt-4">
            {!user ? (
              <FormLabel>Contraseña</FormLabel>
            ) : (
              <FormLabel>
                Reestablecer contraseña (ingrese la nueva si lo
                desea)
              </FormLabel>
            )}
            <div className="flex">
              <FormControl>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  {...register("password", {
                    onChange: handleInputChange,
                  })}
                />
              </FormControl>
              <button
                type="button"
                onClick={toggleShowPassword}
                className="ml-2 focus:outline-none text-right"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <FormMessage>
                {errors.password.message}
              </FormMessage>
            )}
          </FormItem>
          <div className="flex mt-4">
            <Button type="submit" className="mr-3">
              {!user ? "Crear Usuario" : "Actualizar Usuario"}
            </Button>
            <Button
              type="button"
              className="bg-slate-200 text-black"
              onClick={() => onCancelEdit()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
