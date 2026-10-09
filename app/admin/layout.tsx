import AdminProgress from "./AdminProgress";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-admin-layout>
      <AdminProgress />
      {children}
    </div>
  );
}
