import { APP_DESCRIPTION, APP_NAME } from "@/components/constants";
import AuthRouteLayout from "@/components/pages/panel/auth-route";
import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: APP_NAME || "Editor - Undangon",
  description: APP_DESCRIPTION || "Digital Invitation",
};

export default function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="rf-ui-theme">
      <AuthRouteLayout>{children}</AuthRouteLayout>
    </ThemeProvider>
  );
}
