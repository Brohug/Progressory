import { useState } from 'react';
import api from '../api/axios';
import { formatSentenceLabel } from '../utils/formatLabel';
import TopicSearchSelect from './TopicSearchSelect';

export default function ClassTopicsForm({
  classId,
  topics,
  suggestedTopics = [],
  defaultProgramId = '',
  onTopicCreated,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    curriculum_topic_id: '',
    coverage_type: 'taught',
    focus_level: 'focus',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [quickAddData, setQuickAddData] = useState({
    title: '',
    topic_type: 'technique'
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTopicChange = (topicId) => {
    setFormData((prev) => ({
      ...prev,
      curriculum_topic_id: topicId
    }));
  };

  const handleQuickAddChange = (e) => {
    setQuickAddData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleOpenQuickAdd = (title) => {
    setQuickAddData({
      title,
      topic_type: 'technique'
    });
    setShowQuickAdd(true);
    setMessage('');
    setError('');
  };

  const handleCreateTopic = async () => {
    if (!quickAddData.title.trim()) {
      setError('Topic title is required.');
      return;
    }

    try {
      setIsCreatingTopic(true);
      setMessage('');
      setError('');

      const response = await api.post('/topics', {
        program_id: defaultProgramId ? Number(defaultProgramId) : null,
        parent_topic_id: null,
        title: quickAddData.title.trim(),
        topic_type: quickAddData.topic_type,
        description: ''
      });

      const createdTopic = response.data?.topic;

      if (createdTopic?.id) {
        if (onTopicCreated) {
          await onTopicCreated(createdTopic);
        }
        handleTopicChange(String(createdTopic.id));
      }

      setShowQuickAdd(false);
      setQuickAddData({
        title: '',
        topic_type: 'technique'
      });
      setMessage('Topic created and selected successfully.');
    } catch (err) {
      console.error('Failed to create topic:', err);
      setError(err.response?.data?.message || 'Failed to create topic.');
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.curriculum_topic_id) {
      setError('Select a topic before saving it to the class.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        curriculum_topic_id: Number(formData.curriculum_topic_id),
        coverage_type: formData.coverage_type,
        focus_level: formData.focus_level,
        notes: formData.notes || null
      };

      await api.post(`/classes/${classId}/topics`, payload);

      setMessage('Topic saved to the class successfully.');
      setFormData({
        curriculum_topic_id: '',
        coverage_type: 'taught',
        focus_level: 'focus',
        notes: ''
      });

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error('Failed to add topic:', err);
      setError(err.response?.data?.message || 'Couldn\'t save that topic just now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <h4>Add Topic to Class</h4>

      <form className="form-grid" onSubmit={handleSubmit}>
        {suggestedTopics.length > 0 && (
          <div>
            <label>Suggested Topics</label>
            <div className="suggestion-chip-row">
              {suggestedTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={`suggestion-chip${
                    String(formData.curriculum_topic_id) === String(topic.id) ? ' selected' : ''
                  }`}
                  onClick={() => handleTopicChange(String(topic.id))}
                >
                  {topic.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label>Topic</label>
          <TopicSearchSelect
            topics={topics}
            value={formData.curriculum_topic_id}
            onChange={handleTopicChange}
            placeholder="Search topics for this class..."
            onCreateOption={handleOpenQuickAdd}
          />
        </div>

        {showQuickAdd && (
          <div className="quick-add-panel">
            <label>New Topic Title</label>
            <input
              type="text"
              name="title"
              value={quickAddData.title}
              onChange={handleQuickAddChange}
            />

            <label>Topic Type</label>
            <select
              name="topic_type"
              value={quickAddData.topic_type}
              onChange={handleQuickAddChange}
            >
              <option value="position">{formatSentenceLabel('position')}</option>
              <option value="technique">{formatSentenceLabel('technique')}</option>
              <option value="concept">{formatSentenceLabel('concept')}</option>
              <option value="submission">{formatSentenceLabel('submission')}</option>
              <option value="escape">{formatSentenceLabel('escape')}</option>
              <option value="takedown">{formatSentenceLabel('takedown')}</option>
              <option value="drill_theme">{formatSentenceLabel('drill_theme')}</option>
            </select>

            <div className="inline-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCreateTopic}
                disabled={isCreatingTopic}
              >
                {isCreatingTopic ? 'Creating Topic...' : 'Create Topic'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowQuickAdd(false)}
                disabled={isCreatingTopic}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div>
          <label>Coverage Type</label>
          <select
            name="coverage_type"
            value={formData.coverage_type}
            onChange={handleChange}
          >
            <option value="taught">{formatSentenceLabel('taught')}</option>
            <option value="reviewed">{formatSentenceLabel('reviewed')}</option>
          </select>
        </div>

        <div>
          <label>Focus Level</label>
          <select
            name="focus_level"
            value={formData.focus_level}
            onChange={handleChange}
          >
            <option value="focus">{formatSentenceLabel('focus')}</option>
            <option value="secondary">{formatSentenceLabel('secondary')}</option>
            <option value="review">{formatSentenceLabel('review')}</option>
          </select>
        </div>

        <div>
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="inline-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Topic'}
          </button>
        </div>
      </form>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
