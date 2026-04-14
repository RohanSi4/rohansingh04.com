import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = { title: "admin" };

export default async function AdminPage() {
  if (await isAdmin()) redirect("/");
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AdminLoginForm />
    </div>
  );
}
