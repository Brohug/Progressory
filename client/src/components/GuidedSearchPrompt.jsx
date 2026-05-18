export default function GuidedSearchPrompt({
  prompt,
  onApply,
  onBack = null,
  backLabel = 'Back',
  className = '',
  activeLabel = ''
}) {
  if (!prompt) {
    return null;
  }

  const showsActiveAsOption = prompt.options.some((option) => option.label === activeLabel);

  return (
    <div className={`curriculum-index-guided-search${className ? ` ${className}` : ''}`}>
      <p className="section-note" style={{ marginBottom: '8px' }}>
        <strong>Refine this search:</strong> {prompt.question}
      </p>
      {activeLabel && !showsActiveAsOption ? (
        <div className="guided-search-active-state">
          <span className="meta-text">Current focus</span>
          <span className="suggestion-chip selected">{activeLabel}</span>
        </div>
      ) : null}
      <div className="suggestion-chip-row">
        {onBack ? (
          <button
            type="button"
            className="suggestion-chip suggestion-chip-back"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onBack}
          >
            {backLabel}
          </button>
        ) : null}
        {prompt.options.map((option) => (
          <button
            key={`${prompt.question}-${option.label}`}
            type="button"
            className={`suggestion-chip${option.label === activeLabel ? ' selected' : ''}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onApply(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
