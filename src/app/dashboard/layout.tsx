import { Geist } from "next/font/google";
import { Button } from "~/components/ui/button";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen w-full flex-col items-center overflow-y-scroll px-6 py-6">
  {children}
    </div>
  );
}
