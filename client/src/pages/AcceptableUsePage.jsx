import PolicyPageLayout from './PolicyPageLayout';
import { POLICY_SUPPORT_EMAIL, POLICY_VERSION } from '../constants/policies';

export default function AcceptableUsePage() {
  return (
    <PolicyPageLayout
      eyebrow="Acceptable Use"
      title="Progressory Acceptable Use Policy"
      summary={`Version ${POLICY_VERSION}. This MVP policy is meant to reduce risk.`}
    >
      <p>
        Progressory is for martial arts education, curriculum planning, class review, attendance context,
        progress tracking, and gym-created training resources. It is not a general-purpose video-sharing,
        social networking, dating, or entertainment platform.
      </p>
      <p>
        The following content is prohibited: sexual content, pornography, nudity, sexually suggestive content,
        harassment, hate speech, exploitative content, illegal content, and content unsafe for minors. Uploads
        must stay appropriate for martial arts education and gym review.
      </p>
      <p>
        Gym owners and admins are responsible for the content uploaded under their gym account and for making sure
        staff only use Progressory for approved coaching and educational purposes.
      </p>
      <p>
        Progressory may remove content, hide content, restrict uploads, suspend accounts, terminate access, or
        report illegal or child-safety-related material when appropriate. Report policy concerns to{' '}
        <a href={`mailto:${POLICY_SUPPORT_EMAIL}`}>{POLICY_SUPPORT_EMAIL}</a>.
      </p>
    </PolicyPageLayout>
  );
}
