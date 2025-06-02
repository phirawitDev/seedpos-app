import type { Metadata } from "next";
import "../globals.css";
import AdminSidebar from "../component/adminSidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen w-full flex flex-col shadow bg-gray-200 text-gray-800">
      <AdminSidebar />
      <div className="flex xl:ml-60 md:p-6 mt-16 z-10">{children}</div>
    </div>
  );
}
