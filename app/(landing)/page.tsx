import { redirect } from "next/navigation";

// La landing pública fue reemplazada: la raíz entra directo al sistema.
// El middleware redirige a /login si no hay sesión.
function page() {
  redirect("/dashboard");
}

export default page;
