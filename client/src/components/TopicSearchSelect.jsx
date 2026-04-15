import { useMemo, useState } from 'react';

export default function TopicSearchSelect({
  topics,
  value,
  onChange,
  placeholder = 'Search topics...',
  emptySelectionLabel = 'No topic selected',
  helperText = 'Select a topic from the matches below.',
  onCreateOption
}) {
  const [query, setQuery] = useState('');

  const selectedTopic = useMemo(() => {
    return topics.find((topic) => String(topic.id) === String(value));
  }, [topics, value]);

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return topics.slice(0, 12);
    }

    return topics
      .filter((topic) => topic.title.toLowerCase().includes(normalizedQuery))
      .slice(0, 12);
  }, [topics, query]);

  const normalizedQuery = query.trim().toLowerCase();
  const hasExactMatch = topics.some(
    (topic) => topic.title.trim().toLowerCase() === normalizedQuery
  );
  const canCreateFromQuery = Boolean(onCreateOption && normalizedQuery && !hasExactMatch);

  return (
    <div className="search-select">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />

      {selectedTopic ? (
        <div className="search-select-current">
          <span className="meta-text">Selected:</span> {selectedTopic.title}
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

      {!selectedTopic && value === '' && (
        <div className="search-select-empty">{emptySelectionLabel}</div>
      )}

      <div className="search-select-results">
        {canCreateFromQuery && (
          <button
            type="button"
            className="search-select-create"
            onClick={() => onCreateOption(query.trim())}
          >
            Create topic: "{query.trim()}"
          </button>
        )}

        {filteredTopics.length === 0 ? (
          <p className="empty-state">No matching topics.</p>
        ) : (
          filteredTopics.map((topic) => {
            const isSelected = String(topic.id) === String(value);

            return (
              <button
                key={topic.id}
                type="button"
                className={`search-select-option${isSelected ? ' selected' : ''}`}
                onClick={() => onChange(String(topic.id))}
              >
                {topic.title}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
