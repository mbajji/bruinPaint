import React, { useCallback, useEffect, useRef, useState } from "react";

const BASE_COLORS = [
  { name: "Coral", value: "#E76F51" },
  { name: "Blue", value: "#3977C3" },
  { name: "Green", value: "#47966B" },
];

// These extra colors are intentionally hidden until the secret key is pressed.
const SECRET_COLORS = [
  { name: "Purple", value: "#8B5CF6" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Pink", value: "#EC4899" },
  { name: "Black", value: "#252525" },
  { name: "Teal", value: "#0D9488" },
];

const WIDTH = 1000;
const HEIGHT = 650;

export default function App() {
  const [selectedColor, setSelectedColor] = useState(BASE_COLORS[0].value);
  const [strokes, setStrokes] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [showSecretHint, setShowSecretHint] = useState(false);
  const activeStroke = useRef(null);
  const svgRef = useRef(null);

  const colors = unlocked ? [...BASE_COLORS, ...SECRET_COLORS] : BASE_COLORS;

  const unlockColors = useCallback(() => {
    setUnlocked((wasUnlocked) => {
      if (!wasUnlocked) {
        setShowSecretHint(true);
        window.setTimeout(() => setShowSecretHint(false), 2600);
      }
      return true;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      // Space is the hidden shortcut. Ignore it when focus is in an input/button.
      if (event.code === "Space" && !["INPUT", "TEXTAREA", "BUTTON"].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        unlockColors();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [unlockColors]);

  function getPosition(event) {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  }

  function startDrawing(event) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke = { color: selectedColor, points: [getPosition(event)] };
    activeStroke.current = stroke;
    setStrokes((previous) => [...previous, stroke]);
  }

  function draw(event) {
    if (!activeStroke.current) return;
    const point = getPosition(event);
    const updatedStroke = {
      ...activeStroke.current,
      points: [...activeStroke.current.points, point],
    };
    activeStroke.current = updatedStroke;
    setStrokes((previous) => [...previous.slice(0, -1), updatedStroke]);
  }

  function stopDrawing() {
    activeStroke.current = null;
  }

  function undo() {
    stopDrawing();
    setStrokes((previous) => previous.slice(0, -1));
  }

  function clearCanvas() {
    stopDrawing();
    setStrokes([]);
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">A CREATIVE CONSTRAINT EXPERIMENT</p>
          <h1>THREE COLORS<span>.</span></h1>
          <p className="subtitle">One canvas. Your imagination.</p>
        </div>
        <div className="stroke-count">{strokes.length} {strokes.length === 1 ? "stroke" : "strokes"}</div>
      </header>

      <main className="main">
        <section className="toolbar" aria-label="Drawing tools">
          <div>
            <p className="label">CHOOSE A COLOR</p>
            <div className="colors">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className={`swatch ${selectedColor === color.value ? "selected" : ""}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  aria-label={color.name}
                  aria-pressed={selectedColor === color.value}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <div className="actions">
            <button className="action-button" onClick={undo} disabled={strokes.length === 0}>↶ Undo</button>
            <button className="action-button" onClick={clearCanvas} disabled={strokes.length === 0}>Clear</button>
          </div>
        </section>

        <div className="canvas-wrap">
          <svg
            ref={svgRef}
            className="canvas"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            role="img"
            aria-label="Blank drawing canvas. Click and drag to draw lines."
          >
            <rect width={WIDTH} height={HEIGHT} fill="#fff" />
            {strokes.map((stroke, index) => (
              <polyline
                key={index}
                points={stroke.points.map((point) => `${point.x},${point.y}`).join(" ")}
                fill="none"
                stroke={stroke.color}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          {showSecretHint && <div className="secret-message">You found the hidden colors.</div>}
        </div>

        <footer className="footer">
          <span>DRAW ANYTHING.</span>
          <span>USING ONLY WHAT YOU HAVE.</span>
        </footer>
        {unlocked && <p className="unlocked-note">The hidden palette is unlocked.</p>}
      </main>
    </div>
  );
}
