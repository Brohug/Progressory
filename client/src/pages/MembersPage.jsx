import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import MemberProgressForm from '../components/MemberProgressForm';
import { formatLabel } from '../utils/formatLabel';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [memberProgressMap, setMemberProgressMap] = useState({});
  const [expandedMembers, setExpandedMembers] = useState({});
  const [editingMembers, setEditingMembers] = useState({});
  const [editMemberMap, setEditMemberMap] = useState({});
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState({
    program_id: '',
    first_name: '',
    last_name: '',
    email: '',
    belt_rank: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    const response = await api.get('/members');
    setMembers(response.data);
  };

  const fetchPrograms = async () => {
    const response = await api.get('/programs');
    setPrograms(response.data);
  };

  const fetchTopics = async () => {
    const response = await api.get('/topics');
    setTopics(response.data);
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([fetchMembers(), fetchPrograms(), fetchTopics()]);
      } catch (err) {
        console.error('Load members page error:', err);
        setError(err.response?.data?.message || 'Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const orderedMembers = useMemo(() => {
    const active = members.filter((member) => member.is_active);
    const inactive = members.filter((member) => !member.is_active);

    return showInactive ? [...active, ...inactive] : active;
  }, [members, showInactive]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        program_id: formData.program_id ? Number(formData.program_id) : null,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        belt_rank: formData.belt_rank || null
      };

      await api.post('/members', payload);

      setFormData({
        program_id: '',
        first_name: '',
        last_name: '',
        email: '',
        belt_rank: ''
      });

      await fetchMembers();
    } catch (err) {
      console.error('Create member error:', err);
      setError(err.response?.data?.message || 'Failed to create member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (member) => {
    const confirmed = window.confirm(
      'Deactivate this member? Attendance and progression history will remain, but the member will be marked inactive.'
    );
    if (!confirmed) return;

    try {
      setError('');
      await api.put(`/members/${member.id}`, {
        program_id: member.program_id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email || null,
        belt_rank: member.belt_rank || null,
        is_active: false
      });
      await fetchMembers();
    } catch (err) {
      console.error('Deactivate member error:', err);
      setError(err.response?.data?.message || 'Failed to deactivate member');
    }
  };

  const loadMemberProgress = async (memberId) => {
    try {
      const response = await api.get(`/members/${memberId}/progress`);
      setMemberProgressMap((prev) => ({
        ...prev,
        [memberId]: response.data
      }));
    } catch (err) {
      console.error('Load member progress error:', err);
      setError(err.response?.data?.message || 'Failed to load member progress');
    }
  };

  const toggleMemberProgress = async (memberId) => {
    const isExpanded = expandedMembers[memberId];

    if (!isExpanded && !memberProgressMap[memberId]) {
      await loadMemberProgress(memberId);
    }

    setExpandedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const toggleEditMember = (member) => {
    const isEditing = editingMembers[member.id];

    if (!editMemberMap[member.id]) {
      setEditMemberMap((prev) => ({
        ...prev,
        [member.id]: {
          program_id: member.program_id ? String(member.program_id) : '',
          first_name: member.first_name || '',
          last_name: member.last_name || '',
          email: member.email || '',
          belt_rank: member.belt_rank || '',
          is_active: member.is_active ? 'true' : 'false'
        }
      }));
    }

    setEditingMembers((prev) => ({
      ...prev,
      [member.id]: !prev[member.id]
    }));

    if (isEditing) {
      setEditMemberMap((prev) => ({
        ...prev,
        [member.id]: {
          program_id: member.program_id ? String(member.program_id) : '',
          first_name: member.first_name || '',
          last_name: member.last_name || '',
          email: member.email || '',
          belt_rank: member.belt_rank || '',
          is_active: member.is_active ? 'true' : 'false'
        }
      }));
    }
  };

  const handleEditMemberChange = (memberId, e) => {
    const { name, value } = e.target;

    setEditMemberMap((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [name]: value
      }
    }));
  };

  const handleUpdateMember = async (memberId) => {
    try {
      setError('');

      const editData = editMemberMap[memberId];

      const payload = {
        program_id: editData.program_id ? Number(editData.program_id) : null,
        first_name: editData.first_name,
        last_name: editData.last_name,
        email: editData.email || null,
        belt_rank: editData.belt_rank || null,
        is_active: editData.is_active === 'true'
      };

      await api.put(`/members/${memberId}`, payload);
      await fetchMembers();

      setEditingMembers((prev) => ({
        ...prev,
        [memberId]: false
      }));
    } catch (err) {
      console.error('Update member error:', err);
      setError(err.response?.data?.message || 'Failed to update member');
    }
  };

  const getTopicsForMember = (member) => {
    if (!member.program_id) {
      return topics;
    }

    return topics.filter((topic) => {
      return topic.program_id === null || topic.program_id === member.program_id;
    });
  };

  return (
    <Layout>
      <h2 className="page-title">Members</h2>

      <section className="page-section" style={{ maxWidth: '760px' }}>
        <h3>Create Member</h3>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div>
            <label>Program</label>
            <select
              name="program_id"
              value={formData.program_id}
              onChange={handleChange}
            >
              <option value="">No Program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Belt Rank</label>
            <input
              type="text"
              name="belt_rank"
              value={formData.belt_rank}
              onChange={handleChange}
            />
          </div>

          <div>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Member'}
            </button>
          </div>
        </form>
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="page-section">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <h3 style={{ marginBottom: 0 }}>Member List</h3>
          <button
            className="secondary-button"
            onClick={() => setShowInactive((prev) => !prev)}
          >
            {showInactive ? 'Hide Inactive Members' : 'Show Inactive Members'}
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading members...</p>
        ) : orderedMembers.length === 0 ? (
          <p className="empty-state">No members found.</p>
        ) : (
          <ul className="card-list">
            {orderedMembers.map((member) => (
              <li key={member.id} className="card-item">
                <strong>
                  {member.first_name} {member.last_name}
                </strong>

                <div className="detail-block">
                  <div className="meta-text">Program: {member.program_name || 'None'}</div>
                  <div className="meta-text">Email: {member.email || 'None'}</div>
                  <div className="meta-text">Belt Rank: {member.belt_rank || 'None'}</div>
                  <div className="meta-text">Active: {member.is_active ? 'Yes' : 'No'}</div>
                  {member.created_at && (
                    <div className="meta-text">
                      Created: {new Date(member.created_at).toLocaleString()}
                    </div>
                  )}
                  {member.updated_at && (
                    <div className="meta-text">
                      Updated: {new Date(member.updated_at).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="inline-actions">
                  <button
                    className="secondary-button"
                    onClick={() => toggleMemberProgress(member.id)}
                  >
                    {expandedMembers[member.id] ? 'Hide Progress' : 'Manage Progress'}
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => toggleEditMember(member)}
                  >
                    {editingMembers[member.id] ? 'Hide Edit Member' : 'Edit Member'}
                  </button>
                  {member.is_active ? (
                    <button
                      className="danger-button"
                      onClick={() => handleDeactivate(member)}
                    >
                      Deactivate Member
                    </button>
                  ) : null}
                </div>

                {editingMembers[member.id] && (
                  <div className="detail-block">
                    <section className="page-section">
                      <h4>Edit Member Details</h4>

                      <form
                        className="form-grid"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateMember(member.id);
                        }}
                      >
                        <div>
                          <label>Program</label>
                          <select
                            name="program_id"
                            value={editMemberMap[member.id]?.program_id || ''}
                            onChange={(e) => handleEditMemberChange(member.id, e)}
                          >
                            <option value="">No Program</option>
                            {programs.map((program) => (
                              <option key={program.id} value={program.id}>
                                {program.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label>First Name</label>
                          <input
                            type="text"
                            name="first_name"
                            value={editMemberMap[member.id]?.first_name || ''}
                            onChange={(e) => handleEditMemberChange(member.id, e)}
                          />
                        </div>

                        <div>
                          <label>Last Name</label>
                          <input
                            type="text"
                            name="last_name"
                            value={editMemberMap[member.id]?.last_name || ''}
                            onChange={(e) => handleEditMemberChange(member.id, e)}
                          />
                        </div>

                        <div>
                          <label>Email</label>
                          <input
                            type="email"
                            name="email"
                            value={editMemberMap[member.id]?.email || ''}
                            onChange={(e) => handleEditMemberChange(member.id, e)}
                          />
                        </div>

                        <div>
                          <label>Belt Rank</label>
                          <input
                            type="text"
                            name="belt_rank"
                            value={editMemberMap[member.id]?.belt_rank || ''}
                            onChange={(e) => handleEditMemberChange(member.id, e)}
                          />
                        </div>

                        <div>
                          <label>Active Status</label>
                          <select
                            name="is_active"
                            value={editMemberMap[member.id]?.is_active || 'true'}
                            onChange={(e) => handleEditMemberChange(member.id, e)}
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </div>

                        <div className="inline-actions">
                          <button type="submit">Save Member Details</button>
                        </div>
                      </form>
                    </section>
                  </div>
                )}

                {expandedMembers[member.id] && (
                  <div className="detail-block">
                    <MemberProgressForm
                      memberId={member.id}
                      topics={getTopicsForMember(member)}
                      onSuccess={() => loadMemberProgress(member.id)}
                    />

                    <h4>Progress Records</h4>
                    {memberProgressMap[member.id]?.length ? (
                      <ul className="card-list">
                        {memberProgressMap[member.id].map((progress) => (
                          <li key={progress.id} className="card-item">
                            <strong>{progress.topic_title}</strong> - {formatLabel(progress.topic_type)}
                            <div className="detail-block">
                              <div className="meta-text">Status: {formatLabel(progress.status)}</div>
                              <div className="meta-text">
                                Updated By: {progress.updated_by_first_name} {progress.updated_by_last_name}
                              </div>
                              <div className="meta-text">
                                Last Reviewed:{' '}
                                {progress.last_reviewed_at
                                  ? new Date(progress.last_reviewed_at).toLocaleString()
                                  : 'None'}
                              </div>
                              <div>Notes: {progress.notes || 'None'}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-state">No progress records yet.</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}

