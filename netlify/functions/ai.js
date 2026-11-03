const ok = o => ({ statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });

exports.handler = async e => {
  try {
    const b = JSON.parse(e.body || '{}');
    if (b.action === 'gemini') {
      const m = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: b.prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const j = await r.json();
      return ok({ text: j.candidates?.[0]?.content?.parts?.[0]?.text || '', error: j.error?.message });
    }
    if (b.action === 'similar') {
      const q = new URLSearchParams({ method: 'artist.getsimilar', artist: b.artist, limit: '6', api_key: process.env.LASTFM_API_KEY, format: 'json' });
      const j = await (await fetch('https://ws.audioscrobbler.com/2.0/?' + q)).json();
      return ok({ names: (j.similarartists?.artist || []).map(a => a.name), error: j.message });
    }
    return ok({ error: 'ação inválida' });
  } catch (x) {
    return ok({ error: x.message });
  }
};
