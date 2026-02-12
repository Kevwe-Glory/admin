import { AdminSidebar } from "@/components/ui/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen className="bg-amber-900">
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset>
          <main>
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
