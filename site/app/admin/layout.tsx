import AdminShell from "@/components/AdminShell";
export const metadata = { title: "Админ-панель: МойДом.BY" };
export default function L({ children }: { children: React.ReactNode }) { return <AdminShell>{children}</AdminShell>; }
