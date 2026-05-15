import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ExpandableSection from '../components/ExpandableSection';
import Layout from '../components/Layout';
import curriculumIndexSeed from '../data/curriculumIndexSeed';
import { formatLabel } from '../utils/formatLabel';

const normalizeValue = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
);

const RELATIONSHIP_GROUPS = [
  { key: 'entriesIntoPosition', label: 'Natural entry after' },
  { key: 'commonAttacks', label: 'Natural attack after' },
  { key: 'commonTransitions', label: 'Natural transition after' },
  { key: 'commonFollowUps', label: 'Natural follow-up after' },
  { key: 'relatedPositions', label: 'Close positional neighbor to' }
];

const mapSeedEntryToTopicType = (entry) => {
  const category = String(entry?.category || '').toLowerCase();

  if (category.includes('position') || category.includes('guard')) {
    return 'position';
  }

  if (category.includes('submission')) {
    return 'submission';
  }

  if (category.includes('escape') || category.includes('defense') || category.includes('retention')) {
    return 'escape';
  }

  if (category.includes('takedown')) {
    return 'takedown';
  }

  if (category.includes('concept') || category.includes('fundamental')) {
    return 'concept';
  }

  return 'technique';
};

export default function ReportsPage() {
  const [recentClasses, setRecentClasses] = useState([]);
  const [recentTopicSignals, setRecentTopicSignals] = useState([]);
  const [topicCoverage, setTopicCoverage] = useState([]);
  const [trainingMethodUsage, setTrainingMethodUsage] = useState([]);
  const [neglectedTopics, setNeglectedTopics] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        recentClassesRes,
        recentTopicSignalsRes,
        topicCoverageRes,
        trainingMethodUsageRes,
        neglectedTopicsRes,
        topicsRes
      ] = await Promise.all([
        api.get('/reports/recent-classes?limit=5'),
        api.get('/reports/recent-topic-signals?limit=16'),
        api.get('/reports/topic-coverage'),
        api.get('/reports/training-method-usage'),
        api.get('/reports/neglected-topics?days=30'),
        api.get('/topics')
      ]);

      setRecentClasses(recentClassesRes.data);
      setRecentTopicSignals(recentTopicSignalsRes.data);
      setTopicCoverage(topicCoverageRes.data);
      setTrainingMethodUsage(trainingMethodUsageRes.data);
      setNeglectedTopics(neglectedTopicsRes.data);
      setTopics(topicsRes.data);
    } catch (err) {
      console.error('Load reports error:', err);
      setError(err.response?.data?.message || 'Couldn\'t load reports right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const summaryCards = [
    { label: 'Recent Classes', value: recentClasses.length },
    { label: 'Tracked Topics', value: topicCoverage.length },
    {
      label: 'Methods Used',
      value: trainingMethodUsage.filter(
        (method) => Number(method.total_segments) > 0
      ).length
    },
    { label: 'Neglected Topics', value: neglectedTopics.length }
  ];

  const topTopics = topicCoverage
    .slice()
    .sort((a, b) => Number(b.total_times_used) - Number(a.total_times_used))
    .slice(0, 6);

  const topMethods = trainingMethodUsage
    .slice()
    .sort((a, b) => Number(b.total_segments) - Number(a.total_segments))
    .slice(0, 6);

  const recentTopicSignalGroups = useMemo(() => {
    const seenTopicIds = new Set();

    return recentTopicSignals.filter((item) => {
      const topicId = Number(item.topic_id);
      if (seenTopicIds.has(topicId)) {
        return false;
      }

      seenTopicIds.add(topicId);
      return true;
    });
  }, [recentTopicSignals]);

  const recommendedNextTopics = useMemo(() => {
    if (topics.length === 0) {
      return [];
    }

    const seedByName = new Map(
      curriculumIndexSeed.map((entry) => [normalizeValue(entry.name), entry])
    );

    const recentTopicIds = new Set(recentTopicSignals.map((item) => Number(item.topic_id)));
    const neglectedTopicIds = new Set(neglectedTopics.map((item) => Number(item.topic_id)));
    const recentPrograms = new Set(recentTopicSignalGroups.map((item) => item.program_id).filter(Boolean));
    const recentRelationshipDetails = new Map();

    recentTopicSignalGroups.forEach((recentTopic, index) => {
      const seedEntry = seedByName.get(normalizeValue(recentTopic.topic_title));
      if (!seedEntry) return;

      RELATIONSHIP_GROUPS.forEach(({ key, label }) => {
        (seedEntry[key] || []).forEach((relatedName) => {
          const normalizedName = normalizeValue(relatedName);
          if (!normalizedName) {
            return;
          }

          const existing = recentRelationshipDetails.get(normalizedName) || {
            recentTopicTitles: new Set(),
            relationLabels: new Set(),
            strongestRecencyIndex: Number.POSITIVE_INFINITY
          };

          existing.recentTopicTitles.add(recentTopic.topic_title);
          existing.relationLabels.add(label);
          existing.strongestRecencyIndex = Math.min(existing.strongestRecencyIndex, index);
          recentRelationshipDetails.set(normalizedName, existing);
        });
      });
    });

    const coverageByTopicId = new Map(
      topicCoverage.map((item) => [Number(item.topic_id), item])
    );

    return topics
      .filter((topic) => topic.is_active && !recentTopicIds.has(Number(topic.id)))
      .map((topic) => {
        const coverage = coverageByTopicId.get(Number(topic.id));
        const scoreReasons = [];
        let score = 0;
        const recentRelationshipMatch = recentRelationshipDetails.get(normalizeValue(topic.title));

        if (neglectedTopicIds.has(Number(topic.id))) {
          score += 5;
          scoreReasons.push('Not used recently');
        }

        if (recentRelationshipMatch) {
          const recencyBonus = recentRelationshipMatch.strongestRecencyIndex <= 1 ? 5 : 4;
          score += recencyBonus;
          scoreReasons.push(
            `${Array.from(recentRelationshipMatch.relationLabels)[0]} ${Array.from(recentRelationshipMatch.recentTopicTitles)[0]}`
          );
        }

        if (topic.program_id && recentPrograms.has(topic.program_id)) {
          score += 2;
          scoreReasons.push('Matches the active program mix');
        }

        if (topic.parent_topic_id && recentTopicSignals.some((item) => Number(item.topic_id) === Number(topic.parent_topic_id))) {
          score += 2;
          scoreReasons.push('Shares a direct parent with a recent topic');
        }

        const totalTimesUsed = Number(coverage?.total_times_used || 0);
        if (totalTimesUsed <= 1) {
          score += 2;
          scoreReasons.push(totalTimesUsed === 0 ? 'Never used yet' : 'Only used once so far');
        }

        return {
          ...topic,
          score,
          scoreReasons: [...new Set(scoreReasons)],
          totalTimesUsed,
          recentRelationshipMatch
        };
      })
      .filter((topic) => topic.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        if (left.totalTimesUsed !== right.totalTimesUsed) return left.totalTimesUsed - right.totalTimesUsed;
        return String(left.title || '').localeCompare(String(right.title || ''));
      })
      .slice(0, 8);
  }, [neglectedTopics, recentTopicSignalGroups, recentTopicSignals, topicCoverage, topics]);

  const suggestedMissingTopics = useMemo(() => {
    if (topics.length === 0 || recentTopicSignalGroups.length === 0) {
      return [];
    }

    const seedByName = new Map(
      curriculumIndexSeed.map((entry) => [normalizeValue(entry.name), entry])
    );
    const existingTopicNames = new Set(topics.map((topic) => normalizeValue(topic.title)));
    const missingCandidates = [];
    const seenMissingNames = new Set();
    recentTopicSignalGroups.forEach((recentTopic, index) => {
      const seedEntry = seedByName.get(normalizeValue(recentTopic.topic_title));
      if (!seedEntry) {
        return;
      }

      RELATIONSHIP_GROUPS.forEach(({ key, label }) => {
        (seedEntry[key] || []).forEach((relatedName) => {
          const normalizedName = normalizeValue(relatedName);
          const relatedSeedEntry = seedByName.get(normalizedName);

          if (!normalizedName || !relatedSeedEntry || existingTopicNames.has(normalizedName) || seenMissingNames.has(normalizedName)) {
            return;
          }

          seenMissingNames.add(normalizedName);
          missingCandidates.push({
            name: relatedSeedEntry.name,
            suggestedType: mapSeedEntryToTopicType(relatedSeedEntry),
            suggestedProgramId: recentTopic.program_id || '',
            sourceTopicTitle: recentTopic.topic_title,
            sourceProgramName: recentTopic.program_name || '',
            relationLabel: label,
            score: index <= 1 ? 5 : 4
          });
        });
      });
    });

    return missingCandidates
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.name.localeCompare(right.name);
      })
      .slice(0, 8);
  }, [recentTopicSignalGroups, topics]);

  const priorityActions = useMemo(() => {
    const nextNeglectedTopic = neglectedTopics[0] || null;
    const latestClass = recentClasses[0] || null;
    const mostUsedTopic = topTopics[0] || null;

    return [
      nextNeglectedTopic
        ? {
            title: 'Plan around an underused topic',
            body: `${nextNeglectedTopic.topic_title} is a good candidate for the next planned class if you want to rebalance the rotation.`,
            primaryLabel: 'Plan next class',
            primaryTo: `/planned-classes?openForm=1&reportTopicId=${nextNeglectedTopic.topic_id}&reportTopicTitle=${encodeURIComponent(nextNeglectedTopic.topic_title)}`,
            secondaryLabel: 'View topic',
            secondaryTo: `/topics?topicId=${nextNeglectedTopic.topic_id}`
          }
        : null,
      latestClass
        ? {
            title: 'Review the latest class',
            body: `${latestClass.title || 'Untitled Class'} is the fastest way to connect this report back to what was actually taught most recently.`,
            primaryLabel: 'Open class',
            primaryTo: `/classes?openClassId=${latestClass.id}`,
            secondaryLabel: 'Plan follow-up',
            secondaryTo: '/planned-classes?openForm=1'
          }
        : null,
      mostUsedTopic
        ? {
            title: 'Inspect your most-used topic',
            body: `${mostUsedTopic.topic_title} is currently dominating the mix, so it is a good place to check whether repetition is intentional or accidental.`,
            primaryLabel: 'View topic',
            primaryTo: `/topics?topicId=${mostUsedTopic.topic_id}`,
            secondaryLabel: 'Plan review class',
            secondaryTo: `/planned-classes?openForm=1&reportTopicId=${mostUsedTopic.topic_id}&reportTopicTitle=${encodeURIComponent(mostUsedTopic.topic_title)}`
          }
        : null
    ].filter(Boolean);
  }, [neglectedTopics, recentClasses, topTopics]);

  return (
    <Layout>
      <div className="reports-page">
        <h2 className="page-title">Reports</h2>
        <p className="page-intro">
          Review trends, spot gaps, and decide what to do next.
        </p>

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p className="empty-state">Loading reports...</p>
        ) : (
          <>
            <section className="stats-grid reports-stats-grid">
              {summaryCards.map((card) => (
                <div key={card.label} className="stat-card">
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                </div>
              ))}
            </section>

            {priorityActions.length > 0 ? (
              <section className="reports-featured-grid" style={{ marginBottom: '1.5rem' }}>
                {priorityActions.map((action) => (
                  <article key={action.title} className="reports-featured-card">
                    <strong>{action.title}</strong>
                    <div className="member-card-summary-row">
                      <span className="member-card-summary-pill">Priority action</span>
                      <span className="member-card-summary-pill">Open next step</span>
                    </div>
                    <div className="detail-block">
                      <div>{action.body}</div>
                    </div>
                    <div className="inline-actions">
                      <Link className="secondary-button" to={action.primaryTo}>
                        {action.primaryLabel}
                      </Link>
                      <Link className="secondary-button" to={action.secondaryTo}>
                        {action.secondaryLabel}
                      </Link>
                    </div>
                  </article>
                ))}
              </section>
            ) : null}

            <ExpandableSection
            title="Suggested Next Topics"
              note="These suggestions keep the next class close to what was just taught while still bringing neglected topics back into the rotation."
              summary="Expand when you want next-class ideas that flow naturally from recent teaching."
              className="reports-priority-section"
              defaultOpen
            >
              {recommendedNextTopics.length === 0 ? (
                <p className="empty-state">There is not enough recent teaching signal yet to make a strong recommendation. Log a few more classes or add more topics to improve this list.</p>
              ) : (
                <div className="reports-featured-grid">
                  {recommendedNextTopics.map((topic) => (
                    <article key={topic.id} className="reports-featured-card">
                      <strong>{topic.title}</strong>
                      <div className="member-card-summary-row">
                        <span className="member-card-summary-pill">{formatLabel(topic.topic_type)}</span>
                        <span className="member-card-summary-pill">{topic.program_name || 'No program'}</span>
                      </div>
                      <div className="detail-block">
                        <div className="meta-text">Why next: {topic.scoreReasons.join(' | ')}</div>
                        {topic.recentRelationshipMatch ? (
                          <div className="meta-text">
                            Flows after: {Array.from(topic.recentRelationshipMatch.recentTopicTitles).slice(0, 2).join(' | ')}
                          </div>
                        ) : null}
                      </div>
                      <div className="inline-actions">
                        <Link className="secondary-button" to={`/topics?topicId=${topic.id}`}>
                          Open topic
                        </Link>
                        <Link
                          className="secondary-button"
                          to={`/planned-classes?openForm=1&reportTopicId=${topic.id}&reportTopicTitle=${encodeURIComponent(topic.title)}`}
                        >
                          Plan class
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </ExpandableSection>

            <ExpandableSection
            title="Consider Adding Nearby Topics"
              note="These are nearby curriculum ideas the gym has not added yet, but they would connect cleanly to recent teaching."
              summary="Expand when you want help spotting missing topics that would make the curriculum feel more complete."
              className="reports-priority-section"
            >
              {suggestedMissingTopics.length === 0 ? (
                <p className="empty-state">No clear curriculum gaps stood out from the recent classes. The current topic library is covering those relationship chains well.</p>
              ) : (
                <div className="reports-featured-grid">
                  {suggestedMissingTopics.map((topic) => (
                    <article key={`${topic.name}-${topic.sourceTopicTitle}`} className="reports-featured-card">
                      <strong>{topic.name}</strong>
                      <div className="member-card-summary-row">
                        <span className="member-card-summary-pill">{formatLabel(topic.suggestedType)}</span>
                        <span className="member-card-summary-pill">{topic.sourceProgramName || 'Any program'}</span>
                      </div>
                      <div className="detail-block">
                        <div className="meta-text">Closest recent topic: {topic.sourceTopicTitle}</div>
                        <div className="meta-text">Why add it: {topic.relationLabel}</div>
                        <div className="meta-text">Program fit: {topic.sourceProgramName || 'Use any relevant program'}</div>
                      </div>
                      <div className="inline-actions">
                        <Link
                          className="secondary-button"
                          to={`/topics?action=create&suggestedTitle=${encodeURIComponent(topic.name)}&suggestedType=${encodeURIComponent(topic.suggestedType)}&suggestedProgramId=${encodeURIComponent(String(topic.suggestedProgramId || ''))}`}
                        >
                          Add topic
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </ExpandableSection>

            <ExpandableSection
            title="Unused / Underutilized Topics"
              note="Topics that have not shown up recently and may be worth revisiting."
              summary="Expand when you want to spot topics falling out of the teaching rotation."
              className="reports-priority-section"
              defaultOpen
            >
              {neglectedTopics.length === 0 ? (
                <p className="empty-state">No underused topics showed up in this time range.</p>
              ) : (
                <div className="reports-featured-grid">
                  {neglectedTopics.slice(0, 6).map((item) => (
                    <article key={item.topic_id} className="reports-featured-card">
                      <strong>{item.topic_title}</strong>
                      <div className="member-card-summary-row">
                        <span className="member-card-summary-pill">{formatLabel(item.topic_type)}</span>
                        <span className="member-card-summary-pill">{item.program_name || 'No program'}</span>
                      </div>
                      <div className="detail-block">
                        <div className="meta-text">
                          Last Used:{' '}
                          {item.last_used_date
                            ? new Date(item.last_used_date).toLocaleDateString()
                            : 'Not yet used'}
                        </div>
                      </div>
                      <div className="inline-actions">
                        <Link className="secondary-button" to={`/topics?topicId=${item.topic_id}`}>
                          Open topic
                        </Link>
                        <Link
                          className="secondary-button"
                          to={`/planned-classes?openForm=1&reportTopicId=${item.topic_id}&reportTopicTitle=${encodeURIComponent(item.topic_title)}`}
                        >
                          Plan class
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </ExpandableSection>

            <section className="two-column-grid reports-insights-grid">
              <ExpandableSection
              title="Training Method Usage"
                note="How often each training method appears in logged class segments."
                summary="Expand when you want to compare which methods are getting the most use."
                className="reports-ranked-section"
              >
                {topMethods.length === 0 ? (
                  <p className="empty-state">No training method usage has been logged yet.</p>
                ) : (
                  <div className="reports-ranked-list">
                    {topMethods.map((item, index) => (
                      <div key={item.training_method_id} className="reports-ranked-row">
                        <div className="reports-rank">{index + 1}</div>
                        <div className="reports-ranked-main">
                          <strong>{item.training_method_name}</strong>
                          <div className="meta-text">{item.description || 'No description added yet.'}</div>
                        </div>
                        <div className="reports-ranked-stats">
                          <span>{Number(item.total_segments)} segments</span>
                          <span>{Number(item.total_duration_minutes)} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ExpandableSection>

              <ExpandableSection
              title="Top Topic Coverage"
                note="The most-used topics ranked by how often they appear in classes."
                summary="Expand when you want to see which topics dominate the current teaching mix."
                className="reports-ranked-section"
              >
                {topTopics.length === 0 ? (
                  <p className="empty-state">No topic coverage has been logged yet.</p>
                ) : (
                  <div className="reports-ranked-list">
                    {topTopics.map((item, index) => (
                      <div key={item.topic_id} className="reports-ranked-row">
                        <div className="reports-rank">{index + 1}</div>
                        <div className="reports-ranked-main">
                          <strong>{item.topic_title}</strong>
                          <div className="meta-text">
                            {formatLabel(item.topic_type)} | {item.program_name || 'None'}
                          </div>
                        </div>
                        <div className="reports-ranked-stats">
                          <span>{Number(item.total_times_used)} uses</span>
                          <span>{Number(item.focus_count)} focus</span>
                        </div>
                        <div className="inline-actions">
                          <Link className="secondary-button" to={`/topics?topicId=${item.topic_id}`}>
                            Open topic
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ExpandableSection>
            </section>

            <ExpandableSection
            title="Recent Classes"
              note="The most recent classes included in this reporting view."
              summary="Expand when you want to connect these signals back to real sessions."
              className="reports-activity-section"
            >
              {recentClasses.length === 0 ? (
                <p className="empty-state">No recent classes to show yet.</p>
              ) : (
                <div className="reports-activity-list">
                  {recentClasses.map((item) => (
                    <article key={item.id} className="reports-activity-item">
                      <div className="reports-activity-header">
                        <strong>{item.title || 'Untitled Class'}</strong>
                        <span className="meta-text">
                          {new Date(item.class_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="reports-activity-meta">
                        <span>Program: {item.program_name}</span>
                        <span>
                          Coach: {item.head_coach_first_name} {item.head_coach_last_name}
                        </span>
                      </div>
                      <div className="meta-text">{item.notes || 'No notes added yet.'}</div>
                      <div className="inline-actions">
                        <Link className="secondary-button" to={`/classes?openClassId=${item.id}`}>
                          Open class
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </ExpandableSection>
          </>
        )}
      </div>
    </Layout>
  );
}
