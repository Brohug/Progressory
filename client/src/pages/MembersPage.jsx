import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ExpandableSection from '../components/ExpandableSection';
import Layout from '../components/Layout';
import MemberProgressForm from '../components/MemberProgressForm';
import { useAuth } from '../hooks/useAuth';
import { formatLabel } from '../utils/formatLabel';

const emptyMemberForm = {
  program_id: '',
  first_name: '',
  last_name: '',
  email: '',
  belt_rank: ''
};

export default function MembersPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const isManagement = user?.role === 'owner' || user?.role === 'admin';
  const [searchParams] = useSearchParams();
  const memberListSectionRef = useRef(null);
  const memberItemRefs = useRef({});
  const memberInviteSectionRefs = useRef({});
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
  const [memberSearch, setMemberSearch] = useState('');
  const [memberProgramFilter, setMemberProgramFilter] = useState('');
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [memberMessage, setMemberMessage] = useState('');
  const [memberMessageAction, setMemberMessageAction] = useState(null);
  const [managingMemberAccessId, setManagingMemberAccessId] = useState(null);
  const [memberAccessFormMap, setMemberAccessFormMap] = useState({});
  const [memberInviteMap, setMemberInviteMap] = useState({});
  const [isMemberListSectionOpen, setIsMemberListSectionOpen] = useState(false);

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

  const memberProgramOptions = useMemo(() => (
    [...new Set(orderedMembers.map((member) => member.program_name).filter(Boolean))].sort()
  ), [orderedMembers]);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = memberSearch.trim().toLowerCase();

    return orderedMembers.filter((member) => {
      const matchesSearch = !normalizedSearch || [
        member.first_name,
        member.last_name,
        member.email,
        member.login_email,
        member.program_name,
        member.belt_rank
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      const matchesProgram = !memberProgramFilter || member.program_name === memberProgramFilter;

      return matchesSearch && matchesProgram;
    });
  }, [memberProgramFilter, memberSearch, orderedMembers]);

  const memberSummaryCards = useMemo(() => {
    const activeMembers = members.filter((member) => member.is_active);
    const inactiveMembers = members.filter((member) => !member.is_active);
    const membersWithLogin = members.filter((member) => Boolean(member.user_id));
    const activePrograms = new Set(activeMembers.map((member) => member.program_name).filter(Boolean));

    return [
      { label: 'Active Members', value: activeMembers.length },
      { label: 'Inactive Members', value: inactiveMembers.length },
      { label: 'Member Logins', value: membersWithLogin.length },
      { label: 'Programs Represented', value: activePrograms.size }
    ];
  }, [members]);

  const handleCreateMemberChange = (e) => {
    setMemberForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMemberMessage('');
    setMemberMessageAction(null);

    try {
      await api.post('/members', {
        program_id: memberForm.program_id ? Number(memberForm.program_id) : null,
        first_name: memberForm.first_name,
        last_name: memberForm.last_name,
        email: memberForm.email || null,
        belt_rank: memberForm.belt_rank || null
      });

      setMemberForm(emptyMemberForm);
      await fetchMembers();
      setMemberMessage('Member saved successfully.');
      setMemberMessageAction({
        label: 'Next: Record attendance',
        to: '/classes?workflow=attendance-ready'
      });
    } catch (err) {
      console.error('Create member error:', err);
      setError(err.response?.data?.message || 'Couldn\'t create that member just now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateMember = async (member) => {
    const confirmed = window.confirm(
      'Make this member inactive? Their attendance and progress history will stay in place, but they will be hidden from the default view.'
    );
    if (!confirmed) return;

    try {
      setError('');
      setMemberMessage('');
      setMemberMessageAction(null);
      await api.put(`/members/${member.id}`, {
        program_id: member.program_id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email || null,
        belt_rank: member.belt_rank || null,
        is_active: false
      });
      await fetchMembers();
      setMemberMessage('Member removed from the active roster.');
      setShowInactive(true);
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

    setEditingMembers((prev) => ({
      ...prev,
      [member.id]: !prev[member.id]
    }));

    if (isEditing) {
      setError('');
      setMemberMessage('');
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
      setMemberMessage('');
      setMemberMessageAction(null);
      const editData = editMemberMap[memberId];

      await api.put(`/members/${memberId}`, {
        program_id: editData.program_id ? Number(editData.program_id) : null,
        first_name: editData.first_name,
        last_name: editData.last_name,
        email: editData.email || null,
        belt_rank: editData.belt_rank || null,
        ...(isManagement ? { is_active: editData.is_active === 'true' } : {})
      });

      await fetchMembers();
      setEditingMembers((prev) => ({
        ...prev,
        [memberId]: false
      }));
      setMemberMessage('Roster details updated successfully.');
    } catch (err) {
      console.error('Update member error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that member just now.');
    }
  };

  const getTopicsForMember = (member) => {
    if (!member.program_id) {
      return topics;
    }

    return topics.filter(
      (topic) => topic.program_id === null || topic.program_id === member.program_id
    );
  };

  const getSuggestedTopicsForMember = (member) => getTopicsForMember(member).slice(0, 6);

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

  const toggleMemberAccessForm = (member) => {
    if (!isOwner) return;

    setMemberAccessFormMap((prev) => ({
      ...prev,
      [member.id]: {
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.login_email || member.email || ''
      }
    }));

    setManagingMemberAccessId((prev) => (prev === member.id ? null : member.id));
    setError('');
    setMemberMessage('');
    setMemberMessageAction(null);
  };

  const handleMemberAccessChange = (memberId, e) => {
    const { name, value } = e.target;
    setMemberAccessFormMap((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [name]: value
      }
    }));
  };

  const handleCreateMemberInvite = async (member) => {
    const accessData = memberAccessFormMap[member.id];

    if (!accessData?.email) {
      setError('Email is required before creating a member access link.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setMemberMessage('');
      setMemberMessageAction(null);

      const response = await api.post('/users/member-access', {
        first_name: accessData.first_name,
        last_name: accessData.last_name,
        email: accessData.email,
        member_id: member.id
      });

      await fetchMembers();
      setManagingMemberAccessId(member.id);
      setMemberInviteMap((prev) => ({
        ...prev,
        [member.id]: {
          ...response.data.invite,
          copied: false
        }
      }));
      setMemberMessage(member.user_id ? 'Reset-password link ready below.' : 'Member setup link ready below.');
      window.setTimeout(() => {
        memberInviteSectionRefs.current[member.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Create member invite error:', err);
      setError(err.response?.data?.message || 'Couldn\'t create that member access link right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMemberLoginStatus = async (member) => {
    if (!member.user_id) return;

    try {
      setSubmitting(true);
      setError('');
      setMemberMessage('');
      setMemberMessageAction(null);

      if (member.login_is_active) {
        await api.patch(`/users/${member.user_id}/deactivate`);
        setMemberMessage('Member login deactivated successfully.');
      } else {
        await api.patch(`/users/${member.user_id}/activate`);
        setMemberMessage('Member login reactivated successfully.');
      }

      await fetchMembers();
    } catch (err) {
      console.error('Toggle member login status error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that member login right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyInviteLink = async (memberId) => {
    const inviteUrl = memberInviteMap[memberId]?.url;
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setMemberInviteMap((prev) => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          copied: true
        }
      }));
      setMemberMessage('Invite link copied to clipboard.');
      setMemberMessageAction(null);
      setError('');
    } catch (err) {
      console.error('Copy invite link error:', err);
      setError('Couldn\'t copy the invite link automatically. You can still copy it manually below.');
    }
  };

  useEffect(() => {
    const searchValue = searchParams.get('search');
    const programValue = searchParams.get('program');

    if (searchValue !== null) {
      setMemberSearch(searchValue);
    }

    if (programValue !== null) {
      setMemberProgramFilter(programValue);
    }
  }, [searchParams]);

  useEffect(() => {
    const memberId = searchParams.get('memberId');
    const view = searchParams.get('view');

    if (!memberId || loading || members.length === 0) {
      return;
    }

    const targetMember = members.find((member) => String(member.id) === String(memberId));
    if (!targetMember) {
      return;
    }

    if (!targetMember.is_active) {
      setShowInactive(true);
    }

    setIsMemberListSectionOpen(true);

    if (view === 'details') {
      setExpandedMemberDetails((prev) => ({ ...prev, [targetMember.id]: true }));
    }

    if (view === 'progress') {
      setExpandedMembers((prev) => ({ ...prev, [targetMember.id]: true }));
      setShowMemberProgressFormMap((prev) => ({ ...prev, [targetMember.id]: true }));

      if (!memberProgressMap[targetMember.id]) {
        loadMemberProgress(targetMember.id);
      }
    }

    if (view === 'edit') {
      setEditMemberMap((prev) => ({
        ...prev,
        [targetMember.id]: {
          program_id: targetMember.program_id ? String(targetMember.program_id) : '',
          first_name: targetMember.first_name || '',
          last_name: targetMember.last_name || '',
          email: targetMember.email || '',
          belt_rank: targetMember.belt_rank || '',
          is_active: targetMember.is_active ? 'true' : 'false'
        }
      }));
      setEditingMembers((prev) => ({ ...prev, [targetMember.id]: true }));
    }

    if (view === 'access' && isOwner) {
      setMemberAccessFormMap((prev) => ({
        ...prev,
        [targetMember.id]: {
          first_name: targetMember.first_name || '',
          last_name: targetMember.last_name || '',
          email: targetMember.login_email || targetMember.email || ''
        }
      }));
      setManagingMemberAccessId(targetMember.id);
    }

    window.setTimeout(() => {
      memberListSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      memberItemRefs.current[targetMember.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }, [isOwner, loading, memberProgressMap, members, searchParams]);

  return (
    <Layout>
      <h2 className="page-title">Members</h2>
      <p className="page-intro">
        Manage the roster, member access, and progress from one place.
      </p>

      <section className="stats-grid">
        {memberSummaryCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
          </div>
        ))}
      </section>

      <section className="page-section" style={{ maxWidth: '760px' }}>
        <div className="compact-form-shell">
          <div className="compact-form-header">
            <div>
              <h3>Add Member To Roster</h3>
              <p className="section-note">
                Add the student first, then track progress and access when you need it.
              </p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowCreateMemberForm((prev) => !prev)}
            >
              {showCreateMemberForm ? 'Close member form' : 'Add member'}
            </button>
          </div>

          {showCreateMemberForm ? (
            <form className="form-grid" onSubmit={handleCreateMember}>
              <div>
                <label>Program</label>
                <select name="program_id" value={memberForm.program_id} onChange={handleCreateMemberChange}>
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
                <input type="text" name="first_name" value={memberForm.first_name} onChange={handleCreateMemberChange} />
              </div>

              <div>
                <label>Last Name</label>
                <input type="text" name="last_name" value={memberForm.last_name} onChange={handleCreateMemberChange} />
              </div>

              <div>
                <label>Email</label>
                <input type="email" name="email" value={memberForm.email} onChange={handleCreateMemberChange} />
              </div>

              <div>
                <label>Belt Rank</label>
                <input type="text" name="belt_rank" value={memberForm.belt_rank} onChange={handleCreateMemberChange} />
              </div>

              <div>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          ) : null}

          {memberMessage ? (
            <div className="success-followup-row">
              <p className="success-text" style={{ marginBottom: 0 }}>{memberMessage}</p>
              {memberMessageAction ? (
                <Link className="secondary-button" to={memberMessageAction.to}>
                  {memberMessageAction.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <ExpandableSection
        isOpen={isMemberListSectionOpen}
        onToggle={setIsMemberListSectionOpen}
        title="Roster And Progress"
        note="Review member details, update progress, or manage login access."
        summary={`${filteredMembers.length} member${filteredMembers.length === 1 ? '' : 's'} in the current view.`}
        actions={(
          <button
            className="secondary-button"
            onClick={() => setShowInactive((prev) => !prev)}
            type="button"
          >
            {showInactive ? 'Hide Inactive Members' : 'Show Inactive Members'}
          </button>
        )}
        className="members-list-section"
      >
        <div ref={memberListSectionRef} />

        <div className="filter-grid">
          <div>
            <label>Search Members</label>
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search by name, email, program, or belt rank..."
            />
          </div>

          <div>
            <label>Filter By Program</label>
            <select
              value={memberProgramFilter}
              onChange={(e) => setMemberProgramFilter(e.target.value)}
            >
              <option value="">All Programs</option>
              {memberProgramOptions.map((programName) => (
                <option key={programName} value={programName}>
                  {programName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading members...</p>
        ) : filteredMembers.length === 0 ? (
          <p className="empty-state">
            {members.length === 0 ? 'No members have been added yet.' : 'No members match those filters right now.'}
          </p>
        ) : (
          <ul className="card-list">
            {filteredMembers.map((member) => {
              const inviteInfo = memberInviteMap[member.id];
              const accessForm = memberAccessFormMap[member.id] || {
                first_name: member.first_name || '',
                last_name: member.last_name || '',
                email: member.login_email || member.email || ''
              };

              return (
                <li
                  key={member.id}
                  className="card-item compact-topic-card member-card"
                  ref={(node) => {
                    if (node) {
                      memberItemRefs.current[member.id] = node;
                    }
                  }}
                >
                  <div className="compact-topic-header">
                    <div>
                      <strong>{member.first_name} {member.last_name}</strong>
                      <div className="compact-topic-meta meta-text">
                        {member.email || 'No email added yet'}
                      </div>
                    </div>
                  </div>

                  <div className="member-card-summary-row">
                    <span className="member-card-summary-pill">{member.program_name || 'No program'}</span>
                    <span className="member-card-summary-pill">{member.belt_rank || 'No belt rank'}</span>
                    <span className="member-card-summary-pill">{member.is_active ? 'Active roster' : 'Inactive roster'}</span>
                    <span className="member-card-summary-pill">{member.user_id ? 'Login connected' : 'No login yet'}</span>
                  </div>

                  <div className="inline-actions member-card-actions">
                      <button className="secondary-button" onClick={() => toggleMemberDetails(member.id)}>
                        {expandedMemberDetails[member.id] ? 'Hide roster' : 'Roster'}
                      </button>
                    <button className="secondary-button" onClick={() => toggleMemberProgress(member.id)}>
                      {expandedMembers[member.id] ? 'Hide progress' : 'Progress'}
                    </button>
                    <button className="secondary-button" onClick={() => toggleEditMember(member)}>
                      {editingMembers[member.id] ? 'Close editor' : 'Edit roster'}
                    </button>
                    {isOwner ? (
                      <button className="secondary-button" onClick={() => toggleMemberAccessForm(member)}>
                        {managingMemberAccessId === member.id ? 'Close access' : 'Login access'}
                      </button>
                    ) : null}
                    {isManagement && member.is_active ? (
                      <button className="danger-button" onClick={() => handleDeactivateMember(member)}>
                        Remove from roster
                      </button>
                    ) : null}
                  </div>

                  {expandedMemberDetails[member.id] ? (
                    <div className="detail-block">
                      <div className="meta-text">Program: {member.program_name || 'None'}</div>
                      <div className="meta-text">Email: {member.email || 'Not added yet'}</div>
                      <div className="meta-text">Belt Rank: {member.belt_rank || 'Not added yet'}</div>
                      <div className="meta-text">Active on roster: {member.is_active ? 'Yes' : 'No'}</div>
                      <div className="meta-text">Login access: {member.user_id ? 'Connected' : 'Not set up yet'}</div>
                      {member.user_id ? (
                        <>
                          <div className="meta-text">Login email: {member.login_email || 'No login email'}</div>
                          <div className="meta-text">Login status: {member.login_is_active ? 'Active' : 'Inactive'}</div>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {editingMembers[member.id] ? (
                    <div className="detail-block">
                      <section className="compact-form-shell">
                        <div className="compact-form-header">
                          <div>
                            <h4>Edit Roster Details</h4>
                            <p className="section-note">
                              Update the member&apos;s roster details here.
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

                          {isManagement ? (
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
                          ) : null}

                          <div className="inline-actions">
                            <button type="submit">Save Roster Details</button>
                          </div>
                        </form>
                      </section>
                    </div>
                  ) : null}

                  {isOwner && managingMemberAccessId === member.id ? (
                    <div className="detail-block">
                      <section className="compact-form-shell">
                        <div className="compact-form-header">
                          <div>
                            <h4>{member.user_id ? 'Reset Member Login Access' : 'Create Member Login Access'}</h4>
                            <p className="section-note">
                              Generate a secure link so the member can set or reset their own password.
                            </p>
                          </div>
                        </div>

                        <form
                          className="form-grid"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateMemberInvite(member);
                          }}
                        >
                          <div>
                            <label>First Name</label>
                            <input
                              type="text"
                              name="first_name"
                              value={accessForm.first_name}
                              onChange={(e) => handleMemberAccessChange(member.id, e)}
                            />
                          </div>

                          <div>
                            <label>Last Name</label>
                            <input
                              type="text"
                              name="last_name"
                              value={accessForm.last_name}
                              onChange={(e) => handleMemberAccessChange(member.id, e)}
                            />
                          </div>

                          <div>
                            <label>Email</label>
                            <input
                              type="email"
                              name="email"
                              value={accessForm.email}
                              onChange={(e) => handleMemberAccessChange(member.id, e)}
                            />
                          </div>

                          <div className="inline-actions">
                            <button type="submit" disabled={submitting}>
                              {submitting
                                ? 'Preparing link...'
                                : member.user_id
                                  ? 'Generate reset-password link'
                                  : 'Create member setup link'}
                            </button>
                            {member.user_id ? (
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() => handleToggleMemberLoginStatus(member)}
                                disabled={submitting}
                              >
                                {submitting
                                  ? (member.login_is_active ? 'Deactivating login...' : 'Reactivating login...')
                                  : (member.login_is_active ? 'Deactivate login' : 'Reactivate login')}
                              </button>
                            ) : null}
                          </div>
                        </form>

                        {inviteInfo ? (
                          <div
                            className="detail-block"
                            ref={(node) => {
                              if (node) {
                                memberInviteSectionRefs.current[member.id] = node;
                              }
                            }}
                          >
                            <p className="success-text" style={{ marginBottom: '0.5rem' }}>
                              {member.user_id ? 'Reset-password link ready.' : 'Member setup link ready.'}
                            </p>
                            <div className="meta-text">
                              Link type: {inviteInfo.type === 'reset_password' ? 'Reset password' : 'Initial activation'}
                            </div>
                            <div className="meta-text">
                              Expires: {new Date(inviteInfo.expires_at).toLocaleString()}
                            </div>
                            <input type="text" readOnly value={inviteInfo.url} />
                            <div className="inline-actions">
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() => handleCopyInviteLink(member.id)}
                              >
                                {inviteInfo.copied ? 'Copied member link' : 'Copy member link'}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </section>
                    </div>
                  ) : null}

                  {expandedMembers[member.id] ? (
                    <div className="detail-block">
                      <div className="compact-form-shell">
                        <div className="compact-form-header">
                          <div>
                            <h4>Member Progress</h4>
                            <p className="section-note">
                              Review progress records here and open the form when you need to log something new.
                            </p>
                            {isManagement ? (
                              <div className="inline-actions" style={{ marginTop: '10px' }}>
                                <Link className="secondary-button" to="/topics?action=create">
                                  Add missing topic
                                </Link>
                                <Link className="secondary-button" to="/topics">
                                  Open Topics
                                </Link>
                              </div>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => toggleMemberProgressForm(member.id)}
                          >
                            {showMemberProgressFormMap[member.id] ? 'Close progress form' : 'Log progress'}
                          </button>
                        </div>

                        {showMemberProgressFormMap[member.id] ? (
                          <MemberProgressForm
                            memberId={member.id}
                            topics={getTopicsForMember(member)}
                            suggestedTopics={getSuggestedTopicsForMember(member)}
                            defaultProgramId={member.program_id ? String(member.program_id) : ''}
                            onTopicCreated={fetchTopics}
                            onSuccess={() => loadMemberProgress(member.id)}
                            compact
                          />
                        ) : null}
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
                                    {formatLabel(progress.topic_type)} | {formatLabel(progress.status)}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => toggleProgressDetails(progress.id)}
                                >
                                  {expandedProgressDetails[progress.id] ? 'Hide details' : 'Open details'}
                                </button>
                              </div>

                              {expandedProgressDetails[progress.id] ? (
                                <div className="detail-block">
                                  <div className="meta-text">Status: {formatLabel(progress.status)}</div>
                                  <div className="meta-text">
                                    Updated By: {progress.updated_by_first_name} {progress.updated_by_last_name}
                                  </div>
                                  <div className="meta-text">
                                    Last Reviewed: {progress.last_reviewed_at
                                      ? new Date(progress.last_reviewed_at).toLocaleString()
                                      : 'None'}
                                  </div>
                                  <div>Notes: {progress.notes || 'None'}</div>
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="empty-state">
                          <p>No progress has been logged for this member yet.</p>
                          {isManagement ? (
                            <div className="inline-actions" style={{ justifyContent: 'center' }}>
                              <Link className="secondary-button" to="/topics">
                                Review Topics
                              </Link>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </ExpandableSection>
    </Layout>
  );
}
