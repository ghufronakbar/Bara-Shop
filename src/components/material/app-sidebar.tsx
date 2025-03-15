import {
  Calendar,
  Home,
  LucideProps,
  Box,
  Info,
  User,
  Users,
  History,
  ShoppingBag,
  ShieldAlert,
  ShoppingCart,
  CircleUserRound,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { APP_NAME } from "@/constants";
import Image from "next/image";
import { LOGO } from "@/constants/image";

interface SidebarMenu {
  title: string;
  items: SidebarMenuItem[];
}

interface SidebarMenuItem {
  title: string;
  url: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
}

const SIDEBAR_MENU: SidebarMenu[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Laporan",
        url: "/report",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Master Data",
    items: [
      {
        title: "Informasi Pembayaran",
        url: "/information",
        icon: Info,
      },
      {
        title: "Produk",
        url: "/product",
        icon: Box,
      },
      {
        title: "User",
        url: "/user",
        icon: User,
      },
      {
        title: "Pelanggan",
        url: "/customer",
        icon: Users,
      },
    ],
  },
  {
    title: "Transaksi",
    items: [
      {
        title: "Penjualan",
        url: "/order",
        icon: History,
      },
      {
        title: "Pembelian",
        url: "/purchase",
        icon: ShoppingBag,
      },
      {
        title: "Kasir",
        url: "/cashier",
        icon: ShoppingCart,
      },
      {
        title: "Kerusakan Produk",
        url: "/defect",
        icon: ShieldAlert,
      },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      {
        title: "Akun",
        url: "/account",
        icon: CircleUserRound,
      },
      {
        title: "Logout",
        url: "/logout",
        icon: LogOut,
      },
    ],
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="font-bold flex flex-row items-center text-lg gap-4 ml-2 my-2">
        <Image
          src={LOGO}
          alt=""
          width={40}
          height={40}
          className="min-w-10 min-h-10 w-10 h-10 rounded-full"
        />
        {APP_NAME}
      </SidebarHeader>
      <SidebarContent>
        {SIDEBAR_MENU.map((item, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel className="font-semibold">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {item.items.map((itemChild, indexChild) => (
                <SidebarMenu key={indexChild}>
                  <SidebarMenuItem key={itemChild.title}>
                    <SidebarMenuButton asChild>
                      <Link href={itemChild.url}>
                        <itemChild.icon />
                        <span>{itemChild.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
