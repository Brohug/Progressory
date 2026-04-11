import { useState } from 'react';
import api from '../api/axios';

export default function ClassTrainingEntriesForm({
  classId,
  trainingMethods,
  trainingScenarios,
  topics,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    training_method_id: '',
    training_scenario_id: '',
    curriculum_topic_id: '',
    segment_title: '',
    segment_order: '1',
    duration_minutes: '',
    constraints_text: '',
    win_condition_top: '',
    win_condition_bottom: '',
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

    if (!formData.training_method_id) {
      setError('Please select a training method.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        training_method_id: Number(formData.training_method_id),
        training_scenario_id: formData.training_scenario_id
          ? Number(formData.training_scenario_id)
          : null,
        curriculum_topic_id: formData.curriculum_topic_id
          ? Number(formData.curriculum_topic_id)
          : null,
        segment_title: formData.segment_title || null,
        segment_order: formData.segment_order ? Number(formData.segment_order) : 1,
        duration_minutes: formData.duration_minutes
          ? Number(formData.duration_minutes)
          : null,
        constraints_text: formData.constraints_text || null,
        win_condition_top: formData.win_condition_top || null,
        win_condition_bottom: formData.win_condition_bottom || null,
        notes: formData.notes || null
      };

      await api.post(`/classes/${classId}/training-entries`, payload);

      setMessage('Training entry added successfully.');
      setFormData({
        training_method_id: '',
        training_scenario_id: '',
        curriculum_topic_id: '',
        segment_title: '',
        segment_order: '1',
        duration_minutes: '',
        constraints_text: '',
        win_condition_top: '',
        win_condition_bottom: '',
        notes: ''
      });

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error('Failed to add training entry:', err);
      setError(err.response?.data?.message || 'Failed to add training entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <h4>Add Training Entry</h4>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div>
          <label>Training Method</label>
          <select
            name="training_method_id"
            value={formData.training_method_id}
            onChange={handleChange}
          >
            <option value="">Select a training method</option>
            {trainingMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Training Scenario</label>
          <select
            name="training_scenario_id"
            value={formData.training_scenario_id}
            onChange={handleChange}
          >
            <option value="">No scenario</option>
            {trainingScenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Curriculum Topic</label>
          <select
            name="curriculum_topic_id"
            value={formData.curriculum_topic_id}
            onChange={handleChange}
          >
            <option value="">No topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Segment Title</label>
          <input
            type="text"
            name="segment_title"
            value={formData.segment_title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Segment Order</label>
          <input
            type="number"
            name="segment_order"
            value={formData.segment_order}
            onChange={handleChange}
            min="1"
          />
        </div>

        <div>
          <label>Duration Minutes</label>
          <input
            type="number"
            name="duration_minutes"
            value={formData.duration_minutes}
            onChange={handleChange}
            min="1"
          />
        </div>

        <div>
          <label>Constraints</label>
          <textarea
            name="constraints_text"
            value={formData.constraints_text}
            onChange={handleChange}
            rows="2"
          />
        </div>

        <div>
          <label>Top Win Condition</label>
          <input
            type="text"
            name="win_condition_top"
            value={formData.win_condition_top}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Bottom Win Condition</label>
          <input
            type="text"
            name="win_condition_bottom"
            value={formData.win_condition_bottom}
            onChange={handleChange}
          />
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
            {isSubmitting ? 'Adding...' : 'Add Training Entry'}
          </button>
        </div>
      </form>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}