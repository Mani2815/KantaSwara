import React from 'react';
import { Metadata } from 'next';
import { Card } from '@/components/ui/Card/Card';
import { LifeBuoy, Mail, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support | Super Admin',
  description: 'Manage platform support tickets and requests',
};

export default function SuperAdminSupportPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Support Desk</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <LifeBuoy className="text-orange-500" size={20} />
              <Card.Title>Active Tickets</Card.Title>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              View and manage support tickets from organizations.
            </p>
          </Card.Header>
          <Card.Body>
            <div className="text-sm text-zinc-400">
              No active support tickets at this time.
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <MessageSquare className="text-indigo-500" size={20} />
              <Card.Title>Live Chat</Card.Title>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Monitor active chat sessions with platform users.
            </p>
          </Card.Header>
          <Card.Body>
            <div className="text-sm text-zinc-400">
              Live chat is currently offline.
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
