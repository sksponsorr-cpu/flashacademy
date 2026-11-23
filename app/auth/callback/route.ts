import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Reçoit le lien envoyé par email (réinitialisation, confirmation) et ouvre la session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/espace';
  const sur = next.startsWith('/') && !next.startsWith('//') ? next : '/espace';
  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}${sur}`);
}
