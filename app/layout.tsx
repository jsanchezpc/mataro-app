import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

// UI Components
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button";
// APP Components 
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/theme-mode-switch";
import { BreadcrumbWithCustomSeparator } from "@/components/breadcrumb-navigation";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mataró App",
  description: "Todo lo que necesitas de Mataró, en una sola app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />

            <div className="rounded-md w-full">
              <div className="sticky top-0 z-50 bg-background border-b">
                <div className="topnavbar flex justify-between px-4 py-2">
                  <div className="flex gap-4">
                    <SidebarTrigger className="my-auto" />
                    <BreadcrumbWithCustomSeparator />
                  </div>
                  <div className="flex gap-4">
                    <ModeToggle />

                    <Link href="/login">
                      <Button className="text-slate-100">Entrar</Button>
                    </Link>

                  </div>
                </div>
              </div>

              <main>
                {children}
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
