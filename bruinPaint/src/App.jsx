
import React, { useState, useEffect, useRef } from "react";

const COLORS = [
  { name: "Coral", value: "#E76F51" },
  { name: "Blue", value: "#3977C3" },
  { name: "Green", value: "#47966B" },
];

const SECRET_COLORS = [
  { name: "Purple", value: "#8B5CF6" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Pink", value: "#EC4899" },
  { name: "Black", value: "#222222" },
  { name: "Teal", value: "#14B8A6" },
];

const SHAPES = [
  { name: "Circle", value: "circle", symbol: "●" },
];

const SECRET_SHAPES = [
  { name: "Square", value: "square", symbol: "■" },
  { name: "Triangle", value: "triangle", symbol: "▲" },
  { name: "Star", value: "star", symbol: "★" },
  { name: "Heart", value: "heart", symbol: "♥" },
];

const styles = {
  app: {
    minHeight: "100vh",
    background: "#f7f7f5",
    padding: "35px 20px",
    fontFamily: "Arial, sans-serif",
    color: "#292929",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "950px",
    margin: "0 auto",
  },
  heading: {
    textAlign: "center",
    fontSize: "28px",
    marginBottom: "8px",
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: "30px",
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "22px",
  },
  group: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },
  divider: {
    height: "30px",
    width: "1px",
    background: "#ddd",
    margin: "0 5px",
  },
  swatch: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "3px solid white",
    cursor: "pointer",
    boxShadow: "0 0 0 1px #ddd",
  },
  shapeButton: {
    width: "39px",
    height: "39px",
    borderRadius: "9px",
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontSize: "21px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    border: "1px solid #ddd",
    background: "white",
    padding: "9px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  canvasWrapper: {
    background: "white",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 3px 15px rgba(0,0,0,0.04)",
  },
  canvas: {
    width: "100%",
    height: "500px",
    display: "block",
    touchAction: "none",
    cursor: "crosshair",
  },
  hint: {
    textAlign: "center",
    marginTop: "18px",
    fontSize: "13px",
    color: "#999",
  },
};

function starPoints() {
  return Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI * i) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? 36 : 16;
    return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
  }).join(" ");
}

function ShapeStamp({ stamp }) {
  const common = {
    stroke: stamp.color,
    strokeWidth: 4,
    fill: "none",
    strokeLinejoin: "round",
    strokeLinecap: "round",
  };

  return (
    <g transform={`translate(${stamp.x}, ${stamp.y})`}>
      {stamp.shape === "circle" && (
        <circle {...common} r="35" />
      )}

      {stamp.shape === "square" && (
        <rect {...common} x="-31" y="-31" width="62" height="62" />
      )}

      {stamp.shape === "triangle" && (
        <polygon
          {...common}
          points="0,-38 36,30 -36,30"
        />
      )}

      {stamp.shape === "star" && (
        <polygon {...common} points={starPoints()} />
      )}

      {stamp.shape === "heart" && (
        <path
          {...common}
          d="M 0 32 C -10 20 -39 -1 -30 -23 C -21 -43 -3 -34 0 -20 C 8 -39 31 -40 34 -18 C 38 2 13 23 0 32 Z"
        />
      )}
    </g>
  );
}

export default function App() {
  const [color, setColor] = useState(COLORS[0].value);
  const [showSecretColors, setShowSecretColors] = useState(false);
  const [showSecretShapes, setShowSecretShapes] = useState(false);
  const [selectedShape, setSelectedShape] = useState(null);
  const [strokes, setStrokes] = useState([]);
  const [drawing, setDrawing] = useState(false);

  const svgRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setShowSecretColors(true);
      }

      if (e.key.toLowerCase() === "s") {
        setShowSecretShapes(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function getPosition(e) {
    const rect = svgRef.current.getBoundingClientRect();

    return {
      x: ((e.clientX - rect.left) / rect.width) * 800,
      y: ((e.clientY - rect.top) / rect.height) * 500,
    };
  }

  function handlePointerDown(e) {
    const position = getPosition(e);

    if (selectedShape) {
      setStrokes((previous) => [
        ...previous,
        {
          type: "stamp",
          shape: selectedShape,
          color,
          ...position,
        },
      ]);
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);

    setDrawing(true);
    setStrokes((previous) => [
      ...previous,
      {
        type: "line",
        color,
        points: [position],
      },
    ]);
  }

  function handlePointerMove(e) {
    if (!drawing) return;

    const position = getPosition(e);

    setStrokes((previous) => {
      const updated = [...previous];
      const last = updated[updated.length - 1];

      if (last?.type === "line") {
        updated[updated.length - 1] = {
          ...last,
          points: [...last.points, position],
        };
      }

      return updated;
    });
  }

  function handlePointerUp() {
    setDrawing(false);
  }

  const allColors = showSecretColors
    ? [...COLORS, ...SECRET_COLORS]
    : COLORS;

  const allShapes = showSecretShapes
    ? [...SHAPES, ...SECRET_SHAPES]
    : SHAPES;

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <h1 style={styles.heading}>A Little Canvas</h1>

        <p style={styles.subtitle}>
          Make something with what you have.
        </p>

        <div style={styles.toolbar}>
          {/* Colors */}
          <div style={styles.group}>
            {allColors.map((c) => (
              <button
                key={c.value}
                title={c.name}
                onClick={() => setColor(c.value)}
                style={{
                  ...styles.swatch,
                  background: c.value,
                  outline:
                    color === c.value
                      ? "2px solid #333"
                      : "none",
                  outlineOffset: "3px",
                }}
              />
            ))}
          </div>

          <div style={styles.divider} />

          {/* Shape stamps */}
          <div style={styles.group}>
            <button
              title="Brush"
              onClick={() => setSelectedShape(null)}
              style={{
                ...styles.shapeButton,
                border:
                  selectedShape === null
                    ? "2px solid #333"
                    : "1px solid #ddd",
              }}
            >
              ✎
            </button>

            {allShapes.map((shape) => (
              <button
                key={shape.value}
                title={shape.name}
                onClick={() => setSelectedShape(shape.value)}
                style={{
                  ...styles.shapeButton,
                  color,
                  border:
                    selectedShape === shape.value
                      ? "2px solid #333"
                      : "1px solid #ddd",
                }}
              >
                {shape.symbol}
              </button>
            ))}
          </div>

          <div style={styles.divider} />

          {/* Actions */}
          <div style={styles.group}>
            <button
              style={styles.button}
              onClick={() =>
                setStrokes((previous) => previous.slice(0, -1))
              }
            >
              Undo
            </button>

            <button
              style={styles.button}
              onClick={() => setStrokes([])}
            >
              Clear
            </button>
          </div>
        </div>

        <div style={styles.canvasWrapper}>
          <svg
            ref={svgRef}
            viewBox="0 0 800 500"
            preserveAspectRatio="none"
            style={{
              ...styles.canvas,
              cursor: selectedShape ? "copy" : "crosshair",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <rect width="800" height="500" fill="white" />

            {strokes.map((item, index) => {
              if (item.type === "stamp") {
                return <ShapeStamp key={index} stamp={item} />;
              }

              return (
                <polyline
                  key={index}
                  points={item.points
                    .map((p) => `${p.x},${p.y}`)
                    .join(" ")}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>
        </div>

        <p style={styles.hint}>
          {showSecretShapes
            ? "You discovered more shapes."
            : " "}
          {showSecretColors
            ? " You discovered more colors."
            : " "}
          {!showSecretShapes && !showSecretColors
            ? " "
            : ""}
        </p>
      </div>
    </div>
  );
}
