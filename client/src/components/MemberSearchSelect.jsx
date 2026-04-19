import { useMemo, useState } from 'react';

export default function MemberSearchSelect({
  members,
  value,
  onChange,
  placeholder = 'Search members...',
  emptySelectionLabel = 'No member selected',
  helperText = 'Search and select a member from the matches below.',
  showRosterOnFocus = false,
  rosterLimit = 50
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const selectedMember = useMemo(() => {
    return members.find((member) => String(member.id) === String(value));
  }, [members, value]);

  const sortedMembers = useMemo(() => (
    [...members].sort((left, right) => {
      const leftName = `${left.first_name || ''} ${left.last_name || ''}`.trim().toLowerCase();
      const rightName = `${right.first_name || ''} ${right.last_name || ''}`.trim().toLowerCase();
      return leftName.localeCompare(rightName);
    })
  ), [members]);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      if (!showRosterOnFocus || !isOpen) {
        return [];
      }

      return sortedMembers.slice(0, rosterLimit);
    }

    return sortedMembers
      .filter((member) => {
        const fullName = `${member.first_name || ''} ${member.last_name || ''}`
          .trim()
          .toLowerCase();
        const email = (member.email || '').toLowerCase();

        return fullName.includes(normalizedQuery) || email.includes(normalizedQuery);
      })
      .slice(0, 12);
  }, [isOpen, query, rosterLimit, showRosterOnFocus, sortedMembers]);

  const hasQuery = query.trim().length > 0;
  const showResults = isOpen && (hasQuery || showRosterOnFocus);

  return (
    <div className="search-select">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="search-select-input"
        disabled={members.length === 0}
      />

      {selectedMember ? (
        <div className="search-select-current">
          <span className="meta-text">Selected:</span>{' '}
          {selectedMember.first_name} {selectedMember.last_name}
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              onChange('');
            }}
          >
            Clear
          </button>
        </div>
      ) : (
        <p className="section-note">{helperText}</p>
      )}

      {!selectedMember && value === '' && (
        <div className="search-select-empty">{emptySelectionLabel}</div>
      )}

      {showResults && (
        <div className="search-select-results">
          {members.length === 0 ? (
            <p className="empty-state">No members available.</p>
          ) : filteredMembers.length === 0 ? (
            <p className="empty-state">No matching members.</p>
          ) : !hasQuery && showRosterOnFocus ? (
            <>
              <p className="section-note search-select-roster-note">
                Showing the first {Math.min(rosterLimit, filteredMembers.length)} available members.
                Start typing to narrow the roster.
              </p>
              {filteredMembers.map((member) => {
                const isSelected = String(member.id) === String(value);

                return (
                  <button
                    key={member.id}
                    type="button"
                    className={`search-select-option${isSelected ? ' selected' : ''}`}
                    onClick={() => {
                      setQuery('');
                      setIsOpen(false);
                      onChange(String(member.id));
                    }}
                  >
                    <span className="search-select-option-main">
                      {member.first_name} {member.last_name}
                    </span>
                    {member.email ? (
                      <span className="search-select-option-subtext meta-text">{member.email}</span>
                    ) : null}
                  </button>
                );
              })}
            </>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = String(member.id) === String(value);

              return (
                <button
                  key={member.id}
                  type="button"
                  className={`search-select-option${isSelected ? ' selected' : ''}`}
                  onClick={() => {
                    setQuery('');
                    setIsOpen(false);
                    onChange(String(member.id));
                  }}
                >
                  <span className="search-select-option-main">
                    {member.first_name} {member.last_name}
                  </span>
                  {member.email ? (
                    <span className="search-select-option-subtext meta-text">{member.email}</span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
