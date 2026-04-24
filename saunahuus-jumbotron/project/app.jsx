// Saunahuus status jumbotron
// Fixed 1920×1080 canvas, scaled to fit any viewport (TV, web, kiosk).

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "load": "gruen",
  "slideshowSeconds": 7,
  "accentHex": "#D87A7A"
} /*EDITMODE-END*/;

// ─── Data ────────────────────────────────────────────────────────────────────
const NEWS = [
{
  kicker: "Aktuelles",
  title: "Neue Entgeltordnung ab dem 01.01.2026",
  body: "Ab dem neuen Jahr gelten angepasste Tarife für Einzeleintritte und Abonnements. Die Details finden Sie an der Rezeption.",
  caption: "Saunalandschaft · Ruheraum"
},
{
  kicker: "Freibad",
  title: "Unser Freibad öffnet wieder!",
  body: "Ab dem 15. Mai dürfen Sie sich wieder auf erfrischende Bahnen im beheizten Außenbecken freuen. Öffnung täglich ab 9:00 Uhr.",
  caption: "Freibad · Außenbecken"
},
{
  kicker: "Hinweis",
  title: "Schließung der Kosmetikabteilung zum 01.01.2026",
  body: "Aus personellen Gründen entfällt unser Kosmetikangebot vorerst. Massagen und Bäder stehen wie gewohnt zur Verfügung.",
  caption: "Kosmetik · Behandlungsraum"
}];


const AUFGUSS = [
{ time: "14:00", name: "Birke & Honig", room: "Finnische Sauna", status: "past" },
{ time: "15:30", name: "Zirbe Alpenluft", room: "Bio-Sauna", status: "now" },
{ time: "17:00", name: "Eukalyptus Klassik", room: "Finnische Sauna", status: "next" },
{ time: "18:30", name: "Lavendel & Minze", room: "Dampfbad", status: "upcoming" },
{ time: "20:00", name: "Zitrus Frische", room: "Finnische Sauna", status: "upcoming" }];


const LOAD_LEVELS = {
  gruen: {
    label: "Grünes Licht",
    head: "Willkommen — kommen Sie gerne vorbei",
    body: "In unserer Sauna ist noch ausreichend Platz für weitere Gäste.",
    color: "oklch(0.62 0.14 148)",
    soft: "oklch(0.95 0.04 148)",
    ring: "oklch(0.80 0.10 148)"
  },
  gelb: {
    label: "Gelbes Licht",
    head: "Gut besucht — aber noch Plätze frei",
    body: "Die Auslastung ist erhöht. Mit etwas Geduld finden Sie jedoch einen Platz.",
    color: "oklch(0.72 0.15 78)",
    soft: "oklch(0.96 0.04 85)",
    ring: "oklch(0.85 0.10 80)"
  },
  rot: {
    label: "Rotes Licht",
    head: "Aktuell voll belegt",
    body: "Wir bitten um etwas Wartezeit. Gern benachrichtigen wir Sie, sobald wieder Platz ist.",
    color: "oklch(0.60 0.18 28)",
    soft: "oklch(0.95 0.035 28)",
    ring: "oklch(0.80 0.12 28)"
  }
};

const WEEKDAYS_DE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MONTHS_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// Scale the 1920×1080 stage to fit the viewport, letterboxed on the page bg.
function useStageScale() {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => {
      const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      setScale(s);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return scale;
}

// ─── Primitives ──────────────────────────────────────────────────────────────
const ACCENT = "var(--accent)";

function PlaceholderPhoto({ label, tone = "warm", style }) {
  // subtly-striped SVG placeholder with monospace caption
  const bg = tone === "cool" ?
  ["#E7ECEF", "#DBE2E7"] :
  tone === "wood" ?
  ["#E8DCC8", "#DECBAE"] :
  ["#EFE5DB", "#E4D6C6"];
  return (
    <div style={{
      position: "relative", overflow: "hidden", borderRadius: 2,
      background: `repeating-linear-gradient(135deg, ${bg[0]} 0 14px, ${bg[1]} 14px 28px)`,
      ...style
    }}>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "flex-end",
        padding: "18px 22px"
      }}>
        <span style={{
          fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
          fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase",
          color: "rgba(40,35,28,0.55)",
          background: "rgba(255,255,255,0.7)", padding: "4px 8px", borderRadius: 2,
          backdropFilter: "blur(2px)"
        }}>{label}</span>
      </div>
    </div>);

}

function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: 13, fontWeight: 500, letterSpacing: "0.22em",
      textTransform: "uppercase", color: "rgba(40,35,28,0.45)",
      ...style
    }}>{children}</div>);

}

// ─── Blocks ──────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "32px 64px 0"
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300, fontSize: 30, letterSpacing: "0.34em",
          color: "#2b2720"
        }}>SAUNAHUUS</div>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(40,35,28,0.45)"
        }}>Status · Aushang</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: "#4fb26b",
          boxShadow: "0 0 0 4px rgba(79,178,107,0.18)",
          animation: "pulse 2s ease-in-out infinite"
        }} />
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(40,35,28,0.55)"
        }}>Live · aktualisiert gerade eben</span>
      </div>
    </div>);

}

function ClockBlock() {
  const now = useClock();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const date = `${WEEKDAYS_DE[now.getDay()]}, ${now.getDate()}. ${MONTHS_DE[now.getMonth()]} ${now.getFullYear()}`;
  return (
    <div style={{
      gridArea: "clock",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "28px 36px",
      borderRight: "1px solid rgba(40,35,28,0.10)"
    }}>
      <SectionLabel>Uhrzeit</SectionLabel>
      <div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300, fontSize: 96, lineHeight: 0.95, letterSpacing: "-0.01em",
          color: "#2b2720", fontVariantNumeric: "tabular-nums",
          display: "flex", alignItems: "baseline", gap: 2
        }}>
          <span>{hh}</span>
          <span style={{ opacity: 0.3 }}>:</span>
          <span>{mm}</span>
          <span style={{
            fontSize: 32, color: ACCENT, marginLeft: 10, fontVariantNumeric: "tabular-nums"
          }}>:{ss}</span>
        </div>
        <div style={{
          marginTop: 10, fontFamily: "'Inter', sans-serif", fontSize: 18,
          color: "rgba(40,35,28,0.65)"
        }}>{date}</div>
      </div>
    </div>);

}

// Tiny, original weather glyphs (simple SVGs — circles, rounded shapes)
function WeatherGlyph({ kind, size = 56 }) {
  const stroke = "#2b2720";
  if (kind === "sunny") return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="11" stroke={stroke} strokeWidth="1.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = a * Math.PI / 180;
        const x1 = 32 + Math.cos(r) * 18,y1 = 32 + Math.sin(r) * 18;
        const x2 = 32 + Math.cos(r) * 26,y2 = 32 + Math.sin(r) * 26;
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />;
      })}
    </svg>);

  if (kind === "cloudy") return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="22" cy="34" r="10" stroke={stroke} strokeWidth="1.5" />
      <circle cx="36" cy="30" r="12" stroke={stroke} strokeWidth="1.5" />
      <circle cx="46" cy="36" r="8" stroke={stroke} strokeWidth="1.5" />
      <line x1="14" y1="46" x2="52" y2="46" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>);

  if (kind === "rainy") return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="26" cy="28" r="10" stroke={stroke} strokeWidth="1.5" />
      <circle cx="40" cy="24" r="12" stroke={stroke} strokeWidth="1.5" />
      <line x1="22" y1="44" x2="19" y2="52" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="44" x2="29" y2="52" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="42" y1="44" x2="39" y2="52" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>);

  return null;
}

function WeatherBlock() {
  // static "current" values — in a real install these would pull a weather API
  const temp = 14;
  const condition = "cloudy";
  const conditionDe = "Bewölkt";
  const hi = 17,lo = 9;

  return (
    <div style={{
      gridArea: "weather",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "28px 36px"
    }}>
      <SectionLabel>Draußen</SectionLabel>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 28 }}>
        <WeatherGlyph kind={condition} size={88} />
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
            fontSize: 96, lineHeight: 0.95, letterSpacing: "-0.02em",
            color: "#2b2720", fontVariantNumeric: "tabular-nums"
          }}>{temp}</span>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
            fontSize: 48, color: ACCENT, marginLeft: 4
          }}>°C</span>
        </div>
      </div>
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        fontFamily: "'Inter', sans-serif", fontSize: 16
      }}>
        <span style={{ color: "#2b2720" }}>{conditionDe}</span>
        <span style={{ color: "rgba(40,35,28,0.55)", fontVariantNumeric: "tabular-nums" }}>
          H {hi}° &nbsp;·&nbsp; T {lo}°
        </span>
      </div>
    </div>);

}

// ─── Load hero ───────────────────────────────────────────────────────────────
function TrafficLight({ active }) {
  const lights = [
  { key: "rot", color: LOAD_LEVELS.rot.color },
  { key: "gelb", color: LOAD_LEVELS.gelb.color },
  { key: "gruen", color: LOAD_LEVELS.gruen.color }];

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 14, padding: 18,
      background: "#1c1a16", borderRadius: 18,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 40px -20px rgba(0,0,0,0.35)"
    }}>
      {lights.map((l) => {
        const on = l.key === active;
        return (
          <div key={l.key} style={{
            width: 78, height: 78, borderRadius: "50%",
            background: on ? l.color : "rgba(255,255,255,0.05)",
            boxShadow: on ?
            `0 0 0 2px rgba(255,255,255,0.1) inset, 0 0 40px 6px ${l.color}, 0 0 80px 14px ${l.color}40` :
            "inset 0 2px 6px rgba(0,0,0,0.7)",
            transition: "all 0.6s ease"
          }} />);

      })}
    </div>);

}

function LoadHero({ load }) {
  const level = LOAD_LEVELS[load];
  return (
    <div style={{
      gridArea: "load",
      position: "relative",
      display: "flex", alignItems: "center", gap: 56,
      padding: "56px 72px",
      background: level.soft,
      border: `1px solid ${level.ring}`,
      borderRadius: 4,
      overflow: "hidden"
    }}>
      {/* large ambient glow tied to level */}
      <div style={{
        position: "absolute", right: -180, top: -180, width: 520, height: 520,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${level.color}22 0%, transparent 70%)`,
        pointerEvents: "none"
      }} />
      <TrafficLight active={load} />
      <div style={{ flex: 1, position: "relative" }}>
        <SectionLabel style={{ color: level.color, opacity: 0.8 }}>
          Aktuelle Auslastung Sauna
        </SectionLabel>
        <div style={{
          marginTop: 12,
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
          fontSize: 104, lineHeight: 1, letterSpacing: "-0.015em",
          color: level.color
        }}>
          {level.label}
        </div>
        <div style={{
          marginTop: 20,
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
          fontSize: 32, lineHeight: 1.25, color: "#2b2720", maxWidth: 640
        }}>
          {level.head}
        </div>
        <div style={{
          marginTop: 12,
          fontFamily: "'Inter', sans-serif", fontSize: 17, lineHeight: 1.55,
          color: "rgba(40,35,28,0.65)", maxWidth: 620
        }}>
          {level.body}
        </div>
      </div>
    </div>);

}

// ─── News slideshow ──────────────────────────────────────────────────────────
function NewsSlideshow({ seconds }) {
  const [idx, setIdx] = React.useState(0);
  const [prog, setProg] = React.useState(0);

  React.useEffect(() => {
    setProg(0);
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / (seconds * 1000));
      setProg(p);
      if (p < 1) raf = requestAnimationFrame(tick);else
      setIdx((i) => (i + 1) % NEWS.length);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, seconds]);

  const item = NEWS[idx];
  const tones = ["warm", "cool", "wood"];

  return (
    <div style={{
      gridArea: "news",
      display: "flex", flexDirection: "column",
      background: "#fff",
      border: "1px solid rgba(40,35,28,0.10)",
      borderRadius: 4,
      overflow: "hidden"
    }}>
      <div style={{
        padding: "22px 32px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(40,35,28,0.08)"
      }}>
        <SectionLabel>Was gibt's Neues?</SectionLabel>
        <div style={{ display: "flex", gap: 6 }}>
          {NEWS.map((_, i) =>
          <div key={i} style={{
            width: 28, height: 3, borderRadius: 2,
            background: i === idx ? "rgba(40,35,28,0.15)" : "rgba(40,35,28,0.07)",
            overflow: "hidden", position: "relative"
          }}>
              {i === idx &&
            <div style={{
              position: "absolute", inset: 0,
              width: `${prog * 100}%`, background: ACCENT,
              borderRadius: 2
            }} />
            }
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.15fr 1fr", minHeight: 0 }}>
        <div style={{ padding: 24 }}>
          <PlaceholderPhoto
            label={item.caption}
            tone={tones[idx % tones.length]}
            style={{ width: "100%", height: "100%" }} />
          
        </div>
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "24px 40px 24px 8px"
        }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
            letterSpacing: "0.24em", textTransform: "uppercase", color: ACCENT
          }}>{item.kicker}</div>
          <div style={{
            marginTop: 18,
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
            fontSize: 48, lineHeight: 1.1, color: ACCENT, letterSpacing: "-0.005em"
          }}>
            {item.title}
          </div>
          <div style={{
            marginTop: 22,
            fontFamily: "'Inter', sans-serif", fontSize: 17, lineHeight: 1.55,
            color: "rgba(40,35,28,0.72)", textWrap: "pretty"
          }}>
            {item.body}
          </div>
          <div style={{
            marginTop: 28, display: "flex", alignItems: "center", gap: 14,
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(40,35,28,0.45)"
          }}>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {String(idx + 1).padStart(2, "0")} / {String(NEWS.length).padStart(2, "0")}
            </span>
            <span style={{ flex: 1, height: 1, background: "rgba(40,35,28,0.12)" }} />
            <span>Mehr an der Rezeption</span>
          </div>
        </div>
      </div>
    </div>);

}

// ─── Bottom rail: Aufguss + Closing + Staff message ─────────────────────────
function AufgussBlock() {
  return (
    <div style={{
      gridArea: "aufguss",
      padding: "26px 36px",
      background: "#fff",
      border: "1px solid rgba(40,35,28,0.10)",
      borderRadius: 4,
      display: "flex", flexDirection: "column"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <SectionLabel>Aufgussplan heute</SectionLabel>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: ACCENT
        }}>Jetzt läuft</span>
      </div>
      <div style={{ marginTop: 14, flex: 1, display: "flex", flexDirection: "column" }}>
        {AUFGUSS.map((a, i) => {
          const past = a.status === "past";
          const now = a.status === "now";
          return (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "84px 1fr auto",
              alignItems: "baseline",
              padding: "10px 0",
              borderTop: i === 0 ? "none" : "1px dashed rgba(40,35,28,0.10)",
              opacity: past ? 0.38 : 1
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
                fontSize: 26, color: now ? ACCENT : "#2b2720",
                fontVariantNumeric: "tabular-nums",
                textDecoration: past ? "line-through" : "none"
              }}>{a.time}</div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 16,
                color: "#2b2720", display: "flex", alignItems: "center", gap: 12
              }}>
                {a.name}
                {now &&
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: ACCENT,
                  padding: "3px 8px", border: `1px solid ${ACCENT}`, borderRadius: 2
                }}>Läuft</span>
                }
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 13,
                letterSpacing: "0.08em", color: "rgba(40,35,28,0.5)"
              }}>{a.room}</div>
            </div>);

        })}
      </div>
    </div>);

}

function ClosingBlock() {
  const now = useClock();
  // closing time tonight
  const close = new Date(now);close.setHours(22, 0, 0, 0);
  let remaining = close - now;
  if (remaining < 0) remaining += 24 * 3600 * 1000;
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor(remaining % 3600000 / 60000);

  return (
    <div style={{
      gridArea: "closing",
      padding: "26px 32px",
      background: "oklch(0.93 0.02 312)",
      borderRadius: 4,
      display: "flex", flexDirection: "column", justifyContent: "space-between"
    }}>
      <SectionLabel>Öffnungszeiten heute</SectionLabel>
      <div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
          fontSize: 56, lineHeight: 1, color: ACCENT,
          fontVariantNumeric: "tabular-nums"
        }}>
          09:00 — 22:00
        </div>
        <div style={{
          marginTop: 14,
          fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.5,
          color: "rgba(40,35,28,0.72)"
        }}>
          Letzter Einlass um 21:00 · Saunagänge bis 21:30.
        </div>
      </div>
      <div style={{
        paddingTop: 14, borderTop: "1px solid rgba(40,35,28,0.12)",
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        fontFamily: "'Inter', sans-serif", fontSize: 13,
        letterSpacing: "0.08em", color: "rgba(40,35,28,0.6)"
      }}>
        <span>Noch geöffnet</span>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300,
          color: "#2b2720", fontVariantNumeric: "tabular-nums"
        }}>{h} Std {String(m).padStart(2, "0")} Min</span>
      </div>
    </div>);

}

function StaffMessageBlock() {
  return (
    <div style={{
      gridArea: "staff",
      padding: "28px 32px",


      borderRadius: 4,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      position: "relative", overflow: "hidden", color: "rgb(245, 237, 227)", background: "rgb(69, 12, 32)"
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(600px 200px at 100% 0%, rgba(216,122,122,0.22), transparent 60%)",
        pointerEvents: "none"
      }} />
      <SectionLabel style={{ color: "rgba(245,237,227,0.55)" }}>Gruß vom Team</SectionLabel>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
        fontSize: 30, lineHeight: 1.25, letterSpacing: "-0.005em",
        textWrap: "pretty"
      }}>
        „Nehmen Sie sich die Zeit, die Sie brauchen — und genießen Sie jeden Atemzug. Heute empfehlen wir die Birke & Honig um 14 Uhr."
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
        letterSpacing: "0.22em", textTransform: "uppercase",
        color: "rgba(245,237,227,0.55)"
      }}>
        <span style={{ width: 36, height: 1, background: "rgba(245,237,227,0.25)" }} />
        <span>Ihr Saunahuus-Team · Marlene & Johann</span>
      </div>
    </div>);

}

// ─── Stage ───────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const scale = useStageScale();

  const stageStyle = {
    width: 1920, height: 1080,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    position: "absolute", top: 0, left: 0,
    background: "#faf8f4",
    "--accent": t.accentHex
  };

  return (
    <>
      <div style={{
        position: "fixed", inset: 0, background: "#ece6dc", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          width: 1920 * scale, height: 1080 * scale, position: "relative"
        }}>
          <div data-screen-label="Saunahuus Status Jumbotron" style={stageStyle}>
            <TopBar />

            {/* Main grid */}
            <div style={{
              padding: "28px 64px 0",
              display: "grid",
              gridTemplateColumns: "1.15fr 1fr",
              gridTemplateRows: "auto 1fr",
              gridTemplateAreas: `
                "load news"
                "meta news"
              `,
              gap: 22,
              height: 640
            }}>
              <LoadHero load={t.load} />
              <div style={{
                gridArea: "meta",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateAreas: `"clock weather"`,
                background: "#fff",
                border: "1px solid rgba(40,35,28,0.10)",
                borderRadius: 4
              }}>
                <ClockBlock />
                <WeatherBlock />
              </div>
              <NewsSlideshow seconds={t.slideshowSeconds} />
            </div>

            {/* Bottom rail */}
            <div style={{
              padding: "22px 64px 36px",
              display: "grid",
              gridTemplateColumns: "1.4fr 0.85fr 1.1fr",
              gridTemplateAreas: `"aufguss closing staff"`,
              gap: 22,
              height: 300
            }}>
              <AufgussBlock />
              <ClosingBlock />
              <StaffMessageBlock />
            </div>
          </div>
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Auslastung" />
        <TweakRadio
          label="Ampelstatus"
          value={t.load}
          options={[
          { value: "gruen", label: "Grün" },
          { value: "gelb", label: "Gelb" },
          { value: "rot", label: "Rot" }]
          }
          onChange={(v) => setTweak("load", v)} />
        
        <TweakSection label="News-Slideshow" />
        <TweakSlider
          label="Dauer pro Slide"
          value={t.slideshowSeconds}
          min={3} max={20} step={1} unit=" s"
          onChange={(v) => setTweak("slideshowSeconds", v)} />
        
        <TweakSection label="Farben" />
        <TweakColor
          label="Akzent"
          value={t.accentHex}
          onChange={(v) => setTweak("accentHex", v)} />
        
      </TweaksPanel>
    </>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);