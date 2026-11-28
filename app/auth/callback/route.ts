import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';

// Reçoit les liens des emails (réinitialisation, confirmation) et ouvre la session.
// Gère le format « code » (PKCE) et le format « token_hash ».
const sur = (v: string | null) => (v && v.startsWith('/') && !v.startsWith('//') ? v : null);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  // Par défaut, une réinitialisation de mot de passe va à la page de nouveau mot de passe.
  const next = sur(searchParams.get('next')) || (type === 'recovery' ? '/connexion/nouveau-mot-de-passe' : '/espace');

  const reponse = NextResponse.redirect(new URL(next, origin));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) =>
          list.forEach(({ name, value, options }) => reponse.cookies.set(name, value, options)),
      },
    }
  );

  let error: unknown = null;
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else {
    error = true;
  }

  if (error) {
    return NextResponse.redirect(new URL('/connexion/mot-de-passe-oublie?erreur=lien', origin));
  }
  return reponse;
}
