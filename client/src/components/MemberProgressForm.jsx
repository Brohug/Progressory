import { useState } from 'react';
import api from '../api/axios';
import { formatSentenceLabel } from '../utils/formatLabel';
import TopicSearchSelect from './TopicSearchSelect';

export default function MemberProgressForm({
  memberId,
  topics,
  suggestedTopics = [],
  defaultProgramId = '',
  onTopicCreated,
  onSuccess,
  compact = false
}) {
  const [formData, setFormData] = useState({
    curriculum_topic_id: '',
    status: 'introduced',
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
      setError('Add a topic title before creating it.');
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
      setError(err.response?.data?.message || 'Couldn\'t create that topic just now.');
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.curriculum_topic_id) {
      setError('Select a topic before saving progress.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        curriculum_topic_id: Number(formData.curriculum_topic_id),
        status: formData.status,
        notes: formData.notes || null
      };

      await api.post(`/members/${memberId}/progress`, payload);

      setMessage('Progress saved successfully.');
      setFormData({
        curriculum_topic_id: '',
        status: 'introduced',
        notes: ''
      });

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error('Save member progress error:', err);
      setError(err.response?.data?.message || 'Couldn\'t save progress just now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Container = compact ? 'div' : 'section';

  return (
    <Container className={compact ? '' : 'page-section'}>
      <h4>Update Member Progress</h4>

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
            placeholder="Search topics for member progress..."
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
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="not_started">{formatSentenceLabel('not_started')}</option>
            <option value="introduced">{formatSentenceLabel('introduced')}</option>
            <option value="developing">{formatSentenceLabel('developing')}</option>
            <option value="competent">{formatSentenceLabel('competent')}</option>
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
            {isSubmitting ? 'Saving...' : 'Save Progress'}
          </button>
        </div>
      </form>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </Container>
  );
}
