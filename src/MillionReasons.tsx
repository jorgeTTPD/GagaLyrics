import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import lyricsJson from './lyrics.json';

type Word = {w: string; start: number; end: number};
type Line = {text: string; start: number; end: number; words: Word[]};
const LINES = lyricsJson as unknown as Line[];

const FPS = 30;
const DURATION = 27.5;
const LEAD = 0.1;

const GOLD_GRADIENT =
  'linear-gradient(165deg,#ffedb5 0%,#ffc86b 38%,#ff9d3c 70%,#d97a26 100%)';
const CREAM = '#f7ecd9';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const smooth = (v: number) => v * v * (3 - 2 * v);

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20261116);
const MOTES = Array.from({length: 40}, () => ({
  x: rnd() * 2528,
  y: 380 + rnd() * 1280,
  r: 0.9 + rnd() * 2.4,
  phase: rnd() * Math.PI * 2,
  speed: 0.2 + rnd() * 0.48,
  tw: 1.1 + rnd() * 2.0,
  sway: 9 + rnd() * 22,
  gold: rnd() < 0.3,
}));

const NOISE_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E";

const FontStyles: React.FC = () => {
  const faces = [
    `@font-face{font-family:'Bodoni Moda';font-weight:600 900;font-display:swap;src:url('${staticFile('fonts/BodoniModa-normal-latin-aFT67PxzY382.woff2')}') format('woff2')}`,
    `@font-face{font-family:'Bodoni Moda';font-weight:600 900;font-display:swap;unicode-range:U+0100-02BA;src:url('${staticFile('fonts/BodoniModa-normal-latin-ext-aFT67PxzY382.woff2')}') format('woff2')}`,
    `@font-face{font-family:'Playfair Display';font-weight:400 800;font-display:swap;src:url('${staticFile('fonts/PlayfairDisplay-normal-latin-nuFcD-vYSZvi.woff2')}') format('woff2')}`,
    `@font-face{font-family:'Playfair Display';font-weight:400 800;font-display:swap;unicode-range:U+0100-02BA;src:url('${staticFile('fonts/PlayfairDisplay-normal-latin-ext-nuFcD-vYSZvi.woff2')}') format('woff2')}`,
    `@font-face{font-family:'Playfair Display';font-style:italic;font-weight:400 700;font-display:swap;src:url('${staticFile('fonts/PlayfairDisplay-italic-latin-nuFeD-vYSZvi.woff2')}') format('woff2')}`,
    `@font-face{font-family:'Jost';font-weight:300 500;font-display:swap;src:url('${staticFile('fonts/Jost-normal-latin-92z8tBhPNqw7.woff2')}') format('woff2')}`,
  ].join('\n');
  return <style dangerouslySetInnerHTML={{__html: faces}} />;
};

const LYRIC_FONT_SIZE = 56;
const SLOT_GAP = 96;
const LAST_END = Math.max(...LINES.map((l) => l.end));

const PulsingFlash: React.FC<{t: number; at: number}> = ({t, at}) => {
  const d = t - at;
  if (d < 0 || d > 2.2) return null;
  const op = Math.exp(-d * 3.1) * 0.34;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(58% 52% at 68% 52%, rgba(255,219,140,${op}) 0%, rgba(255,158,64,${op * 0.42}) 45%, transparent 78%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
};

export const MillionReasons: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / FPS;
  const ktime = t + LEAD;

  const kenBurns = smooth(range(t, 0, DURATION));
  const imgScale = 1.04 + 0.055 * kenBurns;
  const imgX = -34 * kenBurns;

  const fadeIn = range(t, 0, 0.6);
  const fadeOut = 1 - range(t, 27.25, DURATION);
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const frameStart = LAST_END + 0.05;
  const haloP = smooth(range(t, frameStart, frameStart + 1.35));
  const stampP = smooth(range(t, frameStart + 0.4, frameStart + 1.0));
  const postPulse =
    t > LAST_END ? Math.exp(-(t - LAST_END) * 2.4) : 0;
  const breath =
    t > LAST_END
      ? 1 + 0.012 * Math.sin(clamp01((t - LAST_END) / 1.1) * Math.PI)
      : 1;

  const grainOpacity = 0.05 + 0.022 * Math.sin(frame * 1.7) * Math.sin(frame * 0.7 + 1.3);

  const progress = clamp01(t / DURATION);

  return (
    <AbsoluteFill style={{backgroundColor: '#120409'}}>
      <FontStyles />

      {/* === Base image with Ken Burns === */}
      <AbsoluteFill
        style={{
          transform: `scale(${imgScale}) translateX(${imgX}px)`,
          transformOrigin: '30% 46%',
        }}
      >
        <Img
          src={staticFile('singer.jpg')}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </AbsoluteFill>

      {/* === Legibility gradients + vignette === */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg, rgba(10,2,6,0) 0%, rgba(10,2,6,0.12) 30%, rgba(13,3,8,0.52) 52%, rgba(12,3,8,0.74) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(125% 95% at 32% 44%, transparent 42%, rgba(9,1,5,0.5) 78%, rgba(5,0,2,0.82) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(0deg, rgba(6,0,3,0.55) 0%, transparent 22%)',
        }}
      />

      {/* === Golden flashes on the two hook lines === */}
      <PulsingFlash t={t} at={15.17} />
      <PulsingFlash t={t} at={22.13} />

      {/* === Completion halo: warm light bloom behind the finished verse === */}
      {haloP > 0.001 && (
        <AbsoluteFill
          style={{
            opacity: haloP * 0.5,
            background:
              'radial-gradient(64% 58% at 68% 53%, rgba(255,208,124,0.36) 0%, rgba(233,162,72,0.17) 40%, transparent 76%)',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* === Dust motes / gold sparks === */}
      {MOTES.map((m, i) => {
        const y = m.y - frame * m.speed;
        const x = m.x + Math.sin(frame * 0.013 + m.phase) * m.sway;
        const twinkle = Math.pow(
          0.5 + 0.5 * Math.sin(frame * 0.055 * m.tw + m.phase),
          2
        );
        const opacity = 0.1 + 0.48 * twinkle;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: m.r * 2,
              height: m.r * 2,
              borderRadius: '50%',
              background: m.gold ? 'rgb(255,214,140)' : 'rgb(255,246,228)',
              opacity,
              boxShadow: m.gold
                ? `0 0 ${m.r * 6}px rgba(255,196,110,0.9)`
                : `0 0 ${m.r * 5}px rgba(255,250,235,0.8)`,
            }}
          />
        );
      })}

      {/* === Film grain === */}
      <AbsoluteFill
        style={{
          backgroundImage: `url("${NOISE_URI}")`,
          backgroundSize: '260px 260px',
          opacity: grainOpacity,
          mixBlendMode: 'overlay',
        }}
      />

      {/* ============ RIGHT PANEL ============ */}
      <div
        style={{
          position: 'absolute',
          left: 1015,
          right: 160,
          top: 0,
          bottom: 0,
        }}
      >
        {/* ---- Title block ---- */}
        <div
          style={{
            position: 'absolute',
            top: 132,
            left: 0,
            right: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 500,
              fontSize: 27,
              letterSpacing: '0.62em',
              color: '#e6c48c',
              opacity: 0.95,
              marginBottom: 30,
              paddingLeft: 6,
            }}
          >
            LADY&nbsp;&nbsp;GAGA
          </div>
          <div
            style={{
              fontFamily: "'Bodoni Moda', serif",
              fontWeight: 800,
              fontSize: 138,
              lineHeight: 0.98,
              letterSpacing: '0.015em',
              backgroundImage:
                'linear-gradient(172deg,#fdf6e3 0%,#f3d9a4 30%,#cfa15a 52%,#8f6a34 72%,#e9cda0 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 60px rgba(255,214,140,0.18)',
            }}
          >
            MILLION
            <br />
            REASONS
          </div>
          <div
            style={{
              marginTop: 34,
              width: 380,
              height: 2,
              background:
                'linear-gradient(90deg,#e9c884 0%,#b98a4e 55%,transparent 100%)',
            }}
          />
          <div
            style={{
              marginTop: 4,
              width: 190,
              height: 1,
              background:
                'linear-gradient(90deg,rgba(233,200,132,0.65) 0%,transparent 100%)',
            }}
          />
        </div>

        {/* ---- Lyrics (postcard stack) ---- */}
        <div
          style={{
            position: 'absolute',
            top: 620,
            left: 0,
            right: 0,
            height: 580,
            filter:
              postPulse > 0.01
                ? `drop-shadow(0 0 ${26 * postPulse}px rgba(255,205,110,${0.8 * postPulse}))`
                : 'none',
            transform: `scale(${breath})`,
            transformOrigin: '50% 55%',
          }}
        >
          {LINES.map((line, li) => {
            const start = line.start;

            const inP = smooth(range(ktime, start - 0.42, start + 0.05));
            const slotOffset = (1 - inP) * 150;
            const opacity = inP;

            if (opacity <= 0.004) return null;

            const slotY = (li - (LINES.length - 1) / 2) * SLOT_GAP;

            return (
              <div
                key={li}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: `calc(50% + ${slotY + slotOffset}px)`,
                  width: '100%',
                  opacity,
                  transform: `translateY(-50%) scale(${0.965 + 0.035 * inP})`,
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 600,
                  fontSize: LYRIC_FONT_SIZE,
                  lineHeight: 1.22,
                  letterSpacing: '0.008em',
                  color: CREAM,
                }}
              >
                {line.words.map((w, wi) => {
                  const sung = ktime >= w.end;
                  const current = ktime >= w.start && ktime < w.end;
                  const lit = sung || current;
                  const bump = Math.exp(
                    -Math.pow(ktime - (w.start + 0.16), 2) / (2 * 0.115 * 0.115)
                  );
                  const wScale = 1 + 0.07 * bump;
                  const wordStyle: React.CSSProperties = {
                    display: 'inline-block',
                    marginRight: '0.44em',
                    transform: `scale(${wScale})`,
                    transformOrigin: '50% 62%',
                    ...(lit
                      ? {
                          backgroundImage: GOLD_GRADIENT,
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          color: 'transparent',
                          textShadow: current
                            ? `0 0 24px rgba(255,206,116,${0.5 + 0.45 * bump}), 0 0 64px rgba(255,152,54,${0.4 * bump})`
                            : `0 0 ${15 + 22 * postPulse}px rgba(255,192,96,${0.32 + 0.45 * postPulse})`,
                        }
                      : {
                          color: 'rgba(247,236,217,0.30)',
                        }),
                  };
                  return (
                    <span key={wi} style={wordStyle}>
                      {w.w}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ---- Progress hairline + credit ---- */}
        <div
          style={{
            position: 'absolute',
            bottom: 92,
            left: 0,
            right: 0,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 2,
              background: 'rgba(247,236,217,0.14)',
              overflow: 'hidden',
              borderRadius: 2,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progress * 100}%`,
                background:
                  'linear-gradient(90deg,#8a5a28 0%,#e9c884 45%,#ffe9b0 100%)',
                boxShadow: '0 0 14px rgba(255,214,140,0.55)',
              }}
            />
          </div>
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: 17,
              letterSpacing: '0.38em',
              color: '#d8c096',
              opacity: 0.6,
            }}
          >
            <span>MILLION&nbsp;&nbsp;REASONS</span>
            <span>LADY&nbsp;&nbsp;GAGA&nbsp;&nbsp;·&nbsp;&nbsp;MMXVI</span>
          </div>
        </div>
      </div>

      {/* === Postage stamp seal (top-right) === */}
      {stampP > 0.001 && (
        <div
          style={{
            position: 'absolute',
            left: 2212,
            top: 647,
            width: 158,
            height: 188,
            opacity: stampP * 0.94,
            transform: `rotate(-3deg) scale(${0.82 + 0.18 * stampP})`,
            transformOrigin: '50% 50%',
            border: '1.6px solid rgba(230,196,140,0.9)',
            boxShadow: '0 0 26px rgba(230,196,140,0.28), inset 0 0 18px rgba(230,196,140,0.14)',
            background: 'rgba(18,5,9,0.62)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 10px',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              border: '1px dashed rgba(230,196,140,0.55)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 400,
                fontSize: 12,
                letterSpacing: '0.4em',
                color: '#cbb27f',
                paddingLeft: '0.4em',
              }}
            >
              JOANNE
            </div>
            <div
              style={{
                fontFamily: "'Bodoni Moda', serif",
                fontWeight: 800,
                fontSize: 29,
                lineHeight: 1.08,
                textAlign: 'center',
                backgroundImage:
                  'linear-gradient(172deg,#fdf6e3 0%,#e9cda0 45%,#a9834e 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              MILLION
              <br />
              REASONS
            </div>
            <div
              style={{
                width: 56,
                height: 1,
                background: 'linear-gradient(90deg,transparent,#e6c48c,transparent)',
              }}
            />
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                fontSize: 12,
                letterSpacing: '0.32em',
                color: '#e6c48c',
                paddingLeft: '0.32em',
              }}
            >
              MMXVI
            </div>
          </div>
        </div>
      )}

      {/* === Global fade === */}
      <AbsoluteFill
        style={{
          backgroundColor: '#000',
          opacity: 1 - masterOpacity,
          pointerEvents: 'none',
        }}
      />

      <Audio src={staticFile('audio/chorus.mp3')} />
    </AbsoluteFill>
  );
};
