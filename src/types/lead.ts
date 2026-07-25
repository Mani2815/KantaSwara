import type { LeadStatus } from '@/constants/status';

/** Lead entity */
export interface Lead {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  source: 'call' | 'manual' | 'import' | 'api';
  status: LeadStatus;
  score: number | null;
  assignedTo: string | null;
  notes: string;
  callIds: string[];
  tags: string[];
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Lead list item (lightweight) */
export interface LeadListItem {
  id: string;
  name: string;
  phone: string;
  company: string | null;
  status: LeadStatus;
  source: string;
  score: number | null;
  lastContactedAt: string | null;
  createdAt: string;
}
