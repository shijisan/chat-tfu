"use client";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarTrigger } from "./ui/sidebar";
import Link from "next/link";
import { UserCircle2Icon } from "lucide-react";
import { Button } from "./ui/button";

export default function Toolbar() {
  return (
    <Sidebar side="left" collapsible="none" className="w-16 h-screen border-r bg-blue-500 text-white md:flex hidden">
      <SidebarHeader className="flex items-center">
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="flex flex-col items-center mt-4 gap-4">
        <SidebarMenu className="flex flex-col gap-2">
        <SidebarMenuItem className="flex justify-center">
          <Button asChild variant="ghost" size="icon" className="rounded-md size-7">
            <Link href="/account">
              <UserCircle2Icon className="size-4" />
            </Link>
          </Button>
        </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
