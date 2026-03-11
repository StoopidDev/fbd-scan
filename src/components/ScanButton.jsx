// 🧠 REACT FACT #13: The simplest component
// A component can be as small as this — just a function that takes props
// and returns some JSX. No state, no effects. Pure and simple.
// These are called "presentational" or "dumb" components — they just display things.
// The smarter "container" components (like App.jsx) handle the logic.

export default function ScanButton({ onClick }) {
  return (
    <button className="scan-button" onClick={onClick}>
      <span className="scan-button-inner">
        <span className="scan-icon">⬡</span>
        <span>START SCAN</span>
      </span>
    </button>
  );
}
