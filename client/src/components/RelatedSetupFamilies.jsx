import { Link } from 'react-router-dom';
import { buildEntrySetupsDecisionTreeLink, buildEntrySetupsLink } from '../data/entrySetupFamilies';

export default function RelatedSetupFamilies({
  families,
  title = 'Related setup families',
  source = ''
}) {
  if (!families?.length) {
    return null;
  }

  return (
    <div className="related-setup-families">
      <span className="meta-text">{title}</span>
      <div className="related-setup-family-list">
        {families.map((family) => (
          <div key={`related-setup-family-${family.title}`} className="related-setup-family-item">
            <strong>{family.title}</strong>
            <p className="section-note related-setup-family-summary">{family.summary}</p>
            {family.nextAttacks?.length ? (
              <div className="related-setup-family-preview">
                <span className="meta-text">Common next attacks</span>
                <div className="curriculum-index-tag-row">
                  {family.nextAttacks.slice(0, 3).map((attack) => (
                    <span key={`${family.title}-${attack}`} className="entry-setup-info-chip">
                      {attack}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="inline-actions related-setup-family-actions">
              <Link className="secondary-button" to={buildEntrySetupsLink(family.title, source)}>
                Open in Entry Setups
              </Link>
              <Link className="secondary-button" to={buildEntrySetupsDecisionTreeLink(family, source)}>
                Continue in Decision Trees
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
