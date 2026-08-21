import { BottomNav } from "@/components/bottom-nav";
import { SyncManager } from "@/components/sync-manager";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col bg-background pb-24">
      {children}
      <BottomNav />
      <SyncManager />
    </div>
  );
}
