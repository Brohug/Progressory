import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ExpandableSection from '../components/ExpandableSection';
import Layout from '../components/Layout';
import MemberProgressForm from '../components/MemberProgressForm';
import { formatLabel } from '../utils/formatLabel';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [memberProgressMap, setMemberProgressMap] = useState({});
  const [expandedMembers, setExpandedMembers] = useState({});
  const [expandedMemberDetails, setExpandedMemberDetails] = useState({});
  const [expandedProgressDetails, setExpandedProgressDetails] = useState({});
  const [showCreateMemberForm, setShowCreateMemberForm] = useState(false);
  const [showMemberProgressFormMap, setShowMemberProgressFormMap] = useState({});
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
  const [memberMessage, setMemberMessage] = useState('');

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
        setError(err.response?.data?.message || 'Couldn\'t load members right now.');
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
    setMemberMessage('');

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
      setMemberMessage('Member saved successfully.');
    } catch (err) {
      console.error('Create member error:', err);
      setError(err.response?.data?.message || 'Couldn\'t create that member just now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (member) => {
    const confirmed = window.confirm(
      'Make this member inactive? Their attendance and progress history will stay in place, but they will be hidden from the default view.'
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
      setError(err.response?.data?.message || 'Couldn\'t update that member right now.');
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
      setError(err.response?.data?.message || 'Couldn\'t load member progress right now.');
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
      setError(err.response?.data?.message || 'Couldn\'t update that member just now.');
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

  const getSuggestedTopicsForMember = (member) => {
    return getTopicsForMember(member).slice(0, 6);
  };

  const toggleMemberDetails = (memberId) => {
    setExpandedMemberDetails((prev) => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const toggleProgressDetails = (progressId) => {
    setExpandedProgressDetails((prev) => ({
      ...prev,
      [progressId]: !prev[progressId]
    }));
  };

  const toggleMemberProgressForm = (memberId) => {
    setShowMemberProgressFormMap((prev) => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  return (
    <Layout>
      <h2 className="page-title">Members</h2>

      <section className="page-section" style={{ maxWidth: '760px' }}>
        <div className="compact-form-shell">
          <div className="compact-form-header">
            <div>
              <h3>Create Member</h3>
              <p className="section-note">
                Add a new student to the gym roster, then fill in their progress only when needed.
              </p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowCreateMemberForm((prev) => !prev)}
            >
              {showCreateMemberForm ? 'Hide form' : 'Show form'}
            </button>
          </div>

          {showCreateMemberForm && (
            <form className="form-grid" onSubmit={handleSubmit}>
              <div>
                <label>Program</label>
                <select
                  name="program_id"
                  value={formData.program_id}
                  onChange={handleChange}
                >
                  <option value="">No program</option>
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
                  {submitting ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          )}

          {memberMessage ? (
            <div className="success-followup-row">
              <p className="success-text" style={{ marginBottom: 0 }}>{memberMessage}</p>
              <Link className="secondary-button" to="/classes?workflow=attendance-ready">
                Next: Record attendance
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {error && <p className="error-text">{error}</p>}

      <ExpandableSection
        title="Member List"
        note="Expand this when you are ready to review member details, progress, or inactive students."
        summary={`${orderedMembers.length} member${orderedMembers.length === 1 ? '' : 's'} available in the current view.`}
        actions={(
          <button
            className="secondary-button"
            onClick={() => setShowInactive((prev) => !prev)}
            type="button"
          >
            {showInactive ? 'Hide Inactive Members' : 'Show Inactive Members'}
          </button>
        )}
      >
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
        </div>

        {loading ? (
          <p className="empty-state">Loading members...</p>
        ) : orderedMembers.length === 0 ? (
          <p className="empty-state">No members have been added yet.</p>
        ) : (
          <ul className="card-list">
            {orderedMembers.map((member) => (
              <li key={member.id} className="card-item">
                <div className="compact-topic-header">
                  <div>
                    <strong>
                      {member.first_name} {member.last_name}
                    </strong>
                    <div className="compact-topic-meta meta-text">
                      {member.program_name || 'No program'} • {member.belt_rank || 'No belt rank'} • {member.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                <div className="inline-actions">
                  <button
                    className="secondary-button"
                    onClick={() => toggleMemberDetails(member.id)}
                  >
                    {expandedMemberDetails[member.id] ? 'Hide details' : 'Show details'}
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => toggleMemberProgress(member.id)}
                  >
                    {expandedMembers[member.id] ? 'Hide Progress' : 'View Progress'}
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

                {expandedMemberDetails[member.id] && (
                  <div className="detail-block">
                    <div className="meta-text">Program: {member.program_name || 'None'}</div>
                    <div className="meta-text">Email: {member.email || 'Not added yet'}</div>
                    <div className="meta-text">Belt Rank: {member.belt_rank || 'Not added yet'}</div>
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
                )}

                {editingMembers[member.id] && (
                  <div className="detail-block">
                    <section className="compact-form-shell">
                      <div className="compact-form-header">
                        <div>
                          <h4>Edit Member Details</h4>
                          <p className="section-note">
                            Update roster details here without opening up the whole card all the time.
                          </p>
                        </div>
                      </div>
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
                            <option value="">No program</option>
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
                    <div className="compact-form-shell">
                      <div className="compact-form-header">
                        <div>
                          <h4>Member Progress</h4>
                          <p className="section-note">
                            Review progress records and only open the update form when you need to log something new.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => toggleMemberProgressForm(member.id)}
                        >
                          {showMemberProgressFormMap[member.id] ? 'Hide form' : 'Show form'}
                        </button>
                      </div>

                      {showMemberProgressFormMap[member.id] && (
                        <MemberProgressForm
                          memberId={member.id}
                          topics={getTopicsForMember(member)}
                          suggestedTopics={getSuggestedTopicsForMember(member)}
                          defaultProgramId={member.program_id ? String(member.program_id) : ''}
                          onTopicCreated={fetchTopics}
                          onSuccess={() => loadMemberProgress(member.id)}
                          compact
                        />
                      )}
                    </div>

                    <h4>Progress Records</h4>
                    {memberProgressMap[member.id]?.length ? (
                      <ul className="card-list">
                        {memberProgressMap[member.id].map((progress) => (
                          <li key={progress.id} className="card-item compact-topic-card">
                            <div className="compact-topic-header">
                              <div>
                                <strong>{progress.topic_title}</strong>
                                <div className="compact-topic-meta meta-text">
                                  {formatLabel(progress.topic_type)} • {formatLabel(progress.status)}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() => toggleProgressDetails(progress.id)}
                              >
                                {expandedProgressDetails[progress.id] ? 'Hide details' : 'Show details'}
                              </button>
                            </div>

                            {expandedProgressDetails[progress.id] && (
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
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-state">No progress updates have been logged yet.</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </ExpandableSection>
    </Layout>
  );
}

