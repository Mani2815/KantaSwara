import React from 'react';
import { Metadata } from 'next';
import { Card } from '@/components/ui/Card/Card';
import { Megaphone, Send, Clock, Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Announcements | Super Admin',
  description: 'Manage platform-wide announcements and notifications',
};

export default function SuperAdminAnnouncementsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Broadcast messages and platform updates to all organizations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
            <Plus size={16} />
            New Announcement
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Megaphone className="text-orange-500" size={20} />
              <Card.Title>Active Broadcasts</Card.Title>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Currently visible announcements across tenant dashboards.
            </p>
          </Card.Header>
          <Card.Body>
            <div className="text-sm text-zinc-400">
              No active broadcasts at this time.
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Clock className="text-indigo-500" size={20} />
              <Card.Title>Scheduled</Card.Title>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Announcements queued for future publication.
            </p>
          </Card.Header>
          <Card.Body>
            <div className="text-sm text-zinc-400">
              No scheduled announcements.
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Send className="text-zinc-400" size={20} />
              <Card.Title>Past Broadcasts</Card.Title>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              History of previously sent platform updates.
            </p>
          </Card.Header>
          <Card.Body>
            <div className="text-sm text-zinc-400">
              Broadcast history is empty.
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
