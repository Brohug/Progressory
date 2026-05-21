import { useState } from 'react';

export default function ExpandableSection({
  title,
  note = '',
  summary = '',
  summaryMeta = null,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  className = '',
  children,
  actions = null,
  actionsAfterToggle = null,
  onToggle = null,
  stickyHeader = false
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
    <section className={`page-section compact-form-shell expandable-section${isOpen ? ' is-open' : ''}${stickyHeader ? ' is-sticky-header' : ''}${className ? ` ${className}` : ''}`}>
      <div className="compact-form-header">
        <div>
          <h3>{title}</h3>
          {note ? <p className="section-note">{note}</p> : null}
        </div>
        <div className="expandable-section-actions">
          {actions}
          <button className="secondary-button" type="button" onClick={handleToggle}>
            {isOpen ? `Hide ${title}` : `Open ${title}`}
          </button>
          {actionsAfterToggle}
        </div>
      </div>

      {!isOpen ? (
        <div className="decision-tree-collapsible-summary">
          <p className="meta-text">{summary || `Open ${title} when you are ready to work on it.`}</p>
          {summaryMeta?.length ? (
            <div className="expandable-section-summary-meta">
              {summaryMeta.map((item) => (
                <span key={`${title}-${item}`} className="expandable-section-summary-chip">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : children}
    </section>
  );
}
