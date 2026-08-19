import AdminProgress from "./AdminProgress";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminProgress />
      {children}
    </>
  );
}
