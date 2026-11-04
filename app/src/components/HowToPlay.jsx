import Modal from './Modal.jsx';

const LEGEND_ICONS = ['🔒', '🎲', '🧩', '🎯', '📋'];

export default function HowToPlay({ open, ui, onClose }) {
  const howto = ui.howto;

  return (
    <Modal
      open={open}
      title={howto.title}
      onClose={onClose}
      closeLabel={howto.close}
      className="help-modal"
    >
      <p className="help-lead">{howto.lead}</p>

      <div className="help-clues">
        {howto.examples.map((text, index) => (
          <div className="help-clue" key={text}>
            <span className="clue-index" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <p className="clue-text">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <ul className="legend">
        {howto.legend.map((item, index) => (
          <li key={item.title}>
            <span className="legend-dot" aria-hidden="true">
              {LEGEND_ICONS[index]}
            </span>
            <span>
              <b>{item.title}</b> — {item.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="help-tip">{howto.tip}</div>

      <button type="button" className="primary-btn full" onClick={onClose}>
        {howto.button}
      </button>
    </Modal>
  );
}
