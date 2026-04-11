import { useState } from 'react';
import api from '../api/axios';

export default function ClassAttendanceForm({
  classId,
  members,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    member_id: '',
    attendance_status: 'present'
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

    if (!formData.member_id) {
      setError('Please select a member.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        member_id: Number(formData.member_id),
        attendance_status: formData.attendance_status
      };

      await api.post(`/classes/${classId}/members`, payload);

      setMessage('Member added to class successfully.');
      setFormData({
        member_id: '',
        attendance_status: 'present'
      });

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error('Failed to add member to class:', err);
      setError(err.response?.data?.message || 'Failed to add member to class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <h4>Add Attendance</h4>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div>
          <label>Member</label>
          <select
            name="member_id"
            value={formData.member_id}
            onChange={handleChange}
          >
            <option value="">Select a member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Attendance Status</label>
          <select
            name="attendance_status"
            value={formData.attendance_status}
            onChange={handleChange}
          >
            <option value="present">present</option>
            <option value="absent">absent</option>
            <option value="excused">excused</option>
          </select>
        </div>

        <div className="inline-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Member to Class'}
          </button>
        </div>
      </form>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}