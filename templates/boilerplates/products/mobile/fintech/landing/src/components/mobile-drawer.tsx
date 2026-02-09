"use client";

import { AppLogo } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { IoMenuSharp } from "react-icons/io5";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function MobileDrawer() {
  return (
    <Drawer>
      <DrawerTrigger className="text-primary">
        <IoMenuSharp className="text-2xl" />
      </DrawerTrigger>
      <DrawerContent className="bg-background border-border">
        <DrawerHeader className="px-6">
          <Link
            href="/"
            title="Trading Platform"
            className="flex items-center space-x-2"
          >
            <AppLogo size={48} />
            <span className="font-display font-bold text-xl text-primary">
              {siteConfig.name}
            </span>
          </Link>
        </DrawerHeader>

        {/* Navigation Links */}
        <nav className="px-6 py-4 space-y-2">
          {navLinks.map((link) => (
            <DrawerClose key={link.href} asChild>
              <Link
                href={link.href}
                className="flex items-center py-3 px-4 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            </DrawerClose>
          ))}
        </nav>

        <DrawerFooter className="px-6 pb-8">
          <DrawerClose asChild>
            <Link
              href="#waitlist"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "text-primary-foreground rounded-full group font-semibold neon-glow w-full"
              )}
            >
              {siteConfig.cta}
            </Link>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
