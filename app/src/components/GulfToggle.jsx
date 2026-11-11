/**
 * زرار «الكرة الخليجية» — بيبدّل الألعاب الأربع المعنية (المسار، 100 نقطة، توب 3، التشكيلات)
 * بين الأسئلة العامة والأسئلة الخليجية بس. الأسئلة الخليجية مش بتظهر خالص من غيره.
 */
export default function GulfToggle({ ui, active, onToggle }) {
  const labels = ui.gulfToggle;

  return (
    <div className="gulf-toggle-row">
      <button
        type="button"
        className={`gulf-toggle ${active ? 'is-active' : ''}`}
        aria-pressed={active}
        aria-label={labels.aria}
        title={labels.aria}
        onClick={onToggle}
      >
        <span className="gulf-toggle-icon" aria-hidden="true">
          🌊
        </span>
        <span className="gulf-toggle-label">{labels.label}</span>
        <span className="gulf-toggle-state">{active ? labels.on : labels.off}</span>
      </button>
    </div>
  );
}
