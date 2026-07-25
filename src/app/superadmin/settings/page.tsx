import { Card } from "@/components/ui/Card/Card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Platform Settings | Super Admin',
  description: 'Manage global platform configurations',
};

export default function SuperAdminSettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <Card.Header>
            <Card.Title>Platform Configuration</Card.Title>
            <p className="text-sm text-zinc-500 mt-1">
              Manage global variables and system-wide settings.
            </p>
          </Card.Header>
          <Card.Body>
            <div className="text-sm text-zinc-400">
              Configuration options will be available here.
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
