import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "DIRECTOR") {
      redirect("/portfolio");
    }
    redirect("/dashboard");
  }

  return <LoginForm />;
}
