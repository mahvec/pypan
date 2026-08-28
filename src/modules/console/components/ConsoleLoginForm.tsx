import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { LogIn } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/shared/ui/Button";

const loginSchema = z.object({ username: z.string().trim().min(1, "Enter the shared username."), password: z.string().min(1, "Enter the shared password.") });
type LoginValues = z.infer<typeof loginSchema>;

export function ConsoleLoginForm() {
  const navigate = useNavigate();
  const login = useMutation(api.auth.login);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const handleLogin = async (values: LoginValues) => {
    try {
      const session = await login(values);
      sessionStorage.setItem("pypan-console-session", session.token);
      toast.success("Console access granted.");
      navigate("/console/dashboard");
    } catch {
      toast.error("The username or password is incorrect.");
    }
  };
  return <form className="mt-8 grid gap-5" noValidate onSubmit={handleSubmit(handleLogin)}><Field error={errors.username?.message} label="Username"><input autoComplete="username" className="w-full rounded-md border border-line bg-white px-3 py-3 outline-none focus:border-ink" {...register("username")} /></Field><Field error={errors.password?.message} label="Password"><input autoComplete="current-password" className="w-full rounded-md border border-line bg-white px-3 py-3 outline-none focus:border-ink" type="password" {...register("password")} /></Field><Button disabled={isSubmitting} type="submit">{isSubmitting ? "Signing in..." : "Sign in"}<LogIn size={18} /></Button></form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="grid gap-2 text-sm font-bold">{label}{children}{error ? <span className="text-sm font-normal text-house-red">{error}</span> : null}</label>;
}
