import PolicyPageLayout from './PolicyPageLayout';
import { POLICY_SUPPORT_EMAIL, POLICY_SUPPORT_LINK_LABEL, POLICY_VERSION } from '../constants/policies';

export default function TermsPage() {
  return (
    <PolicyPageLayout
      eyebrow="Terms of Service"
      title="Progressory Terms of Service"
      summary={`Version ${POLICY_VERSION}. These are MVP launch terms for Progressory.`}
    >
      <p>
        Progressory is built for martial arts education, curriculum planning, class review, attendance context,
        student progress tracking, and gym-created training resources. It is not a general-purpose media hosting
        platform or community video-sharing service.
      </p>
      <p>
        Gym owners and admins are responsible for content, classes, student records, curriculum resources,
        uploads, and staff activity under their gym account. Gyms must have the rights, permissions, and any
        needed consent before uploading videos, photos, names, likenesses, class recordings, or student-related
        content.
      </p>
      <p>
        Progressory may remove content, restrict features, suspend accounts, terminate accounts, or report
        unlawful or child-safety-related content when appropriate. Use of the service is conditioned on
        following Progressory policies, including the Privacy Policy, Acceptable Use Policy, and Child Safety Policy.
      </p>
      <p>
        Report inappropriate or unsafe content to <a href={`mailto:${POLICY_SUPPORT_EMAIL}`}>{POLICY_SUPPORT_LINK_LABEL}</a>.
      </p>
    </PolicyPageLayout>
  );
}
