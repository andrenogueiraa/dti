import { Bg } from "@/components/custom/bg";
import { Pg, PgContent, PgHeader, PgTitle } from "@/components/ui/pg";
import {
  BookIcon,
  Code2Icon,
  LayoutDashboardIcon,
  PaletteIcon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import { LinkItem, LogInLogOut } from "./client";

export default function Home() {
  return (
    <Bg>
      <Pg>
        <PgHeader className="text-center">
          <div className="flex justify-center">
            <Image src="/oflow.webp" alt="Logo" width={75} height={75} />
          </div>
          <PgTitle className="text-xl tracking-wide font-light">SCRULL</PgTitle>
        </PgHeader>

        <PgContent className="mt-8">
          <div className="grid grid-cols-3 gap-4">
            <Menu />
          </div>
        </PgContent>
      </Pg>
    </Bg>
  );
}

function Menu() {
  const menuItems = [
    {
      icon: <UserIcon />,
      label: "Usuários",
      href: "/users",
    },
    {
      icon: <LayoutDashboardIcon />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <Code2Icon />,
      label: "Dev Teams",
      href: "/dev-teams",
    },
    {
      icon: <PaletteIcon />,
      label: "Tema",
      href: "/theme",
    },
    {
      icon: <BookIcon />,
      label: "Regras",
      href: "/regras",
    },
  ];

  return (
    <>
      {menuItems.map((item, index) => (
        <LinkItem key={index} item={item} />
      ))}
      <LogInLogOut />
    </>
  );
}
