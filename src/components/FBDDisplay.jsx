import { useRef, useEffect, useState } from "react";

// 🧠 REACT FACT #9: Multiple props destructured
// { fbdData, error, capturedImage, onReset } are ALL props from the parent.
// Destructuring means instead of: props.fbdData, props.error...
// We write: { fbdData, error } — much cleaner!

export default function FBDDisplay({ fbdData, error, capturedImage, onReset }) {
  const canvasRef = useRef(null);
  const [activeForce, setActiveForce] = useState(null);

  // 🧠 REACT FACT #10: useEffect with a dependency
  // The [fbdData] means: "re-run this effect whenever fbdData changes"
  // So as soon as the AI result arrives and fbdData is set, this fires and draws!
  useEffect(() => {
    if (fbdData && canvasRef.current) {
      drawFBD(fbdData);
    }
  }, [fbdData]);

  const drawFBD = (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    // Clear previous drawing
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, W, H);

    // Grid lines (subtle)
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Center point where all forces originate
    const cx = W / 2;
    const cy = H / 2;

    // Draw object shape in center
    drawObject(ctx, cx, cy, data.objectShape || "box", data.objectName);

    // Draw each force arrow
    const forces = data.forces || [];
    forces.forEach((force, i) => {
      drawForceArrow(ctx, cx, cy, force, forces.length, i);
    });

    // Equilibrium indicator
    if (data.isEquilibrium) {
      ctx.font = "12px 'Courier New'";
      ctx.fillStyle = "rgba(74, 222, 128, 0.7)";
      ctx.fillText("∑F = 0  (Equilibrium)", 12, H - 12);
    }
  };

  const drawObject = (ctx, cx, cy, shape, name) => {
    ctx.save();
    
    // Glow effect
    ctx.shadowColor = "rgba(99, 179, 237, 0.6)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "#63b3ed";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(99, 179, 237, 0.1)";

    const size = 50;

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(cx, cy, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (shape === "triangle") {
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size, cy + size);
      ctx.lineTo(cx - size, cy + size);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // default: box
      ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
      ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
    }

    // Object label
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 13px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText(name || "Object", cx, cy + 5);

    ctx.restore();
  };

  const drawForceArrow = (ctx, cx, cy, force, totalForces, index) => {
    const arrowLength = 90;
    const headSize = 12;
    const color = force.color || "#f6ad55";
    const isNetForce = force.symbol?.toLowerCase().includes("net") || force.name?.toLowerCase().includes("net");

    const angleMap = {
      "right":      0,
      "up-right":   -45,
      "up":         -90,
      "up-left":    -135,
      "left":       180,
      "down-left":  135,
      "down":       90,
      "down-right": 45,
    };

    const angleDeg = angleMap[force.direction] ?? (index * (360 / totalForces));
    const angleRad = (angleDeg * Math.PI) / 180;

    // Net force arrows are longer to stand out
    const length = isNetForce ? arrowLength * 1.3 : arrowLength;
    const startOffset = 55;
    const sx = cx + Math.cos(angleRad) * startOffset;
    const sy = cy + Math.sin(angleRad) * startOffset;
    const ex = cx + Math.cos(angleRad) * (startOffset + length);
    const ey = cy + Math.sin(angleRad) * (startOffset + length);

    ctx.save();

    ctx.shadowColor = color;
    ctx.shadowBlur = isNetForce ? 16 : 8;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = isNetForce ? 3 : 2.5;

    // 🧠 Net force = dashed arrow so students can distinguish it visually
    if (isNetForce) {
      ctx.setLineDash([8, 4]);
    }

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.setLineDash([]); // reset dash

    // Arrowhead
    const arrowAngle = Math.atan2(ey - sy, ex - sx);
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(
      ex - headSize * Math.cos(arrowAngle - Math.PI / 6),
      ey - headSize * Math.sin(arrowAngle - Math.PI / 6)
    );
    ctx.lineTo(
      ex - headSize * Math.cos(arrowAngle + Math.PI / 6),
      ey - headSize * Math.sin(arrowAngle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.shadowBlur = 0;
    ctx.font = isNetForce ? "bold 13px 'Georgia'" : "bold 14px 'Georgia'";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const labelOffset = 18;
    const lx = ex + Math.cos(angleRad) * labelOffset;
    const ly = ey + Math.sin(angleRad) * labelOffset;
    ctx.fillText(force.symbol || force.name[0], lx, ly);

    ctx.restore();
  };

  if (error) {
    return (
      <div className="result-screen">
        <div className="error-card">
          <span className="error-icon">⚠️</span>
          <h3>Scan Failed</h3>
          <p>{error}</p>
          {error.includes("API key") && (
            <div className="api-help">
              <p>To get your free Gemini API key:</p>
              <ol>
                <li>Go to <strong>aistudio.google.com</strong></li>
                <li>Click <strong>Get API Key</strong></li>
                <li>Create a new key</li>
                <li>Paste it in your <strong>.env</strong> file</li>
              </ol>
            </div>
          )}
          <button onClick={onReset} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  if (!fbdData) return null;

  return (
    <div className="result-screen">
      <div className="result-header">
        <div className="object-badge">
          <span className="detected-label">Detected</span>
          <h2>{fbdData.objectName}</h2>
          <p>{fbdData.scenario}</p>
        </div>
        <img src={`data:image/jpeg;base64,${capturedImage}`} alt="captured" className="thumb" />
      </div>

      <div className="fbd-canvas-container">
        <canvas ref={canvasRef} width={340} height={340} className="fbd-canvas" />
        <p className="canvas-label">Free Body Diagram</p>
      </div>

      {/* Force Legend — clicking reveals description */}
      <div className="forces-panel">
        <h3>Acting Forces</h3>
        <div className="forces-list">
          {/* 🧠 REACT FACT #11: .map() — the React way to make lists
              When you have an array and want to render each item, use .map()
              It loops through every item and returns a JSX element for each.
              The "key" prop is REQUIRED — it helps React track which item is which
              when the list changes. Use something unique like the force name! */}
          {fbdData.forces.map((force) => (
            <div
              key={force.name}
              className={`force-item ${activeForce === force.name ? "active" : ""}`}
              onClick={() => setActiveForce(activeForce === force.name ? null : force.name)}
              style={{ borderColor: force.color }}
            >
              <div className="force-header">
                <span className="force-symbol" style={{ color: force.color }}>
                  {force.symbol}
                </span>
                <span className="force-name">{force.name}</span>
                <span className="force-arrow">
                  {force.direction === "up" && "↑"}
                  {force.direction === "down" && "↓"}
                  {force.direction === "left" && "←"}
                  {force.direction === "right" && "→"}
                </span>
                <span className="force-magnitude">{force.magnitude}</span>
              </div>

              {/* 🧠 REACT FACT #12: Conditional rendering with ternary
                  condition ? "show this if true" : "show this if false"
                  Here: if this force is active (clicked), show the description */}
              {activeForce === force.name && (
                <p className="force-description">{force.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="net-force-panel">
        <h3>Net Force & Motion</h3>
        <p>{fbdData.netForce}</p>
        <div className={`equilibrium-tag ${fbdData.isEquilibrium ? "yes" : "no"}`}>
          {fbdData.isEquilibrium ? "✓ In Equilibrium" : "⚡ Net Force Present"}
        </div>
        {fbdData.formula && (
          <div className="formula-box">
            <span className="formula-label">Key Formula</span>
            <span className="formula-text">{fbdData.formula}</span>
          </div>
        )}
      </div>

      <button onClick={onReset} className="btn-primary btn-scan-again">
        📷 Scan Another Object
      </button>
    </div>
  );
}