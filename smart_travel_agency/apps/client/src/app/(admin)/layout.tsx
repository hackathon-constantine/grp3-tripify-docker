import AdminRoute from '@/components/auth/AdminRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      {/* Your admin layout */}
      {children}
    </AdminRoute>
  );
}