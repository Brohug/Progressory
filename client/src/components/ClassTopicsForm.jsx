import { useState } from 'react';
import api from '../api/axios';
import { formatLabel } from '../utils/formatLabel';

export default function ClassTopicsForm({ classId, topics, onSuccess }) {
  const [formData, setFormData] = useState({
    curriculum_topic_id: '',
    coverage_type: 'taught',
    focus_level: 'focus',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.curriculum_topic_id) {
      setError('Please select a topic.');
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

      setMessage('Topic added successfully.');
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
      setError(err.response?.data?.message || 'Failed to add topic.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <h4>Add Topic to Class</h4>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div>
          <label>Topic</label>
          <select
            name="curriculum_topic_id"
            value={formData.curriculum_topic_id}
            onChange={handleChange}
          >
            <option value="">Select a topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Coverage Type</label>
          <select
            name="coverage_type"
            value={formData.coverage_type}
            onChange={handleChange}
          >
            <option value="taught">{formatLabel('taught')}</option>
            <option value="reviewed">{formatLabel('reviewed')}</option>
          </select>
        </div>

        <div>
          <label>Focus Level</label>
          <select
            name="focus_level"
            value={formData.focus_level}
            onChange={handleChange}
          >
            <option value="focus">{formatLabel('focus')}</option>
            <option value="secondary">{formatLabel('secondary')}</option>
            <option value="review">{formatLabel('review')}</option>
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
            {isSubmitting ? 'Adding...' : 'Add Topic'}
          </button>
        </div>
      </form>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
