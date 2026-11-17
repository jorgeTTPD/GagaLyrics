# GagaLyrics

Lyric video del primer coro de **“Million Reasons” — Lady Gaga**, renderizado con **Remotion 4**:
imagen fija con Ken Burns, tipografía cinéfila (Bodoni Moda + Playfair Display + Jost, SIL Open Font License),
karaoke palabra por palabra sincronizado con **WhisperX** (alineación forzada) y flash dorado en los dos
“hooks” del coro.

## Segmento de la canción

| Dato | Valor |
|---|---|
| Canción | “Million Reasons” — *Joanne* (2016) |
| Corte | 44.5 s → 72.0 s (primer coro: “I bow down to pray … one good one to stay”) |
| Canvas | 2528×1696 (3:2, nativo de la ilustración ×2) @ 30 fps |
| Duración | 27.5 s (825 frames) |

## Assets que NO están en el repo

Por copyright y por ser material de terceros, este repo **no incluye**:

1. **La imagen** (`public/singer.jpg`) — ilustración IA de Lady Gaga; colócala tú en `public/singer.jpg`
   (2528×1696 o superior, mismo encuadre: cantante a la izquierda, espacio vacío a la derecha).
   Opcional: escalado 2× Lanczos desde el original:
   `ffmpeg -i original.jpg -vf "scale=2528:1696:flags=lanczos" public/singer.jpg`
2. **El audio** (`public/audio/chorus.mp3`) — recorta tu FLAC/MP3 local:
   ```bash
   ffmpeg -ss 44.5 -to 72.0 -i "Lady Gaga - Million Reasons.flac" \
     -af "afade=t=in:st=0:d=0.4,afade=t=out:st=25.6:d=1.5,loudnorm=I=-14:TP=-1.5:LRA=11" \
     -codec:a libmp3lame -b:a 192k public/audio/chorus.mp3
   ```

Las fuentes en `public/fonts/` sí están incluidas (SIL Open Font License).

## Setup

```bash
npm install
npm run types   # tsc --noEmit
npm run dev     # Remotion Studio → http://localhost:3000
npm run render  # out/million-reasons.mp4 (h264, CRF 17)
```

## Sincronía lírica (`src/lyrics.json`)

Tiempos en **segundos de video** (= canción − 44.5 s). Flujo usado:

1. ASR con `medium.en` sobre la canción completa para acotar la zona del coro.
2. Alineación forzada (`whisperx.align`) pasando la letra EXACTA de Genius como `segments`,
   con anchors iniciales de un LRC cacheado — corrige un desfase sistemático de ~1 s del caché.
3. `align.py` contiene el script completo (requiere venv con `whisperx`, `NLTK_DATA` del venv).
   `full_probe.py` transcribe la canción completa como verificación cruzada.
4. El usuario es la autoridad final sobre el texto de la letra.

## Diseño

- **Escena** (`src/MillionReasons.tsx`): imagen full-bleed (Ken Burns lento), capa de legibilidad
  (gradiente lateral burdeos), grano de film SVG, viñeta, motas de polvo + chispas doradas
  deterministas (seed fija).
- **Letras**: reel tipo teleprompter (activa al centro, anterior sale arriba con blur, siguiente
  anticipa desde abajo muy atenuada). Palabra cantada → relleno degradado oro + glow;
  palabra actual → bump de escala; pendiente → crema al 30 %. LEAD de 0.1 s.
- **Flash dorado** (pantalla, `mix-blend-mode: screen`) en 15.17 s y 22.13 s.
- **Fade** global a/desde negro en los extremos; la barra de progreso inferior es oro.

## Licencia

MIT para el código. La canción y la imagen NO están incluidas ni licenciadas por este repo.
