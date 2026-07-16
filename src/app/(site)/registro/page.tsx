import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-20 text-center text-muted">
          Cargando...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
