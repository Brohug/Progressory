import { useState } from 'react';

export default function ExpandableSection({
  title,
  note = '',
  summary = '',
  defaultOpen = false,
  isOpen: controlledIsOpen,
  className = '',
  children,
  actions = null,
  onToggle = null
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.(!isOpen);
      return;
    }

    setInternalIsOpen((value) => !value);
  };

  return (
    <section className={`page-section compact-form-shell expandable-section${isOpen ? ' is-open' : ''}${className ? ` ${className}` : ''}`}>
      <div className="compact-form-header">
        <div>
          <h3>{title}</h3>
          {note ? <p className="section-note">{note}</p> : null}
        </div>
        <div className="expandable-section-actions">
          {actions}
          <button className="secondary-button" type="button" onClick={handleToggle}>
            {isOpen ? 'Hide section' : 'Expand section'}
          </button>
        </div>
      </div>

      {!isOpen ? (
        <div className="decision-tree-collapsible-summary">
          <p className="meta-text">{summary || 'Expand this section when you are ready to work on it.'}</p>
        </div>
      ) : children}
    </section>
  );
}
