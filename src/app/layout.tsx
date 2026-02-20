import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/store/sidebar-store";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GAP — Global Admissions Platform",
  description:
    "Pakistan-first, global-ready admissions marketplace connecting students with institutions worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              <Navbar />
              {children}
              <Toaster position="top-right" richColors />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
