import { useEffect, useState } from 'react';

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
  stickyHeader = false,
  mobileStickyToggleMode = 'default'
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const [isMobileLayout, setIsMobileLayout] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia('(max-width: 640px)').matches;
  });
  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const useCompactStickyToggle = stickyHeader && isMobileLayout && mobileStickyToggleMode === 'default';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const handleMediaQueryChange = (event) => {
      setIsMobileLayout(event.matches);
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, []);

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.(!isOpen);
      return;
    }

    setInternalIsOpen((value) => !value);
  };

  return (
    <section className={`page-section compact-form-shell expandable-section${isOpen ? ' is-open' : ''}${stickyHeader ? ' is-sticky-header' : ''}${useCompactStickyToggle ? ' is-mobile-sticky-shell' : ''}${className ? ` ${className}` : ''}`}>
      <div className={`compact-form-header${useCompactStickyToggle ? ' is-mobile-sticky-header' : ''}`}>
        <div>
          <h3>{title}</h3>
          {note ? <p className="section-note">{note}</p> : null}
          {useCompactStickyToggle ? (
            <p className="mobile-shell-collapsed-note">
              {isOpen
                ? 'Tap the arrow to tuck this section away while you read.'
                : 'Section tucked away. Tap the arrow to reopen it.'}
            </p>
          ) : null}
        </div>
        <div className={`expandable-section-actions${useCompactStickyToggle ? ' is-mobile-sticky-actions' : ''}`}>
          {!useCompactStickyToggle ? actions : null}
          <button
            className={useCompactStickyToggle ? 'secondary-button mobile-sticky-corner-toggle expandable-mobile-toggle' : 'secondary-button'}
            type="button"
            onClick={handleToggle}
            aria-label={isOpen ? `Hide ${title}` : `Open ${title}`}
            title={isOpen ? `Hide ${title}` : `Open ${title}`}
          >
            {useCompactStickyToggle ? (isOpen ? '↑' : '↓') : (isOpen ? `Hide ${title}` : `Open ${title}`)}
          </button>
          {!useCompactStickyToggle ? actionsAfterToggle : null}
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
