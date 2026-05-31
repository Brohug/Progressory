import PolicyPageLayout from './PolicyPageLayout';
import { POLICY_SUPPORT_EMAIL, POLICY_SUPPORT_LINK_LABEL, POLICY_VERSION } from '../constants/policies';

export default function ChildSafetyPage() {
  return (
    <PolicyPageLayout
      eyebrow="Child Safety"
      title="Progressory Child Safety Policy"
      summary={`Version ${POLICY_VERSION}. This MVP policy is designed to reduce risk around youth programs.`}
    >
      <p>
        Progressory may be used by gyms that teach kids and may eventually allow kids or parents to view selected
        educational materials. For that reason, any sexual content, exploitative content, abusive conduct, illegal
        content, or unsafe material involving minors is strictly prohibited.
      </p>
      <p>
        Gyms must have permission or consent before uploading videos, photos, names, likenesses, class recordings,
        or student-related content, especially for minors. Content should be limited to martial arts education,
        curriculum review, class review, and gym-created training resources.
      </p>
      <p>
        Progressory may remove content, restrict accounts, suspend access, terminate use, and report child-safety
        or illegal content when appropriate. Users should report inappropriate or unsafe content immediately to{' '}
        <a href={`mailto:${POLICY_SUPPORT_EMAIL}`}>{POLICY_SUPPORT_LINK_LABEL}</a>.
      </p>
      <p>
        Progressory does not provide public profiles, direct messaging between adults and minors, or member uploads
        in this MVP. Content remains gym-managed and education-focused.
      </p>
    </PolicyPageLayout>
  );
}
