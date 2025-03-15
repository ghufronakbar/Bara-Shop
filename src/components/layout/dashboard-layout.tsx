import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/material/app-sidebar";

interface Props {
  children: React.ReactNode;
  title?: string;
  childredHeader?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  childredHeader,
  title,
}: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col gap-4 w-full min-h-screen px-4 md:px-8 py-8">
        <SidebarTrigger />
        <div className="flex flex-row justify-between">
          <h1 className="text-3xl font-bold">{title}</h1>
          <div>{childredHeader}</div>
        </div>
        {children}
      </div>
    </SidebarProvider>
  );
}
