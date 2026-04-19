import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { formatLabel } from '../utils/formatLabel';
import MemberSearchSelect from './MemberSearchSelect';

export default function ClassAttendanceForm({
  classId,
  members,
  recordedMemberIds = [],
  onSuccess
}) {
  const [formData, setFormData] = useState({
    member_id: '',
    attendance_status: 'present'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingRecordedMemberIds, setPendingRecordedMemberIds] = useState([]);

  useEffect(() => {
    setPendingRecordedMemberIds([]);
  }, [recordedMemberIds]);

  const normalizedRecordedMemberIds = useMemo(
    () => new Set([...recordedMemberIds, ...pendingRecordedMemberIds].map(String)),
    [pendingRecordedMemberIds, recordedMemberIds]
  );

  const availableMembers = useMemo(
    () => members.filter((member) => !normalizedRecordedMemberIds.has(String(member.id))),
    [members, normalizedRecordedMemberIds]
  );
  const recordedCount = normalizedRecordedMemberIds.size;
  const remainingCount = Math.max(members.length - recordedCount, 0);

  useEffect(() => {
    if (formData.member_id && normalizedRecordedMemberIds.has(String(formData.member_id))) {
      setFormData((prev) => ({
        ...prev,
        member_id: ''
      }));
    }
  }, [formData.member_id, normalizedRecordedMemberIds]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleMemberChange = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      member_id: memberId
    }));
  };

  const saveSingleAttendance = async (memberId, attendanceStatus) => {
    if (!memberId) {
      setError('Select a member before saving attendance.');
      return;
    }

    setMessage('');
    setError('');

    try {
      setIsSubmitting(true);

      const payload = {
        member_id: Number(memberId),
        attendance_status: attendanceStatus
      };

      setPendingRecordedMemberIds((prev) => [...new Set([...prev, String(memberId)])]);

      await api.post(`/classes/${classId}/members`, payload);

      setMessage(`Attendance saved as ${formatLabel(attendanceStatus)}.`);
      setFormData({
        member_id: '',
        attendance_status: 'present'
      });

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error('Failed to add member to class:', err);
      setPendingRecordedMemberIds((prev) => (
        prev.filter((pendingMemberId) => String(pendingMemberId) !== String(memberId))
      ));
      setError(err.response?.data?.message || 'Couldn\'t save attendance just now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSingleAttendance(formData.member_id, formData.attendance_status);
  };

  const handleBulkAttendance = async (attendanceStatus) => {
    setMessage('');
    setError('');

    if (availableMembers.length === 0) {
      setError('Everyone available has already been marked for this class.');
      return;
    }

    const memberIds = availableMembers.map((member) => String(member.id));

    try {
      setIsSubmitting(true);
      setPendingRecordedMemberIds((prev) => [...new Set([...prev, ...memberIds])]);

      const response = await api.post(`/classes/${classId}/members/bulk`, {
        member_ids: memberIds.map(Number),
        attendance_status: attendanceStatus
      });

      const addedCount = response.data?.addedCount || 0;
      const skippedCount = response.data?.skippedCount || 0;

      if (addedCount > 0 && skippedCount > 0) {
        setMessage(
          `${addedCount} members marked ${formatLabel(attendanceStatus)}. ${skippedCount} already had attendance recorded.`
        );
      } else if (addedCount > 0) {
        setMessage(`${addedCount} members marked ${formatLabel(attendanceStatus)}.`);
      } else {
        setMessage('Attendance was already recorded for those members.');
      }

      setFormData({
        member_id: '',
        attendance_status: 'present'
      });

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error('Bulk attendance error:', err);
      setPendingRecordedMemberIds((prev) => (
        prev.filter((memberId) => !memberIds.includes(String(memberId)))
      ));
      setError(err.response?.data?.message || 'Couldn\'t save bulk attendance just now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <h4>Add Attendance</h4>
      <div className="class-flow-summary-grid">
        <div className="class-flow-summary-card">
          <span className="meta-text">Still to mark</span>
          <strong>{remainingCount}</strong>
        </div>
        <div className="class-flow-summary-card">
          <span className="meta-text">Already recorded</span>
          <strong>{recordedCount}</strong>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div>
          <label>Member</label>
          <MemberSearchSelect
            members={availableMembers}
            value={formData.member_id}
            onChange={handleMemberChange}
            placeholder="Search members for attendance..."
            showRosterOnFocus
            emptySelectionLabel={
              members.length === 0
                ? 'No members available'
                : availableMembers.length === 0
                  ? 'Everyone available has already been marked'
                  : 'No member selected'
            }
            helperText={
              members.length === 0
                ? 'No active members are available for this class yet.'
                : availableMembers.length === 0
                  ? 'Attendance has already been recorded for everyone currently available in this class.'
                  : 'Click into the member field to browse the roster, or start typing to narrow it down.'
            }
          />
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
          <button
            type="submit"
            disabled={isSubmitting || !formData.member_id || availableMembers.length === 0}
          >
            {isSubmitting ? 'Saving...' : 'Save Attendance'}
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={isSubmitting || availableMembers.length === 0}
            onClick={() => handleBulkAttendance('present')}
          >
            Mark Remaining Present
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={isSubmitting || availableMembers.length === 0}
            onClick={() => handleBulkAttendance('absent')}
          >
            Mark Remaining Absent
          </button>
        </div>
      </form>

      {availableMembers.length > 0 ? (
        <div className="class-attendance-roster">
          <div className="section-header">
            <div>
              <h5>Quick roster</h5>
              <p className="section-note">
                Tap a member to mark them present fast, or use the absent button when needed.
              </p>
            </div>
          </div>

          <div className="class-attendance-roster-list">
            {availableMembers.map((member) => (
              <div key={member.id} className="class-attendance-roster-item">
                <button
                  type="button"
                  className="class-attendance-roster-primary"
                  disabled={isSubmitting}
                  onClick={() => saveSingleAttendance(member.id, 'present')}
                >
                  <span className="search-select-option-main">
                    {member.first_name} {member.last_name}
                  </span>
                  {member.email ? (
                    <span className="search-select-option-subtext meta-text">{member.email}</span>
                  ) : null}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  disabled={isSubmitting}
                  onClick={() => saveSingleAttendance(member.id, 'absent')}
                >
                  Mark Absent
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
