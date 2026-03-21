import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Design tokens (mirrors App.jsx) ──────────────────────────────────────────
const C = {
  azure:       "#C4A882",
  azureDeep:   "#A8896A",
  azureDark:   "#1C2B3A",
  cerulean:    "#1C2B3A",
  sand:        "#F0E8DC",
  sandDeep:    "#E8DDD0",
  sandBorder:  "#D4C4B0",
  seafoam:     "#FAF7F2",
  seafoamDeep: "#F0E8DC",
  white:       "#FFFFFF",
  tide:        "#E8DDD0",
  tideDeep:    "#D4C4B0",
  slate:       "#1C2B3A",
  slateMid:    "#3D2B1F",
  slateLight:  "#6B4F3A",
  muted:       "#A89080",
  mutedLight:  "#C4AFA0",
  green:       "#7A9E5A",
  greenBg:     "#EEF5E8",
  amber:       "#C1692A",
  amberBg:     "#FDF0E6",
  red:         "#B03A2E",
  redBg:       "#FDECEA",
  cta:         "#C4A882",
  ctaText:     "#1C2B3A",
  ctaHover:    "#A8896A",
};

const catConfig = {
  airfare:     { label: "✈️ Airfare",      color: C.azureDeep  },
  hotels:      { label: "🏨 Hotels",       color: C.cerulean   },
  restaurants: { label: "🍽️ Restaurants", color: C.red        },
  bars:        { label: "🍸 Bars",         color: C.amber      },
  activities:  { label: "🎯 Activities",   color: C.green      },
};

const typeStyles = {
  hotel:      { bg: C.seafoamDeep, color: C.cerulean,  icon: "🏨" },
  restaurant: { bg: C.redBg,       color: C.red,        icon: "🍽️" },
  bar:        { bg: C.amberBg,     color: C.amber,      icon: "🍸" },
  activity:   { bg: C.greenBg,     color: C.green,      icon: "🎯" },
  transport:  { bg: "#E8F0FA",     color: C.azureDeep,  icon: "🚗" },
};

const REGION_GRADIENTS = {
  "Asia":           "linear-gradient(135deg, #C84B31 0%, #ECAB51 100%)",
  "Europe":         "linear-gradient(135deg, #2C3E7A 0%, #5B7FBF 100%)",
  "North America":  "linear-gradient(135deg, #1A6B3C 0%, #4CAF7D 100%)",
  "Central America":"linear-gradient(135deg, #7B3FA0 0%, #C47DD4 100%)",
  "South America":  "linear-gradient(135deg, #B5451B 0%, #E8903A 100%)",
  "Africa":         "linear-gradient(135deg, #8B6914 0%, #D4A843 100%)",
  "Oceania":        "linear-gradient(135deg, #0E6B8C 0%, #2EBFDB 100%)",
};

// ── DailyItinerary (mirrors App.jsx) ─────────────────────────────────────────
function DailyItinerary({ days }) {
  const [active, setActive] = useState(0);
  const d = days[active];
  return (
    <div>
      <div style={{ display:"flex", gap:"7px", overflowX:"auto", paddingBottom:"10px", marginBottom:"22px" }}>
        {days.map((day, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ padding:"9px 15px", borderRadius:"10px", border:`1px solid ${active===i?C.slate:C.tide}`, cursor:"pointer", flexShrink:0, textAlign:"left", background:active===i?C.slate:C.white, color:active===i?C.white:C.slateLight, boxShadow:active===i?`0 4px 12px rgba(28,43,58,0.22)`:"none", transition:"all .15s" }}>
            <div style={{ fontSize:"9px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", opacity:.75 }}>Day {day.day}</div>
            <div style={{ fontSize:"12px", fontWeight:700, marginTop:"2px" }}>{day.date}</div>
            <div style={{ fontSize:"10px", marginTop:"2px", opacity:.85 }}>{day.title}</div>
          </button>
        ))}
      </div>
      <div style={{ marginBottom:"18px" }}>
        <div style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:C.muted, marginBottom:"3px" }}>Day {d.day} · {d.date}</div>
        <div style={{ fontSize:"21px", fontWeight:700, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif" }}>{d.title}</div>
      </div>
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", left:"68px", top:0, bottom:0, width:"1px", background:C.tide }} />
        {d.items.map((item, i) => {
          const ts = typeStyles[item.type] || typeStyles.activity;
          return (
            <div key={i} style={{ display:"flex", gap:"12px", marginBottom:"16px" }}>
              <div style={{ width:"56px", flexShrink:0, textAlign:"right", paddingTop:"8px" }}>
                <span style={{ fontSize:"10px", fontWeight:700, color:C.muted }}>{item.time}</span>
              </div>
              <div style={{ width:"26px", flexShrink:0, display:"flex", alignItems:"flex-start", paddingTop:"6px", justifyContent:"center", zIndex:1 }}>
                <div style={{ width:"26px", height:"26px", borderRadius:"50%", background:ts.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", boxShadow:`0 0 0 3px ${C.white}` }}>{ts.icon}</div>
              </div>
              <div style={{ flex:1, background:C.white, border:`1px solid ${C.tide}`, borderRadius:"10px", padding:"10px 14px", boxShadow:`0 1px 4px rgba(44,62,80,0.05)` }}>
                <span style={{ fontSize:"9px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:ts.color, background:ts.bg, padding:"2px 7px", borderRadius:"20px" }}>{item.type}</span>
                <div style={{ fontSize:"13px", fontWeight:700, color:C.slate, marginTop:"4px" }}>{item.label}</div>
                {item.note && <div style={{ fontSize:"11px", color:C.slateLight, marginTop:"3px", lineHeight:1.5, fontStyle:"italic" }}>{item.note}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TripPage ──────────────────────────────────────────────────────────────────
export default function TripPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [view, setView] = useState("overview");
  const [tab, setTab] = useState("all");
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    supabase.from("trips").select("*").eq("id", id).eq("status", "published").single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); setLoading(false); return; }
        const mapped = {
          id: data.id, title: data.title, destination: data.destination,
          region: data.region, author: data.author_name, date: data.date,
          duration: data.duration, travelers: data.travelers,
          tags: data.tags || [], loves: data.loves, doNext: data.do_next,
          airfare: data.airfare || [], hotels: data.hotels || [],
          restaurants: data.restaurants || [], bars: data.bars || [],
          activities: data.activities || [], days: data.days || [],
          image: data.image || "", featured: data.featured || false,
        };
        setTrip(mapped);
        setLoading(false);
      });
  }, [id]);

  // SEO: update document title + meta description
  useEffect(() => {
    if (!trip) return;
    document.title = `${trip.title} — TripCopycat`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    const desc = `${trip.destination} · ${trip.duration} · ${trip.date}. ${(trip.loves || "").substring(0, 155)}`;
    meta.content = desc;

    // Open Graph
    const setOg = (prop, val) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
      el.content = val;
    };
    setOg("og:title", `${trip.title} — TripCopycat`);
    setOg("og:description", desc);
    setOg("og:url", window.location.href);
    setOg("og:type", "article");
    if (trip.image) setOg("og:image", trip.image);

    return () => { document.title = "TripCopycat"; };
  }, [trip]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  const grad = trip ? (REGION_GRADIENTS[trip.region] || "linear-gradient(135deg,#2C1810,#3D2B1F)") : "linear-gradient(135deg,#2C1810,#3D2B1F)";

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:C.seafoam, fontFamily:"'Nunito',system-ui,sans-serif", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"40px", marginBottom:"14px" }}>🐾</div>
          <div style={{ fontSize:"15px", fontWeight:600, color:C.slateLight }}>Loading itinerary…</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight:"100vh", background:C.seafoam, fontFamily:"'Nunito',system-ui,sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px" }}>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ fontSize:"40px" }}>✈️</div>
        <div style={{ fontSize:"18px", fontWeight:700, color:C.slate }}>Trip not found</div>
        <button onClick={() => navigate("/")} style={{ padding:"10px 24px", borderRadius:"50px", background:C.cta, color:C.ctaText, border:"none", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>← Back to TripCopycat</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.seafoam, fontFamily:"'Nunito',system-ui,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Nav */}
      <nav style={{ background:C.white, borderBottom:`1px solid ${C.tide}`, padding:"0 16px", position:"sticky", top:0, zIndex:100, boxShadow:`0 1px 6px rgba(28,43,58,0.06)`, display:"flex", alignItems:"center", justifyContent:"space-between", height:"58px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <img src="/copycat.svg" alt="TripCopycat" style={{ height:"44px", width:"44px", objectFit:"contain", mixBlendMode:"multiply" }} />
          <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontSize:"22px", color:C.slate, letterSpacing:"-0.01em" }}>TripCopycat<sup style={{ fontSize:"10px", fontWeight:700, verticalAlign:"super" }}>™</sup></span>
          <span style={{ fontSize:"9px", background:C.seafoamDeep, color:C.azureDeep, fontWeight:700, padding:"2px 7px", borderRadius:"20px", border:`1px solid ${C.tide}` }}>beta</span>
        </div>
        <button onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:"6px", background:C.seafoam, border:`1px solid ${C.tide}`, borderRadius:"8px", padding:"7px 14px", fontSize:"12px", fontWeight:600, color:C.slateLight, cursor:"pointer" }}>
          ← All Itineraries
        </button>
      </nav>

      {/* Trip header */}
      <div style={{ position:"relative", background:`linear-gradient(135deg,#2C1810 0%,#3D2B1F 100%)`, overflow:"hidden" }}>
        {trip.image && <img src={trip.image} alt={trip.title} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", opacity:0.35 }} />}
        <div style={{ position:"relative", zIndex:1, maxWidth:"880px", margin:"0 auto", padding:"clamp(28px,5vw,48px) clamp(16px,4vw,40px)" }}>
          <div style={{ fontSize:"10px", fontWeight:800, letterSpacing:"0.1em", color:"rgba(255,255,255,0.9)", textTransform:"uppercase", marginBottom:"8px", textShadow:"0 1px 4px rgba(0,0,0,0.5)" }}>
            {trip.region} · {trip.duration} · {trip.date}
          </div>
          <h1 style={{ margin:"0 0 8px", fontSize:"clamp(26px,5vw,38px)", fontWeight:700, fontFamily:"'Playfair Display',Georgia,serif", color:"#FFFFFF", textShadow:"0 2px 8px rgba(0,0,0,0.5)", lineHeight:1.15 }}>
            {trip.title}
          </h1>
          <div style={{ fontSize:"15px", color:"rgba(255,255,255,0.92)", fontWeight:500, marginBottom:"14px", textShadow:"0 1px 4px rgba(0,0,0,0.4)" }}>{trip.destination}</div>
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", alignItems:"center", marginBottom:"18px" }}>
            <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.9)", fontWeight:500 }}>by <strong>{trip.author}</strong></span>
            <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.9)" }}>{trip.travelers}</span>
            {trip.tags.map(t => <span key={t} style={{ fontSize:"10px", fontWeight:700, padding:"2px 9px", borderRadius:"20px", background:"rgba(0,0,0,0.3)", color:"#FFFFFF", border:"1px solid rgba(255,255,255,0.35)" }}>{t}</span>)}
          </div>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            <button onClick={handleShare} style={{ background:"rgba(196,168,130,0.2)", border:"1px solid rgba(196,168,130,0.4)", color:"#FAF7F2", borderRadius:"8px", padding:"7px 15px", cursor:"pointer", fontSize:"12px", fontWeight:700 }}>
              {shareCopied ? "✓ Copied!" : "🔗 Share"}
            </button>
            <button onClick={() => { const url = window.location.href; const text = `Check out this trip: ${trip.title} on TripCopycat`; window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank"); }} style={{ background:"rgba(196,168,130,0.2)", border:"1px solid rgba(196,168,130,0.4)", color:"#FAF7F2", borderRadius:"8px", padding:"7px 13px", cursor:"pointer", fontSize:"12px", fontWeight:700 }}>𝕏</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.tide}`, position:"sticky", top:"58px", zIndex:90 }}>
        <div style={{ maxWidth:"880px", margin:"0 auto", padding:"0 clamp(16px,4vw,40px)", display:"flex" }}>
          {[{id:"overview",l:"Overview"},{id:"daily",l:"📅 Daily Itinerary"},{id:"details",l:"🗂️ All Details"}].map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{ padding:"13px 20px", fontSize:"13px", fontWeight:700, border:"none", cursor:"pointer", background:"transparent", color:view===t.id?C.azureDeep:C.muted, borderBottom:view===t.id?`2px solid ${C.amber}`:"2px solid transparent", transition:"all .15s" }}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:"880px", margin:"0 auto", padding:"clamp(20px,4vw,36px) clamp(16px,4vw,40px)" }}>

        {view === "overview" && (
          <div>
            {/* Loves + DoNext */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"16px", marginBottom:"28px" }}>
              <div style={{ background:C.white, borderRadius:"14px", border:`1px solid ${C.tide}`, padding:"22px 24px" }}>
                <div style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:C.green, marginBottom:"10px" }}>❤️ What They Loved</div>
                <p style={{ margin:0, fontSize:"14px", color:C.slate, lineHeight:1.8, fontWeight:500 }}>{trip.loves}</p>
              </div>
              <div style={{ background:C.white, borderRadius:"14px", border:`1px solid ${C.tide}`, padding:"22px 24px" }}>
                <div style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:C.amber, marginBottom:"10px" }}>🔄 Do Differently</div>
                <p style={{ margin:0, fontSize:"14px", color:C.slate, lineHeight:1.8, fontWeight:500 }}>{trip.doNext}</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"10px", marginBottom:"28px" }}>
              {Object.entries(catConfig).map(([key, cfg]) => (
                <div key={key} onClick={() => { setView("details"); setTab(key); }} style={{ textAlign:"center", padding:"14px 6px", background:C.white, borderRadius:"12px", border:`1px solid ${C.tide}`, cursor:"pointer", transition:"all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=C.amber; e.currentTarget.style.boxShadow=`0 4px 16px rgba(28,43,58,0.08)`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=C.tide; e.currentTarget.style.boxShadow="none"; }}>
                  <div style={{ fontSize:"18px", marginBottom:"4px" }}>{cfg.label.split(" ")[0]}</div>
                  <div style={{ fontSize:"20px", fontWeight:800, color:cfg.color }}>{trip[key]?.length || 0}</div>
                  <div style={{ fontSize:"9px", color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{key}</div>
                </div>
              ))}
            </div>

            {/* Quick preview of each category */}
            {Object.entries(catConfig).map(([key, cfg]) => {
              if (!trip[key]?.length) return null;
              return (
                <div key={key} style={{ background:C.white, borderRadius:"14px", border:`1px solid ${C.tide}`, padding:"20px 24px", marginBottom:"16px" }}>
                  <div style={{ fontWeight:700, fontSize:"13px", marginBottom:"12px", display:"flex", alignItems:"center", gap:"7px" }}>
                    <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:cfg.color, display:"inline-block" }} />
                    {cfg.label}
                    <span style={{ marginLeft:"auto", fontSize:"10px", color:C.muted, fontWeight:600 }}>{trip[key].length} {key}</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    {trip[key].slice(0, 3).map((it, i) => (
                      <div key={i} style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
                        <div style={{ flex:1 }}>
                          <span style={{ fontSize:"13px", fontWeight:600, color:C.slate }}>{it.item}</span>
                          {it.detail && <span style={{ fontSize:"11px", color:C.muted, marginLeft:"8px" }}>{it.detail}</span>}
                          {it.tip && <div style={{ fontSize:"11px", color:C.slateLight, fontStyle:"italic", marginTop:"2px" }}>💡 {it.tip}</div>}
                        </div>
                      </div>
                    ))}
                    {trip[key].length > 3 && (
                      <button onClick={() => { setView("details"); setTab(key); }} style={{ alignSelf:"flex-start", fontSize:"11px", fontWeight:700, color:C.amber, background:"none", border:"none", cursor:"pointer", padding:"2px 0" }}>
                        +{trip[key].length - 3} more →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {trip.days?.length > 0 && (
              <button onClick={() => setView("daily")} style={{ width:"100%", padding:"14px", background:C.cta, color:C.ctaText, border:"none", borderRadius:"12px", fontSize:"14px", fontWeight:700, cursor:"pointer", marginTop:"8px" }}>
                📅 View Day-by-Day Itinerary →
              </button>
            )}
          </div>
        )}

        {view === "daily" && (
          <div style={{ background:C.white, borderRadius:"14px", border:`1px solid ${C.tide}`, padding:"24px 28px" }}>
            {trip.days?.length
              ? <DailyItinerary days={trip.days} />
              : <div style={{ textAlign:"center", padding:"56px 20px", color:C.muted }}><div style={{ fontSize:"34px", marginBottom:"12px" }}>📅</div><div style={{ fontWeight:600 }}>No daily itinerary for this trip</div></div>
            }
          </div>
        )}

        {view === "details" && (
          <div style={{ background:C.white, borderRadius:"14px", border:`1px solid ${C.tide}`, padding:"24px 28px" }}>
            <div style={{ display:"flex", gap:"5px", marginBottom:"20px", flexWrap:"wrap" }}>
              {["all", ...Object.keys(catConfig)].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding:"5px 12px", fontSize:"11px", fontWeight:600, borderRadius:"8px", border:`1px solid ${tab===t?C.azure:C.tide}`, cursor:"pointer", background:tab===t?C.azure:C.white, color:tab===t?C.white:C.slateLight }}>
                  {t === "all" ? "All" : catConfig[t]?.label}
                </button>
              ))}
            </div>
            {Object.entries(catConfig).map(([key, cfg]) => {
              if (tab !== "all" && tab !== key) return null;
              if (!trip[key]?.length) return null;
              return (
                <div key={key} style={{ marginBottom:"26px" }}>
                  <div style={{ fontWeight:700, fontSize:"13px", marginBottom:"9px", display:"flex", alignItems:"center", gap:"7px" }}>
                    <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:cfg.color, display:"inline-block" }} />{cfg.label}
                  </div>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
                    <thead><tr>{["Name","Details","💡 Tip"].map(h => <th key={h} style={{ textAlign:"left", padding:"7px 11px", background:C.seafoam, color:C.slateLight, fontWeight:600, fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>)}</tr></thead>
                    <tbody>{trip[key].map((it, i) => (
                      <tr key={i} style={{ borderBottom:`1px solid ${C.seafoamDeep}` }}>
                        <td style={{ padding:"9px 11px", fontWeight:600, color:C.slate }}>{it.item}</td>
                        <td style={{ padding:"9px 11px", color:C.slate }}>{it.detail}</td>
                        <td style={{ padding:"9px 11px", color:C.slateMid, fontStyle:"italic" }}>{it.tip}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop:`1px solid ${C.tide}`, background:C.white, padding:"16px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"40px" }}>
        <span style={{ fontSize:"11px", color:C.muted }}>© {new Date().getFullYear()} TripCopycat™. All rights reserved.</span>
        <button onClick={() => navigate("/")} style={{ fontSize:"11px", color:C.amber, background:"none", border:"none", cursor:"pointer", fontWeight:700, fontFamily:"inherit" }}>← Browse all itineraries</button>
      </footer>
    </div>
  );
}
