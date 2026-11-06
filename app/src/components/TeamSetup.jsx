import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

export default function TeamSetup({
  open,
  names,
  scores,
  labels,
  onSave,
  onClose,
  onResetScores,
}) {
  const [draft, setDraft] = useState(names);

  useEffect(() => {
    if (open) setDraft(names);
  }, [open, names]);

  function updateName(index, value) {
    setDraft((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  function resetScores() {
    if (typeof window !== 'undefined' && window.confirm(labels.resetConfirm)) {
      onResetScores();
    }
  }

  return (
    <Modal
      open={open}
      title={labels.title}
      onClose={onClose}
      closeLabel={labels.close}
      className="team-setup-modal"
    >
      <p className="team-setup-lead">{labels.lead}</p>

      {[0, 1].map((index) => (
        <label className="team-setup-field" key={index}>
          <span>{index === 0 ? labels.teamOne : labels.teamTwo}</span>
          <input
            className="team-setup-input"
            type="text"
            maxLength={24}
            value={draft[index] ?? ''}
            placeholder={index === 0 ? labels.teamOne : labels.teamTwo}
            onChange={(event) => updateName(index, event.target.value)}
            onFocus={(event) => event.target.select()}
          />
        </label>
      ))}

      <div className="team-setup-scores">
        {[0, 1].map((index) => (
          <div className="team-setup-score" key={index}>
            <span>{names?.[index]}</span>
            <b>
              {scores?.[index] ?? 0} {labels.points}
            </b>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="primary-btn full"
        onClick={() => onSave(draft)}
      >
        {labels.save}
      </button>

      <button type="button" className="team-setup-reset" onClick={resetScores}>
        {labels.resetScores}
      </button>
    </Modal>
  );
}
