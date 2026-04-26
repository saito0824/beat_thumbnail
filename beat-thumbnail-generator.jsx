import { useState, useRef, useCallback, useEffect } from "react";

const PRESETS = [
  {
    id: "dark-trap", label: "Dark Trap",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 40%, #0d0d2b 100%)",
    accent: "#ff003c", textColor: "#ffffff", overlayStyle: "grain",
    stops: [{c:"#0a0a0a",p:0},{c:"#1a0a1a",p:0.4},{c:"#0d0d2b",p:1}], angle: 135,
  },
  {
    id: "lofi-chill", label: "Lo-Fi Chill",
    bg: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    accent: "#e94560", textColor: "#eaeaea", overlayStyle: "vignette",
    stops: [{c:"#1a1a2e",p:0},{c:"#16213e",p:0.5},{c:"#0f3460",p:1}], angle: 180,
  },
  {
    id: "neon-street", label: "Neon Street",
    bg: "linear-gradient(160deg, #0d0d0d 0%, #1a002a 60%, #0d0d0d 100%)",
    accent: "#00ff88", textColor: "#ffffff", overlayStyle: "scanlines",
    stops: [{c:"#0d0d0d",p:0},{c:"#1a002a",p:0.6},{c:"#0d0d0d",p:1}], angle: 160,
  },
  {
    id: "vintage-boom", label: "Vintage Boom Bap",
    bg: "linear-gradient(145deg, #1c1410 0%, #2a1f14 50%, #0f0a06 100%)",
    accent: "#d4a05a", textColor: "#f0e6d3", overlayStyle: "grain",
    stops: [{c:"#1c1410",p:0},{c:"#2a1f14",p:0.5},{c:"#0f0a06",p:1}], angle: 145,
  },
  {
    id: "phonk", label: "Phonk",
    bg: "linear-gradient(135deg, #0a0000 0%, #1a0005 40%, #200010 100%)",
    accent: "#ff0040", textColor: "#ff8888", overlayStyle: "scanlines",
    stops: [{c:"#0a0000",p:0},{c:"#1a0005",p:0.4},{c:"#200010",p:1}], angle: 135,
  },
  {
    id: "cloud-rap", label: "Cloud Rap",
    bg: "linear-gradient(180deg, #0e0e1a 0%, #1a1a3e 40%, #2a1a4e 100%)",
    accent: "#b388ff", textColor: "#e8dfff", overlayStyle: "vignette",
    stops: [{c:"#0e0e1a",p:0},{c:"#1a1a3e",p:0.4},{c:"#2a1a4e",p:1}], angle: 180,
  },
];

const FONTS = [
  { id: "impact", label: "Impact", family: "Impact, sans-serif" },
  { id: "oswald", label: "Oswald", family: "'Oswald', sans-serif", url: "https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap" },
  { id: "bebas", label: "Bebas Neue", family: "'Bebas Neue', sans-serif", url: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" },
  { id: "anton", label: "Anton", family: "'Anton', sans-serif", url: "https://fonts.googleapis.com/css2?family=Anton&display=swap" },
  { id: "blackops", label: "Black Ops One", family: "'Black Ops One', sans-serif", url: "https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap" },
  { id: "rubikglitch", label: "Rubik Glitch", family: "'Rubik Glitch', sans-serif", url: "https://fonts.googleapis.com/css2?family=Rubik+Glitch&display=swap" },
];

const LAYOUTS = [
  { id: "centered", label: "中央配置" },
  { id: "bottom-left", label: "左下配置" },
  { id: "top-split", label: "上下分割" },
  { id: "diagonal", label: "斜め配置" },
];

function GrainOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0, opacity: 0.06, mixBlendMode: "overlay",
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: "128px 128px",
      pointerEvents: "none",
    }} />
  );
}

function ScanlineOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0, opacity: 0.08, pointerEvents: "none",
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
    }} />
  );
}

function VignetteOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
    }} />
  );
}

function ThumbnailPreview({ config }) {
  const {
    artistName, beatName, producerName, bpm, musicalKey, preset, font, layout,
    showBpm, showKey, showTag, tagText, accentOverride, uploadedImage,
  } = config;

  const currentPreset = PRESETS.find((p) => p.id === preset) || PRESETS[0];
  const currentFont = FONTS.find((f) => f.id === font) || FONTS[0];
  const accent = accentOverride || currentPreset.accent;

  const renderOverlay = () => {
    switch (currentPreset.overlayStyle) {
      case "grain": return <GrainOverlay />;
      case "scanlines": return <ScanlineOverlay />;
      case "vignette": return <VignetteOverlay />;
      default: return null;
    }
  };

  const layoutStyles = {
    centered: {
      artistFs: "clamp(16px, 4.5vw, 42px)",
      beatFs: "clamp(28px, 8vw, 72px)",
    },
    "bottom-left": {
      artistFs: "clamp(14px, 3.5vw, 32px)",
      beatFs: "clamp(24px, 7vw, 64px)",
    },
    "top-split": {
      artistFs: "clamp(16px, 4vw, 38px)",
      beatFs: "clamp(26px, 7.5vw, 68px)",
    },
    diagonal: {
      artistFs: "clamp(14px, 3.8vw, 34px)",
      beatFs: "clamp(26px, 7.5vw, 68px)",
    },
  };

  const ls = layoutStyles[layout] || layoutStyles.centered;

  const metaBadgeStyle = {
    display: "inline-flex", alignItems: "center", gap: "4px",
    background: `${accent}22`, border: `1px solid ${accent}55`,
    borderRadius: "4px", padding: "3px 10px",
    fontSize: "clamp(10px, 2.2vw, 16px)", fontFamily: "'Courier New', monospace",
    color: accent, fontWeight: 700, letterSpacing: "0.05em",
  };

  const hasBottomInfo = producerName || showBpm || showKey;

  /* Main text area adapts padding-bottom when bottom bar exists */
  const mainAreaPadding = hasBottomInfo ? "16px 16px 48px 16px" : "16px";

  /* Layout-specific wrapper for main text — occupies top/center area only */
  const mainWrapperStyles = {
    centered: {
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", gap: "4px",
      textAlign: "center",
    },
    "bottom-left": {
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      alignItems: "flex-start", height: "100%", paddingBottom: "8px", paddingLeft: "12px",
      textAlign: "left",
    },
    "top-split": {
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      alignItems: "center", height: "100%", paddingTop: "8px", paddingBottom: "8px",
      textAlign: "center",
    },
    diagonal: {
      display: "flex", flexDirection: "column", justifyContent: "center",
      alignItems: "flex-start", height: "100%", paddingLeft: "16px",
      transform: "rotate(-3deg)", textAlign: "left",
    },
  };

  const mw = mainWrapperStyles[layout] || mainWrapperStyles.centered;
  const ta = mw.textAlign;

  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: "16/9",
      background: currentPreset.bg, overflow: "hidden", borderRadius: "8px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      {uploadedImage && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${uploadedImage})`,
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.35, filter: "blur(1px)",
        }} />
      )}

      {renderOverlay()}

      {/* Tag badge — top right, always safe */}
      {showTag && (
        <div style={{
          position: "absolute", top: "12px", right: "12px", zIndex: 3,
          background: accent, color: "#000", fontWeight: 900,
          fontSize: "clamp(8px, 1.8vw, 13px)", padding: "3px 10px",
          borderRadius: "3px", fontFamily: "sans-serif",
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          {tagText}
        </div>
      )}

      {/* Main text area — artist name + beat name only */}
      <div style={{
        position: "absolute", inset: 0, padding: mainAreaPadding,
        zIndex: 2,
      }}>
        <div style={mw}>
          <div style={{
            fontSize: ls.artistFs, fontFamily: currentFont.family,
            color: `${currentPreset.textColor}bb`,
            textTransform: "uppercase", letterSpacing: "0.15em",
            lineHeight: 1.1,
          }}>
            {artistName || "Artist"} Type Beat
          </div>
          <div style={{
            fontSize: ls.beatFs, fontFamily: currentFont.family,
            color: currentPreset.textColor,
            textTransform: "uppercase", letterSpacing: "0.05em",
            lineHeight: 0.95,
            textShadow: `0 0 40px ${accent}44`,
            WebkitTextStroke: `1px ${accent}33`,
          }}>
            {beatName || "Beat Name"}
          </div>
        </div>
      </div>

      {/* Bottom info bar — Prod.by left, BPM/KEY right, no overlap */}
      {hasBottomInfo && (
        <div style={{
          position: "absolute", bottom: "10px", left: "16px", right: "16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          zIndex: 3,
        }}>
          {/* Producer credit — left side */}
          <div style={{
            fontSize: "clamp(9px, 2vw, 14px)",
            fontFamily: "'Courier New', monospace",
            color: `${currentPreset.textColor}88`,
            letterSpacing: "0.08em",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", gap: "4px",
            minWidth: 0,
          }}>
            {producerName ? (
              <>
                <span style={{ opacity: 0.5 }}>Prod.by</span>
                <span style={{ color: accent, fontWeight: 700 }}>{producerName}</span>
              </>
            ) : <span />}
          </div>

          {/* BPM / KEY badges — right side */}
          {(showBpm || showKey) && (
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              {showBpm && <span style={metaBadgeStyle}>BPM {bpm || "140"}</span>}
              {showKey && <span style={metaBadgeStyle}>KEY {musicalKey || "Cm"}</span>}
            </div>
          )}
        </div>
      )}

      {/* Accent line decoration */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "3px", background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        zIndex: 4,
      }} />
    </div>
  );
}

function ColorInput({ value, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "6px",
        background: value, border: "2px solid rgba(255,255,255,0.15)",
        position: "relative", overflow: "hidden",
      }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          style={{ position: "absolute", inset: "-4px", width: "36px", height: "36px", cursor: "pointer", opacity: 0 }}
        />
      </div>
      <span style={{ fontSize: "12px", color: "#999" }}>{label}</span>
    </label>
  );
}

export default function BeatThumbnailGenerator() {
  const [config, setConfig] = useState({
    artistName: "Dark Trap",
    beatName: "SHADOW",
    producerName: "",
    bpm: "140",
    musicalKey: "Cm",
    preset: "dark-trap",
    font: "bebas",
    layout: "centered",
    showBpm: true,
    showKey: true,
    showTag: true,
    tagText: "FREE",
    accentOverride: "",
    uploadedImage: null,
  });

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const links = FONTS.filter((f) => f.url).map((f) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = f.url;
      document.head.appendChild(link);
      return link;
    });
    setTimeout(() => setFontsLoaded(true), 800);
    return () => links.forEach((l) => l.remove());
  }, []);

  const update = useCallback((key, val) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update("uploadedImage", ev.target.result);
    reader.readAsDataURL(file);
  }, [update]);

  const handleExport = useCallback(async () => {
    const W = 1280, H = 720;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    const preset = PRESETS.find((p) => p.id === config.preset) || PRESETS[0];
    const fontObj = FONTS.find((f) => f.id === config.font) || FONTS[0];
    const accent = config.accentOverride || preset.accent;

    const roundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
      ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
      ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
      ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
      ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
    };
    const loadImg = (src) => new Promise((res, rej) => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => res(img); img.onerror = rej; img.src = src;
    });

    // Background gradient
    const ang = (preset.angle || 135) * Math.PI / 180;
    const diag = Math.sqrt(W*W+H*H)/2;
    const grad = ctx.createLinearGradient(
      W/2-Math.cos(ang)*diag, H/2-Math.sin(ang)*diag,
      W/2+Math.cos(ang)*diag, H/2+Math.sin(ang)*diag
    );
    (preset.stops||[]).forEach(s => grad.addColorStop(s.p, s.c));
    ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);

    // Background image
    if (config.uploadedImage) {
      try {
        const img = await loadImg(config.uploadedImage);
        ctx.globalAlpha = 0.35;
        const sc = Math.max(W/img.width, H/img.height);
        ctx.drawImage(img, (W-img.width*sc)/2, (H-img.height*sc)/2, img.width*sc, img.height*sc);
        ctx.globalAlpha = 1;
      } catch(e) {}
    }

    // Overlay
    if (preset.overlayStyle === "vignette") {
      const vg = ctx.createRadialGradient(W/2,H/2,W*0.2,W/2,H/2,W*0.7);
      vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,0.6)");
      ctx.fillStyle = vg; ctx.fillRect(0,0,W,H);
    }
    if (preset.overlayStyle === "scanlines") {
      ctx.fillStyle = "rgba(255,255,255,0.015)";
      for (let y=0;y<H;y+=4) ctx.fillRect(0,y,W,2);
    }

    // Tag
    if (config.showTag) {
      ctx.font = "700 18px sans-serif";
      const tw = ctx.measureText(config.tagText.toUpperCase()).width+20;
      ctx.fillStyle = accent; roundRect(W-24-tw,20,tw,28,4); ctx.fill();
      ctx.fillStyle = "#000"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(config.tagText.toUpperCase(), W-24-tw/2, 34);
    }

    // Main text
    const artistText = ((config.artistName||"Artist")+" Type Beat").toUpperCase();
    const beatText = (config.beatName||"Beat Name").toUpperCase();
    const aSize = {centered:42,"bottom-left":32,"top-split":38,diagonal:34}[config.layout]||42;
    const bSize = {centered:72,"bottom-left":64,"top-split":68,diagonal:68}[config.layout]||72;
    let ax,ay,bx,by,ta;
    const hasBot = config.producerName||config.showBpm||config.showKey;
    if (config.layout==="centered") { ta="center";ax=W/2;bx=W/2;ay=H/2-bSize/2-8;by=H/2+aSize/2; }
    else if (config.layout==="bottom-left") { ta="left";ax=44;bx=44;by=H-(hasBot?90:50);ay=by-bSize-4; }
    else if (config.layout==="top-split") { ta="center";ax=W/2;bx=W/2;ay=70;by=H-(hasBot?90:50); }
    else { ta="left";ax=60;bx=60;ay=H/2-bSize/2-8;by=H/2+aSize/2;ctx.save();ctx.translate(W/2,H/2);ctx.rotate(-3*Math.PI/180);ctx.translate(-W/2,-H/2); }

    ctx.textAlign = ta; ctx.textBaseline = "middle";
    ctx.font = `700 ${aSize}px ${fontObj.family}`; ctx.fillStyle = preset.textColor+"bb";
    ctx.fillText(artistText, ax, ay);
    ctx.font = `700 ${bSize}px ${fontObj.family}`; ctx.fillStyle = preset.textColor;
    ctx.shadowColor = accent+"44"; ctx.shadowBlur = 40;
    ctx.fillText(beatText, bx, by); ctx.shadowBlur = 0;
    if (config.layout==="diagonal") ctx.restore();

    // Bottom bar
    const botY = H-28;
    if (config.producerName) {
      ctx.textAlign="left"; ctx.textBaseline="middle";
      ctx.font="400 18px Courier New,monospace"; ctx.fillStyle=preset.textColor+"66";
      const pw=ctx.measureText("Prod.by ").width; ctx.fillText("Prod.by ",28,botY);
      ctx.font="700 18px Courier New,monospace"; ctx.fillStyle=accent; ctx.fillText(config.producerName,28+pw,botY);
    }
    if (config.showBpm||config.showKey) {
      ctx.textAlign="right"; ctx.textBaseline="middle"; ctx.font="700 20px Courier New,monospace";
      let rx=W-28;
      if (config.showKey) {
        const ks="KEY "+config.musicalKey, kw=ctx.measureText(ks).width+20;
        ctx.fillStyle=accent+"22"; roundRect(rx-kw,botY-14,kw,28,4); ctx.fill();
        ctx.strokeStyle=accent+"55"; ctx.lineWidth=1; roundRect(rx-kw,botY-14,kw,28,4); ctx.stroke();
        ctx.fillStyle=accent; ctx.fillText(ks,rx-10,botY); rx-=kw+10;
      }
      if (config.showBpm) {
        const bs="BPM "+config.bpm, bw=ctx.measureText(bs).width+20;
        ctx.fillStyle=accent+"22"; roundRect(rx-bw,botY-14,bw,28,4); ctx.fill();
        ctx.strokeStyle=accent+"55"; ctx.lineWidth=1; roundRect(rx-bw,botY-14,bw,28,4); ctx.stroke();
        ctx.fillStyle=accent; ctx.fillText(bs,rx-10,botY);
      }
    }

    // Accent line
    const lg = ctx.createLinearGradient(0,0,W,0);
    lg.addColorStop(0,"transparent"); lg.addColorStop(0.5,accent); lg.addColorStop(1,"transparent");
    ctx.fillStyle=lg; ctx.fillRect(0,H-3,W,3);

    const a = document.createElement("a");
    a.download = `${config.beatName||"beat"}_thumbnail.png`;
    a.href = canvas.toDataURL("image/png"); a.click();
  }, [config]);

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px", color: "#eee", fontSize: "14px",
    outline: "none", fontFamily: "inherit",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em",
    color: "#666", fontWeight: 600, marginBottom: "4px", display: "block",
  };

  const sectionStyle = {
    display: "flex", flexDirection: "column", gap: "12px",
  };

  const chipBase = {
    padding: "6px 14px", borderRadius: "6px", fontSize: "12px",
    fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
    border: "1px solid rgba(255,255,255,0.08)",
    fontFamily: "inherit",
  };

  const currentPreset = PRESETS.find((p) => p.id === config.preset) || PRESETS[0];
  const accent = config.accentOverride || currentPreset.accent;

  return (
    <div style={{
      background: "#0c0c0e",
      minHeight: "100vh", color: "#ddd",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        input:focus, select:focus { border-color: ${accent} !important; }
        input::placeholder { color: #444; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "24px 28px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: "14px",
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "8px",
          background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", fontWeight: 900, color: "#000",
        }}>B</div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "0.02em" }}>Beat Thumbnail Generator</div>
          <div style={{ fontSize: "11px", color: "#555", marginTop: "1px" }}>ヒップホップ系ビートのサムネイルを即座に生成</div>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        gap: "0",
        minHeight: "calc(100vh - 77px)",
      }}>
        {/* Controls Panel */}
        <div style={{
          padding: "20px 24px",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflowY: "auto", maxHeight: "calc(100vh - 77px)",
          display: "flex", flexDirection: "column", gap: "24px",
        }}>
          {/* Text inputs */}
          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#aaa", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "3px", height: "14px", background: accent, borderRadius: "2px" }} />
              テキスト設定
            </div>
            <div>
              <label style={labelStyle}>アーティスト名</label>
              <input style={inputStyle} placeholder="例: Travis Scott" value={config.artistName}
                onChange={(e) => update("artistName", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>ビート名</label>
              <input style={inputStyle} placeholder="例: MIDNIGHT" value={config.beatName}
                onChange={(e) => update("beatName", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>プロデューサー名（Prod.by）</label>
              <input style={inputStyle} placeholder="例: your name" value={config.producerName}
                onChange={(e) => update("producerName", e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <label style={labelStyle}>BPM</label>
                <input style={inputStyle} placeholder="140" value={config.bpm}
                  onChange={(e) => update("bpm", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>KEY</label>
                <input style={inputStyle} placeholder="Cm" value={config.musicalKey}
                  onChange={(e) => update("musicalKey", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Style preset */}
          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#aaa", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "3px", height: "14px", background: accent, borderRadius: "2px" }} />
              スタイル
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {PRESETS.map((p) => (
                <button key={p.id} onClick={() => update("preset", p.id)} style={{
                  ...chipBase,
                  background: config.preset === p.id ? `${p.accent}22` : "rgba(255,255,255,0.03)",
                  color: config.preset === p.id ? p.accent : "#777",
                  borderColor: config.preset === p.id ? `${p.accent}44` : "rgba(255,255,255,0.08)",
                }}>
                  <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: p.accent, marginRight: "6px" }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#aaa", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "3px", height: "14px", background: accent, borderRadius: "2px" }} />
              フォント
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {FONTS.map((f) => (
                <button key={f.id} onClick={() => update("font", f.id)} style={{
                  ...chipBase,
                  fontFamily: f.family,
                  background: config.font === f.id ? `${accent}22` : "rgba(255,255,255,0.03)",
                  color: config.font === f.id ? accent : "#777",
                  borderColor: config.font === f.id ? `${accent}44` : "rgba(255,255,255,0.08)",
                  fontSize: "14px",
                }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#aaa", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "3px", height: "14px", background: accent, borderRadius: "2px" }} />
              レイアウト
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {LAYOUTS.map((l) => (
                <button key={l.id} onClick={() => update("layout", l.id)} style={{
                  ...chipBase,
                  background: config.layout === l.id ? `${accent}22` : "rgba(255,255,255,0.03)",
                  color: config.layout === l.id ? accent : "#777",
                  borderColor: config.layout === l.id ? `${accent}44` : "rgba(255,255,255,0.08)",
                }}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#aaa", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "3px", height: "14px", background: accent, borderRadius: "2px" }} />
              表示オプション
            </div>
            {[
              { key: "showBpm", label: "BPMを表示" },
              { key: "showKey", label: "KEYを表示" },
              { key: "showTag", label: "タグを表示" },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <div onClick={() => update(key, !config[key])} style={{
                  width: "36px", height: "20px", borderRadius: "10px",
                  background: config[key] ? accent : "rgba(255,255,255,0.1)",
                  position: "relative", transition: "background 0.2s", cursor: "pointer",
                }}>
                  <div style={{
                    width: "16px", height: "16px", borderRadius: "50%",
                    background: "#fff", position: "absolute", top: "2px",
                    left: config[key] ? "18px" : "2px",
                    transition: "left 0.2s",
                  }} />
                </div>
                <span style={{ fontSize: "13px", color: "#aaa" }}>{label}</span>
              </label>
            ))}
            {config.showTag && (
              <div>
                <label style={labelStyle}>タグテキスト</label>
                <input style={inputStyle} value={config.tagText}
                  onChange={(e) => update("tagText", e.target.value)} placeholder="FREE / SOLD / NEW" />
              </div>
            )}
          </div>

          {/* Accent color */}
          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#aaa", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "3px", height: "14px", background: accent, borderRadius: "2px" }} />
              カスタムカラー
            </div>
            <ColorInput value={accent} onChange={(v) => update("accentOverride", v)} label="アクセントカラー" />
          </div>

          {/* Image upload */}
          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#aaa", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "3px", height: "14px", background: accent, borderRadius: "2px" }} />
              背景画像（任意）
            </div>
            <label style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "14px", border: "1px dashed rgba(255,255,255,0.12)",
              borderRadius: "8px", cursor: "pointer", fontSize: "13px", color: "#555",
              transition: "border-color 0.2s",
            }}>
              {config.uploadedImage ? "画像を変更" : "クリックして画像をアップロード"}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
            </label>
            {config.uploadedImage && (
              <button onClick={() => update("uploadedImage", null)} style={{
                background: "none", border: "none", color: "#555",
                fontSize: "12px", cursor: "pointer", textDecoration: "underline",
              }}>画像を削除</button>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div style={{
          padding: "32px",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "20px",
          background: "rgba(255,255,255,0.01)",
        }}>
          <div style={{ width: "100%", maxWidth: "720px" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "12px",
            }}>
              <span style={{ fontSize: "11px", color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                プレビュー — 1280 × 720px
              </span>
              <button onClick={handleExport} style={{
                background: accent, color: "#000",
                border: "none", borderRadius: "6px",
                padding: "8px 20px", fontSize: "13px",
                fontWeight: 700, cursor: "pointer",
                transition: "transform 0.15s, opacity 0.15s",
                fontFamily: "inherit",
              }}
                onMouseEnter={(e) => { e.target.style.opacity = "0.85"; e.target.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.target.style.opacity = "1"; e.target.style.transform = "scale(1)"; }}
              >
                PNG で書き出し
              </button>
            </div>

            <div id="thumbnail-preview" style={{ animation: "fadeIn 0.4s ease" }}>
              <ThumbnailPreview config={config} />
            </div>

            <div style={{
              marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap",
              justifyContent: "center",
            }}>
              {[
                { artist: "Dark Trap", beat: "SHADOW", preset: "dark-trap", bpm: "140", key: "Cm" },
                { artist: "Chill R&B", beat: "EMOTIONS", preset: "lofi-chill", bpm: "130", key: "Dm" },
                { artist: "Hard Trap", beat: "NEON", preset: "neon-street", bpm: "150", key: "F#m" },
                { artist: "Boom Bap", beat: "NOSTALGIA", preset: "vintage-boom", bpm: "90", key: "Eb" },
                { artist: "Phonk", beat: "TURBO", preset: "phonk", bpm: "160", key: "Am" },
              ].map((ex, i) => (
                <button key={i} onClick={() => setConfig((prev) => ({
                  ...prev, artistName: ex.artist, beatName: ex.beat,
                  preset: ex.preset, bpm: ex.bpm, musicalKey: ex.key,
                  accentOverride: "",
                }))} style={{
                  ...chipBase,
                  background: "rgba(255,255,255,0.03)",
                  color: "#555",
                  fontSize: "11px",
                }}>
                  {ex.artist} — {ex.beat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
