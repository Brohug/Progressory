import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getEntrySetupFamilySlug, setupFamilies } from '../data/entrySetupFamilies';

const buildCurriculumLink = (search) => `/index?search=${encodeURIComponent(search)}`;
const buildDecisionTreeLink = (search, setupFamily) => (
  `/decision-tree?search=${encodeURIComponent(search)}&setupFamily=${encodeURIComponent(setupFamily)}`
);

export default function EntrySetupsPage() {
  const [searchParams] = useSearchParams();
  const selectedFamily = searchParams.get('family') || '';
  const [familySearch, setFamilySearch] = useState('');
  const [activeLane, setActiveLane] = useState('');
  const [expandedFamilies, setExpandedFamilies] = useState({});
  const [isMobileCompactCards, setIsMobileCompactCards] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth <= 720 : false
  ));
  const quickLanes = useMemo(() => ['Standing', 'Guard', 'Passing', 'Submission'], []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 720px)');
    const syncCompactState = (event) => {
      setIsMobileCompactCards(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncCompactState);
      return () => mediaQuery.removeEventListener('change', syncCompactState);
    }

    mediaQuery.addListener(syncCompactState);
    return () => mediaQuery.removeListener(syncCompactState);
  }, []);

  useEffect(() => {
    if (!selectedFamily) {
      return;
    }

    const familyId = `entry-setup-family-${getEntrySetupFamilySlug(selectedFamily)}`;

    window.setTimeout(() => {
      document.getElementById(familyId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 120);
  }, [selectedFamily]);

  const filteredSetupFamilies = useMemo(() => {
    const normalizedSearch = familySearch
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return activeLane
        ? setupFamilies.filter((family) => family.lane === activeLane)
        : setupFamilies;
    }

    return setupFamilies.filter((family) => {
      const haystack = [
        family.lane,
        family.title,
        family.summary,
        family.description,
        ...(family.setupNodes || []),
        ...(family.nextAttacks || []),
        ...(family.exampleSequence || [])
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch) && (!activeLane || family.lane === activeLane);
    });
  }, [activeLane, familySearch]);

  const toggleFamily = (familyTitle) => {
    setExpandedFamilies((current) => ({
      ...current,
      [familyTitle]: !current[familyTitle]
    }));
  };

  const getSequenceStepTone = (index, totalSteps) => {
    if (index === 0) {
      return 'start';
    }

    if (index === totalSteps - 1) {
      return 'finish';
    }

    return 'middle';
  };

  return (
    <Layout>
      <div className="entry-setups-page">
        <h2 className="page-title">Entry Setups</h2>
        <p className="page-intro">
          Use this page for the reactions and opening moves that create the attack before the actual takedown,
          submission, sweep, or back take begins. Curriculum holds the full map, and Decision Trees help you
          continue the sequence once you choose the branch.
        </p>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>What these setups are for</h3>
              <p className="section-note">These are strong starter chains, not an all-encompassing list of every possible route.</p>
            </div>
          </div>
          <p className="section-note">
            These setups help coaches and students start thinking in sequences. Some are as simple as A plus B. Others
            need A plus B plus C before the real opening appears. The goal is to make one threat open the next limb,
            posture break, or angle.
          </p>
          <p className="section-note">
            If your gym builds other strong setup paths, that is a good thing. This page is here to give practical
            starting structure, not pretend the app already covers every expert variation in the room.
          </p>
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>How this layer works</h3>
              <p className="section-note">Setups are the bridge between isolated techniques and real sequences.</p>
            </div>
          </div>
          <div className="action-grid entry-setups-overview-grid">
            <div className="action-card dashboard-action-card">
              <strong>Setups</strong>
              <p className="section-note">The opening reactions you create first: head touch, level change, collar tie, drag, snap, or post break.</p>
            </div>
            <div className="action-card dashboard-action-card">
              <strong>Entries</strong>
              <p className="section-note">The first committed attack: ankle pick, single leg, front headlock, arm drag, or sweep entry.</p>
            </div>
            <div className="action-card dashboard-action-card">
              <strong>Sequences</strong>
              <p className="section-note">The follow-up chain after the first answer: sprawl to front headlock, drag to back, or wrestle-up to top control.</p>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Setup families</h3>
              <p className="section-note">Start with the setup family, then jump into Curriculum or Decision Trees from the branch you want.</p>
            </div>
          </div>

          <div className="entry-setups-search-shell">
            <div className="entry-setups-search-row">
              <div>
                <label htmlFor="entry-setup-search">Search setup families</label>
                <input
                  id="entry-setup-search"
                  type="text"
                  value={familySearch}
                  onChange={(event) => setFamilySearch(event.target.value)}
                  placeholder="Search single leg, front headlock, guard, passing..."
                />
              </div>
            </div>
            <div className="entry-setups-lane-row">
              <button
                type="button"
                className={`secondary-button${!activeLane ? ' is-active' : ''}`}
                onClick={() => setActiveLane('')}
              >
                All lanes
              </button>
              {quickLanes.map((lane) => (
                <button
                  key={lane}
                  type="button"
                  className={`secondary-button${activeLane === lane ? ' is-active' : ''}`}
                  onClick={() => setActiveLane(lane)}
                >
                  {lane}
                </button>
              ))}
            </div>
            <div className="entry-setups-search-summary">
              <span className="entry-setup-info-chip">
                {filteredSetupFamilies.length} famil{filteredSetupFamilies.length === 1 ? 'y' : 'ies'} shown
              </span>
              <span className="entry-setup-info-chip">
                {setupFamilies.length} total families
              </span>
              {familySearch || activeLane ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setFamilySearch('');
                    setActiveLane('');
                  }}
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>

          <div className="action-grid entry-setups-family-grid">
            {filteredSetupFamilies.length === 0 ? (
              <div className="empty-state">
                <p>No setup families match that search yet.</p>
              </div>
            ) : (
              filteredSetupFamilies.map((family) => {
                const isExpanded = !isMobileCompactCards || Boolean(expandedFamilies[family.title]) || selectedFamily === family.title;

                return (
                  <article
                    key={family.title}
                    id={`entry-setup-family-${getEntrySetupFamilySlug(family.title)}`}
                    className={`action-card dashboard-action-card entry-setup-family-card${selectedFamily === family.title ? ' is-selected' : ''}${isMobileCompactCards ? ' is-collapsible' : ''}${isExpanded ? ' is-expanded' : ''}`}
                  >
                    <div className="entry-setup-family-header">
                      <div>
                        <strong>{family.title}</strong>
                        <span className="meta-text">{family.summary}</span>
                        <div className="entry-setup-family-lane">
                          <span className="entry-setup-info-chip">{family.lane}</span>
                        </div>
                      </div>
                      {isMobileCompactCards ? (
                        <button
                          type="button"
                          className="secondary-button entry-setup-family-toggle"
                          onClick={() => toggleFamily(family.title)}
                        >
                          {isExpanded ? 'Hide' : 'Expand'}
                        </button>
                      ) : null}
                    </div>

                    <div className="entry-setup-family-actions">
                      <Link className="secondary-button" to={buildCurriculumLink(family.curriculumSearch)}>
                        Open in Curriculum
                      </Link>
                      <Link className="secondary-button" to={buildDecisionTreeLink(family.treeSearch, family.title)}>
                        Continue in Decision Trees
                      </Link>
                    </div>

                    {isExpanded ? (
                      <>
                        <p className="section-note">{family.description}</p>

                        <div className="entry-setup-family-block">
                          <span className="meta-text">Setup nodes</span>
                          <div className="suggestion-chip-row">
                            {family.setupNodes.map((node) => (
                              <span key={`${family.title}-${node}`} className="entry-setup-info-chip entry-setup-info-chip-accent">
                                {node}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="entry-setup-family-block">
                          <span className="meta-text">Common next attacks</span>
                          <div className="suggestion-chip-row">
                            {family.nextAttacks.map((attack) => (
                              <span key={`${family.title}-${attack}`} className="entry-setup-info-chip">
                                {attack}
                              </span>
                            ))}
                          </div>
                        </div>

                        {family.exampleSequence?.length ? (
                          <div className="entry-setup-family-block">
                            <span className="meta-text">Example sequence</span>
                            <div className="entry-setup-sequence-row">
                              {family.exampleSequence.map((step, index) => {
                                const stepTone = getSequenceStepTone(index, family.exampleSequence.length);

                                return (
                                  <Fragment key={`${family.title}-step-${step}`}>
                                    {index > 0 ? (
                                      <span className="entry-setup-sequence-arrow" aria-hidden="true">
                                        →
                                      </span>
                                    ) : null}
                                    <div
                                      className={`entry-setup-sequence-step entry-setup-sequence-step-${stepTone}`}
                                    >
                                      <span className="entry-setup-info-chip entry-setup-sequence-chip">
                                        {step}
                                      </span>
                                    </div>
                                  </Fragment>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="entry-setup-family-collapsed-preview">
                        <span className="meta-text">Common next attacks</span>
                        <div className="suggestion-chip-row">
                          {family.nextAttacks.slice(0, 3).map((attack) => (
                            <span key={`${family.title}-preview-${attack}`} className="entry-setup-info-chip">
                              {attack}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>What comes next</h3>
              <p className="section-note">This first version organizes setup families. A later layer can add full reaction-by-reaction sequences.</p>
            </div>
          </div>
          <p className="section-note">
            The future version of this feature should let a coach or student move through a full chain like:
            head touch - level change - ankle pick - single leg - sprawl reaction - front headlock - turtle attack,
            then continue the rest of the branch inside Decision Trees.
          </p>
        </section>
      </div>
    </Layout>
  );
}
