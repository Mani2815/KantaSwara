// =============================================================================
// API Key Management Routes
// GET  /api/v1/api-keys — List API keys for an organization
// POST /api/v1/api-keys — Generate a new API key
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  generateApiKey,
  listApiKeys,
  revokeApiKey,
} from '@server/lib/security/api-key.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const keys = await listApiKeys(organizationId);
    return NextResponse.json({ keys });
  } catch (err) {
    console.error('[API] GET /api-keys error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, name, scopes, expiresInDays } = body;

    if (!organizationId || !name) {
      return NextResponse.json(
        { error: 'organizationId and name are required' },
        { status: 400 }
      );
    }

    const result = await generateApiKey(organizationId, name, scopes, expiresInDays);

    return NextResponse.json({
      message: 'API key created. Save the key — it will not be shown again.',
      ...result,
    }, { status: 201 });
  } catch (err) {
    console.error('[API] POST /api-keys error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');
    const organizationId = searchParams.get('organizationId');

    if (!keyId || !organizationId) {
      return NextResponse.json(
        { error: 'keyId and organizationId are required' },
        { status: 400 }
      );
    }

    const success = await revokeApiKey(keyId, organizationId);
    if (!success) {
      return NextResponse.json({ error: 'Key not found or already revoked' }, { status: 404 });
    }

    return NextResponse.json({ message: 'API key revoked' });
  } catch (err) {
    console.error('[API] DELETE /api-keys error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
