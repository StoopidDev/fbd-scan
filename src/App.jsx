import { useState } from "react";
import CameraView from "./components/CameraView";
import FBDDisplay from "./components/FBDDisplay";
import ScanButton from "./components/ScanButton";
import "./App.css";

// 🧠 REACT FACT #1: This is a "Component"
// Think of a component like a LEGO brick. Each brick does one job.
// App.jsx is the BIG brick that holds all the smaller bricks together.
// Every component is just a function that returns something visual (JSX).

export default function App() {

  // 🧠 REACT FACT #2: useState — the memory of your component
  // Normal variables vanish when the screen updates. useState "remembers" things.
  // It gives you: [theValue, aFunctionToChangeIt]
  // When you call the change function → screen automatically re-renders. Magic!

  const [phase, setPhase] = useState("idle"); 
  // phase can be: "idle" | "camera" | "scanning" | "result"

  const [capturedImage, setCapturedImage] = useState(null); 
  // stores the photo as a base64 string (a long text that IS the image)

  const [fbdData, setFbdData] = useState(null);
  // stores the AI's response about forces

  const [error, setError] = useState(null);
  
  const [userScenario, setUserScenario] = useState("");
  // lets the user describe what's happening (e.g. "swinging pendulum at 30 degrees")

  // 🧠 REACT FACT #3: Functions inside components
  // These are just normal JS functions, but they live inside the component
  // so they can access and change the state above. Like inner helpers!

  const handleScanStart = () => {
    setError(null);
    setFbdData(null);
    setPhase("camera");
  };

  const handleCapture = async (imageBase64) => {
    setCapturedImage(imageBase64);
    setPhase("scanning");
    await analyzeWithAI(imageBase64, userScenario);
  };

  const handleReset = () => {
    setPhase("idle");
    setCapturedImage(null);
    setFbdData(null);
    setError(null);
  };

  // 🧠 REACT FACT #4: async/await
  // "async" means this function does something that takes time (like calling the AI).
  // "await" means "pause here and WAIT for the result before continuing."
  // Without await, your code would zoom past and get undefined instead of the answer!

  // 🧠 REACT FACT: We now use Puter.js — ZERO API key needed!
  // Puter.js is a free cloud library that gives us access to AI models
  // directly from the browser. No quota issues, no billing, no key!
  // We load it via a <script> tag in index.html and use window.puter here.

  const analyzeWithAI = async (imageBase64, scenario = "") => {
    try {
      const scenarioContext = scenario
        ? `IMPORTANT: The user says this object is: "${scenario}". Use this to determine the correct physics scenario.`
        : "Determine the scenario from the image alone.";

      const prompt = `You are a university physics professor. Analyze this image and identify the object and its EXACT physical scenario.
${scenarioContext}

SCENARIO DETECTION — identify which case applies:
- PENDULUM swinging at angle θ: T (along string toward pivot, at angle), Fg (straight down), F_net (centripetal, toward pivot center). NOT equilibrium. T = mg·cos(θ) + mv²/L
- PENDULUM at rest (hanging still): T (straight up), Fg (straight down). Equilibrium. T = mg
- INCLINED PLANE: Weight (straight down), Normal (perpendicular to surface), Friction (along surface opposing motion). May or may not be equilibrium.
- OBJECT IN FREE FALL: Only Fg downward. a = g = 9.8 m/s²
- OBJECT ON FLAT SURFACE (static): Normal (up), Weight (down). Equilibrium.
- OBJECT ON FLAT SURFACE (sliding): Normal (up), Weight (down), Friction (opposing motion), Applied Force. Check equilibrium.
- PROJECTILE: Fg down, Air Resistance opposing velocity direction.
- FLOATING/SUBMERGED: Buoyancy (up), Weight (down).
- HANGING by string/rope (stationary): Tension (up), Weight (down). Equilibrium.
- SPRING system: Spring force, Weight, possibly Normal.

RULES:
1. ALWAYS include Weight/Gravity (Fg) pointing straight DOWN. Every object has it.
2. NEVER mark a swinging pendulum as equilibrium — it has centripetal acceleration.
3. For inclined planes, decompose weight into parallel and perpendicular components.
4. isEquilibrium = true ONLY if the object is completely stationary with zero acceleration.
5. Directions: "up", "down", "left", "right", "up-left", "up-right", "down-left", "down-right"
6. Include F_net as a force if there is a net force (non-equilibrium cases).

Return ONLY valid JSON (no markdown, no explanation):
{
  "objectName": "specific object name",
  "objectShape": "box" or "circle" or "triangle",
  "scenario": "precise physics scenario description",
  "forces": [
    {
      "name": "Full force name",
      "symbol": "standard symbol (Fg, T, N, f, Fn, Fb, Fnet)",
      "direction": "one of the 8 directions listed above",
      "magnitude": "formula or estimated value with unit",
      "color": "distinct hex color — use a different color per force",
      "description": "plain English: what causes this force and what it does"
    }
  ],
  "netForce": "direction and cause of net force, or 'zero — object in equilibrium'",
  "isEquilibrium": true or false,
  "formula": "the main equation for this scenario with variable definitions"
}`;
;

      // Convert base64 to a File object so puter.ai.chat can read the image
      const byteChars = atob(imageBase64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const imageFile = new File([byteArr], "scan.jpg", { type: "image/jpeg" });

      // puter.ai.chat works like texting the AI — pass text + image together
      // It returns a response object with a .message.content string
      const response = await window.puter.ai.chat(
        [
          { role: "user", content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]}
        ],
        { model: "gemini-2.0-flash" }
      );

      // Extract the text from the response
      const rawText = typeof response === "string"
        ? response
        : response?.message?.content ?? JSON.stringify(response);

      // Clean and parse JSON — same as always!
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      setFbdData(parsed);
      setPhase("result");

    } catch (err) {
      setError(`Something went wrong: ${err.message}`);
      setPhase("result");
    }
  };

  // 🧠 REACT FACT #5: JSX — HTML inside JavaScript
  // This looks like HTML but it's actually JSX. React transforms it into real DOM.
  // Key differences from HTML:
  //   - Use "className" not "class" (class is a reserved JS word)
  //   - Use {curlyBraces} to inject JavaScript values
  //   - Self-close empty tags: <img /> not <img>
  //   - Event handlers: onClick={function} not onclick="function()"

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">⚛</span>
          <div>
            <h1>PhysicsScan</h1>
            <p>Free Body Diagram Generator</p>
          </div>
        </div>
        <div className="phase-badge" data-phase={phase}>
          {phase === "idle" && "Ready"}
          {phase === "camera" && " Camera Active"}
          {phase === "scanning" && " Analyzing..."}
          {phase === "result" && " Complete"}
        </div>
      </header>

      <main className="app-main">
        {/* 🧠 REACT FACT #6: Conditional Rendering
            In React you show/hide things with JavaScript conditions.
            {phase === "idle" && <Component />} means:
            "IF phase is idle, THEN show this component"
            It's like an if-statement inside your visuals! */}

        {phase === "idle" && (
          <div className="idle-screen">
            <div className="hero-visual">
              <div className="orbit-ring ring-1"></div>
              <div className="orbit-ring ring-2"></div>
              <div className="orbit-ring ring-3"></div>
              <div className="center-atom">
                <span>FBD</span>
              </div>
            </div>
            <h2>Point at any object</h2>
            <p>The AI will detect it and generate a complete<br/>Free Body Diagram with all acting forces</p>
            <div className="scenario-input-wrap">
              <label className="scenario-label">Describe the situation (optional)</label>
              <input
                className="scenario-input"
                type="text"
                placeholder="e.g. swinging pendulum at 30°, box sliding down ramp..."
                value={userScenario}
                onChange={(e) => setUserScenario(e.target.value)}
              />
              <p className="scenario-hint"> This helps the AI pick the right forces!</p>
            </div>
            <ScanButton onClick={handleScanStart} />
            <div className="examples-row">
              <span>Try:  Box</span>
              <span> Ball</span>
              <span> Phone</span>
              <span> Cup</span>
            </div>
          </div>
        )}

        {phase === "camera" && (
          <CameraView onCapture={handleCapture} onCancel={handleReset} />
        )}

        {phase === "scanning" && (
          <div className="scanning-screen">
            <div className="scan-animation">
              <img src={`data:image/jpeg;base64,${capturedImage}`} alt="captured" className="captured-preview" />
              <div className="scan-overlay">
                <div className="scan-line"></div>
              </div>
            </div>
            <p className="scanning-text"> AI is analyzing forces...</p>
            <p className="scanning-sub">Identifying object · Calculating forces · Building FBD</p>
          </div>
        )}

        {phase === "result" && (
          <FBDDisplay 
            fbdData={fbdData} 
            error={error}
            capturedImage={capturedImage}
            onReset={handleReset} 
          />
        )}
      </main>
    </div>
  );
}