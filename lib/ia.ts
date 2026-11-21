// Connexion à KIE. La clé est lue depuis Vercel (jamais écrite dans le code).
const BASE = 'https://api.kie.ai';
const cle = () => process.env.KIE_API_KEY || '';

// Appel direct à Gemini 3.8 Flash (texte, audio, vidéo, PDF).
async function appelGemini(parts: any[], reflexion: 'low' | 'high' = 'low'): Promise<string> {
  const r = await fetch(`${BASE}/gemini/v1/models/gemini-3-8-flash:streamGenerateContent`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stream: false,
      contents: [{ role: 'user', parts }],
      generationConfig: { thinkingConfig: { thinkingLevel: reflexion } },
    }),
  });
  const j: any = await r.json();
  // KIE renvoie les erreurs avec un code différent de 200
  if (j.code && j.code !== 200) throw new Error(j.msg || 'Erreur IA');
  return (j.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('').trim();
}

// Transcrit un vocal, une vidéo, ou lit un PDF. "url" est un lien temporaire vers le fichier.
export function transcrire(consigne: string, mime: string, url: string) {
  return appelGemini([{ text: consigne }, { file_data: { mime_type: mime, file_uri: url } }]);
}

// Répond à un membre en tenant compte des consignes de l'administrateur.
export async function repondreAmi(
  question: string,
  consignes: { titre: string; contenu: string }[],
  historique: { role: string; contenu: string }[]
) {
  const regles =
    "Tu es Agence Ami, l'assistante de Flash Academy. Tu réponds en français, avec clarté et bienveillance. " +
    "Tu t'appuies sur les consignes et astuces de l'administrateur ci-dessous. " +
    "Si la question sort de ce cadre, ou demande une décision humaine (remboursement, accès, litige), " +
    "dis-le clairement et invite le membre à écrire à l'équipe. Tu ne promets rien que tu ne peux pas tenir.";
  const bloc = consignes.map((c) => `- ${c.titre} : ${c.contenu.slice(0, 4000)}`).join('\n');
  const dialogue = historique.map((m) => `${m.role === 'user' ? 'Membre' : 'Agence Ami'} : ${m.contenu}`).join('\n');
  const texte =
    `${regles}\n\nConsignes de l'administrateur :\n${bloc || '(aucune pour le moment)'}\n\n` +
    `Conversation récente :\n${dialogue || '(début)'}\n\nQuestion du membre : ${question}`;
  return appelGemini([{ text: texte }]);
}
