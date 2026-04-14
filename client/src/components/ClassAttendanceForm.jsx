import { useState } from 'react';
import api from '../api/axios';
import { formatLabel } from '../utils/formatLabel';

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
            disabled={members.length === 0}
          >
            <option value="">
              {members.length === 0 ? 'No members available' : 'Select a member'}
            </option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </select>
          <p className="section-note">
            {members.length === 0
              ? 'No active members are available for this class yet.'
              : 'Select a member, then click Add Attendance.'}
          </p>
        </div>

        <div>
          <label>Attendance Status</label>
          <select
            name="attendance_status"
            value={formData.attendance_status}
            onChange={handleChange}
          >
            <option value="present">{formatLabel('present')}</option>
            <option value="absent">{formatLabel('absent')}</option>
          </select>
        </div>

        <div className="inline-actions">
          <button type="submit" disabled={isSubmitting || !formData.member_id || members.length === 0}>
            {isSubmitting ? 'Adding...' : 'Add Attendance'}
          </button>
        </div>
      </form>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
