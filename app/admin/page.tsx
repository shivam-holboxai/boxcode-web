import { redirect } from "next/navigation";
import { auth, isAdminEmail } from "@/lib/auth";
import AdminPage from "./admin-client";

export const metadata = { title: "Admin" };

export default async function AdminRoute() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/admin");
  }
  if (!isAdminEmail(session.user.email)) {
    redirect("/account");
  }
  return <AdminPage />;
}
