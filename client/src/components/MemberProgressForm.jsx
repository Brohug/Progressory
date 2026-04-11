import { useState } from 'react';
import api from '../api/axios';

export default function MemberProgressForm({
  memberId,
  topics,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    curriculum_topic_id: '',
    status: 'introduced',
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
      setError(err.response?.data?.message || 'Failed to save member progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <h4>Update Member Progress</h4>

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
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="not_started">not_started</option>
            <option value="introduced">introduced</option>
            <option value="developing">developing</option>
            <option value="competent">competent</option>
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
    </section>
  );
}