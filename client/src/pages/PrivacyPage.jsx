import PolicyPageLayout from './PolicyPageLayout';
import { POLICY_SUPPORT_EMAIL, POLICY_SUPPORT_LINK_LABEL, POLICY_VERSION } from '../constants/policies';

export default function PrivacyPage() {
  return (
    <PolicyPageLayout
      eyebrow="Privacy Policy"
      title="Progressory Privacy Policy"
      summary={`Version ${POLICY_VERSION}. This MVP policy describes the main privacy expectations for gyms using Progressory.`}
    >
      <p>
        Progressory stores gym account details, coach and member account information, class planning records,
        attendance context, progress tracking, curriculum resources, and related operational data needed to run
        the service for martial arts gyms.
      </p>
      <p>
        Gyms are responsible for making sure they have permission or consent to upload or manage videos, photos,
        names, likenesses, class recordings, and student-related content. This is especially important when a gym
        teaches minors or allows parents to access selected educational content.
      </p>
      <p>
        Progressory may access or review uploaded materials, reports, and account activity to investigate safety,
        abuse, policy violations, billing issues, or operational problems. Progressory may remove or restrict
        content and accounts when necessary to protect users, minors, or the platform.
      </p>
      <p>
        Privacy and safety questions can be sent to <a href={`mailto:${POLICY_SUPPORT_EMAIL}`}>{POLICY_SUPPORT_LINK_LABEL}</a>.
      </p>
    </PolicyPageLayout>
  );
}
