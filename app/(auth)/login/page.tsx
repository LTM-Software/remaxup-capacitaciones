"use client";

import { Logo } from "@/app/(dashboard)/_components/logo";
import { useForm, SubmitHandler } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { refreshTokenJWT } from "@/components/jwtHandler";
import Link from "next/link";

const errorMessageHandler = (message: string) => {
  switch (message) {
    case "No user found":
      return "No se encontró el usuario";
    case "CredentialsSignin":
      return "Contraseña inválida";
    default:
      return "Error al iniciar sesión";
  }
};

type LoginFormInputs = {
  email: string;
  password: string;
};

const formSchema = z.object({
  email: z.string().min(1, "Ingrese un email válido"),
  password: z.string().min(1, "Ingrese una contraseña válida"),
});

const LoginPage = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(formSchema),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<
    LoginFormInputs
  > = async data => {
    setIsLoading(true);
    const res = await signIn("credentials", {
      email: data.email.trim(),
      password: data.password,
      redirect: false,
    });

    res && res.ok && (await refreshTokenJWT());

    res && !res.ok && setIsLoading(false);

    if (res?.ok) router.refresh();

    if (res && !res.ok && res.error) {
      let errorMessage = "Error desconocido";

      // Intentar analizar el error si está en formato JSON
      try {
        const errorObject = JSON.parse(res.error);
        if (errorObject && errorObject.message) {
          errorMessage = errorObject.message;
        }
      } catch (e) {
        errorMessage = res.error;
      }
      setErrorMessage(errorMessageHandler(errorMessage));
    }
  };

  return (
    // <div className="flex justify-center items-center h-screen bg-gray-100">
    //   <Form {...form}>
    //     <form
    //       onSubmit={handleSubmit(onSubmit)}
    //       className="bg-white p-12 rounded-lg shadow-lg w-2/3 md:w-1/3"
    //     >
    //       <div className="flex justify-center mb-16 mt-6">
    //         <Logo />
    //       </div>

    //       {isLoading && (
    //         <div className="flex justify-center items-center">
    //           <LoadingSpinner size="large" />
    //         </div>
    //       )}

    //       {errorMessage && (
    //         <div
    //           className="m-5 flex items-center p-4 mb-4 bg-red-100 border-t-4 border-red-500 rounded-lg shadow-md"
    //           role="alert"
    //         >
    //           <XCircle className="h-4 w-4 mr-2 text-red-800" />
    //           <span className="text-red-800 text-sm font-medium">
    //             {errorMessage}
    //           </span>
    //         </div>
    //       )}

    //       <div className="m-5">
    //         <FormItem>
    //           <FormLabel>Email</FormLabel>
    //           <FormControl>
    //             <Input
    //               placeholder="Ingrese aquí su email"
    //               {...register("email")}
    //             />
    //           </FormControl>
    //           {errors.email && (
    //             <FormMessage>{errors.email.message}</FormMessage>
    //           )}
    //         </FormItem>
    //       </div>

    //       <div className="m-5">
    //         <FormItem>
    //           <FormLabel>Contraseña</FormLabel>
    //           <FormControl>
    //             <Input
    //               placeholder="Ingrese aquí su contraseña"
    //               {...register("password")}
    //             />
    //           </FormControl>
    //           {errors.password && (
    //             <FormMessage>
    //               {errors.password.message}
    //             </FormMessage>
    //           )}
    //         </FormItem>
    //       </div>

    //       <div className="m-5">
    //         <Button
    //           type="submit"
    //           className="mt-6 w-full bg-blue-950 text-white text-lg py-3 rounded-md hover:bg-blue-700"
    //         >
    //           Iniciar sesión
    //         </Button>
    //       </div>
    //     </form>
    //   </Form>
    // </div>
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <aside className="relative block h-16 lg:order-last lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </aside>

        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl">
            <Logo />
            <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              Oficina Remax Up 🌎
            </h1>

            <p className="mt-4 leading-relaxed text-gray-500">
              Ingresá con tu usuario y contraseña para acceder a
              la oficina virtual.
            </p>

            <Form {...form}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="my-6"
              >
                <div className="col-span-6 sm:col-span-3 my-2">
                  <label
                    htmlFor="Email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {" "}
                    Email{" "}
                  </label>

                  <FormControl>
                    <Input
                      type="email"
                      id="Email"
                      // name="email"
                      className="mt-2 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                      placeholder="Ingrese aquí su email"
                      {...register("email")}
                    />
                  </FormControl>
                  {errors.email && (
                    <FormMessage className="my-2">
                      {errors.email.message}
                    </FormMessage>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="Password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {" "}
                    Contraseña{" "}
                  </label>

                  <FormControl>
                    <Input
                      type="password"
                      id="Password"
                      // name="password"
                      className="mt-2 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                      placeholder="Ingrese aquí su contraseña"
                      {...register("password")}
                    />
                  </FormControl>
                  {errors.password && (
                    <FormMessage className="my-2">
                      {errors.password.message}
                    </FormMessage>
                  )}
                </div>

                {errorMessage && (
                  <div
                    className="col-span-6 my-5 flex items-center p-4 mb-4 bg-red-100 border-t-4 border-red-500 rounded-lg shadow-md"
                    role="alert"
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-800" />
                    <span className="text-red-800 text-sm font-medium">
                      {errorMessage}
                    </span>
                  </div>
                )}

                <div className="my-6 col-span-6 sm:flex sm:items-center sm:gap-4">
                  {isLoading ? (
                    <Button disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando
                    </Button>
                  ) : (
                    <Button>Iniciar Sesión</Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </section>
  );
};

export default LoginPage;
