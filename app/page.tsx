import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { Code2Icon, HomeIcon, SettingsIcon, UserIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <Pg>
      <PgHeader>
        <PgTitle>Página Inicial</PgTitle>
        <PgDescription>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ratione
          dignissimos ullam vitae velit totam aut architecto. Facere adipisci
          quo illo.
        </PgDescription>
      </PgHeader>

      <PgContent>
        <div className="grid grid-cols-3 gap-4">
          <Menu />
        </div>
      </PgContent>
    </Pg>
  );
}

function Menu() {
  const menuItems = [
    {
      icon: <HomeIcon />,
      label: "Inicio",
      href: "/",
    },
    {
      icon: <UserIcon />,
      label: "Usuários",
      href: "/users",
    },
    {
      icon: <SettingsIcon />,
      label: "Configurações",
      href: "/settings",
    },
    {
      icon: <Code2Icon />,
      label: "Dev Teams",
      href: "/dev-teams",
    },
  ];

  return (
    <>
      {menuItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className="bg-secondary hover:bg-primary hover:text-primary-foreground p-2 rounded-md flex items-center gap-2"
        >
          <div className="size-6">{item.icon}</div>
          <span className="text-sm">{item.label}</span>
        </Link>
      ))}
    </>
  );
}
