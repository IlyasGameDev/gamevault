import { NextResponse } from 'next/server';
import { supabasePublishableKey } from '@/lib/supabase/publishableKey';
import { DEFAULT_OAUTH_PROVIDERS, type OAuthProviderAvailability } from '@/lib/authProviders';

export async function GET() {
  const settingsUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`
    : null;
  if (!settingsUrl || !supabasePublishableKey) {
    return NextResponse.json(DEFAULT_OAUTH_PROVIDERS);
  }

  try {
    const response = await fetch(settingsUrl, {
      headers: {
        apikey: supabasePublishableKey,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(DEFAULT_OAUTH_PROVIDERS);
    }

    const data = await response.json() as { external?: Partial<Record<string, boolean>> };
    const providers: OAuthProviderAvailability = {
      google: !!data.external?.google,
      github: !!data.external?.github,
    };

    return NextResponse.json(providers);
  } catch {
    return NextResponse.json(DEFAULT_OAUTH_PROVIDERS);
  }
}

