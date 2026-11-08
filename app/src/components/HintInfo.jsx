import Modal from './Modal.jsx';

export default function HintInfo({ open, info, onClose }) {
  return (
    <Modal
      open={open}
      title={info.title}
      onClose={onClose}
      closeLabel={info.close}
    >
      <p className="help-lead">{info.lead}</p>

      <ul className="legend hint-info-list">
        {info.points.map((text) => (
          <li key={text}>
            <span className="legend-dot hint-dot" aria-hidden="true">
              💡
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <button type="button" className="primary-btn full" onClick={onClose}>
        {info.dismiss}
      </button>
    </Modal>
  );
}
