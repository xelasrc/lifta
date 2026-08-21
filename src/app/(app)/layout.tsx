import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col bg-background pb-[calc(5.75rem+max(1rem,env(safe-area-inset-bottom)))]">
      {children}
      <BottomNav />
    </div>
  );
}
