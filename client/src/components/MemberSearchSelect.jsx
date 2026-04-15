import { useMemo, useState } from 'react';

export default function MemberSearchSelect({
  members,
  value,
  onChange,
  placeholder = 'Search members...',
  emptySelectionLabel = 'No member selected',
  helperText = 'Search and select a member from the matches below.'
}) {
  const [query, setQuery] = useState('');

  const selectedMember = useMemo(() => {
    return members.find((member) => String(member.id) === String(value));
  }, [members, value]);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return members
      .filter((member) => {
        const fullName = `${member.first_name || ''} ${member.last_name || ''}`
          .trim()
          .toLowerCase();
        const email = (member.email || '').toLowerCase();

        return fullName.includes(normalizedQuery) || email.includes(normalizedQuery);
      })
      .slice(0, 12);
  }, [members, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="search-select">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        disabled={members.length === 0}
      />

      {selectedMember ? (
        <div className="search-select-current">
          <span className="meta-text">Selected:</span>{' '}
          {selectedMember.first_name} {selectedMember.last_name}
          <button
            type="button"
            className="secondary-button"
            onClick={() => onChange('')}
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

      {hasQuery && (
        <div className="search-select-results">
          {members.length === 0 ? (
            <p className="empty-state">No members available.</p>
          ) : filteredMembers.length === 0 ? (
            <p className="empty-state">No matching members.</p>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = String(member.id) === String(value);

              return (
                <button
                  key={member.id}
                  type="button"
                  className={`search-select-option${isSelected ? ' selected' : ''}`}
                  onClick={() => onChange(String(member.id))}
                >
                  <span>{member.first_name} {member.last_name}</span>
                  {member.email ? (
                    <span className="meta-text">{member.email}</span>
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
