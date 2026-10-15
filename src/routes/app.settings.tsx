import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/settings")({
  component: Settings,
  head: () => ({ meta: [{ title: "Settings · ReverseHub AI" }, { name: "description", content: "Manage your account, team and preferences." }] }),
});

function Settings() {
  return (
    <DashboardShell role="buyer" breadcrumb={["Workspace", "Settings"]} title="Settings">
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <SectionCard title="Company profile">
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Company name</Label><Input className="mt-1.5" defaultValue="Acme Procurement Pvt Ltd" /></div>
              <div><Label>GSTIN</Label><Input className="mt-1.5" defaultValue="27ABCDE1234F1Z5" /></div>
              <div><Label>Contact email</Label><Input className="mt-1.5" defaultValue="aarav@acme.co" /></div>
              <div><Label>Phone</Label><Input className="mt-1.5" defaultValue="+91 98765 43210" /></div>
            </div>
            <Button className="mt-4 bg-gradient-to-r from-primary to-accent">Save changes</Button>
          </SectionCard>
        </TabsContent>
        <TabsContent value="team" className="mt-4">
          <SectionCard title="Team members"><p className="text-sm text-muted-foreground">Invite teammates to collaborate on RFQs.</p></SectionCard>
        </TabsContent>
        <TabsContent value="billing" className="mt-4">
          <SectionCard title="Billing"><p className="text-sm text-muted-foreground">Free plan · Buyers never pay.</p></SectionCard>
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <SectionCard title="Notification preferences">
            {["New quotes on my RFQs","AI risk alerts","Order status changes","Weekly analytics digest"].map(n=>(
              <div key={n} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <span className="text-sm">{n}</span>
                <Switch defaultChecked />
              </div>
            ))}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}