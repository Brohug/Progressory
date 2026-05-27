const OWNER_NOTIFICATION_EMAIL = String(
  process.env.OWNER_NOTIFICATION_EMAIL || 'owner.progressory@gmail.com'
).trim();

const RESEND_API_URL = 'https://api.resend.com/emails';

const isNotificationConfigured = () => (
  Boolean(String(process.env.RESEND_API_KEY || '').trim())
  && Boolean(String(process.env.NOTIFICATION_FROM_EMAIL || '').trim())
  && Boolean(OWNER_NOTIFICATION_EMAIL)
);

const buildInquiryNotificationBody = ({
  inquiryId,
  requestType,
  firstName,
  lastName,
  email,
  phone,
  gymName,
  demoSlotStart
}) => {
  const lines = [
    `Progressory ${requestType} request received`,
    '',
    `Inquiry ID: ${inquiryId}`,
    `Request type: ${requestType}`,
    `First name: ${firstName}`,
    `Last name: ${lastName}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Gym: ${gymName}`
  ];

  if (demoSlotStart) {
    lines.push(`Requested demo slot: ${demoSlotStart}`);
  }

  lines.push('');
  lines.push('Recommended founder flow:');
  lines.push('1. Reply and confirm fit.');
  lines.push('2. If approved, provision the gym owner invite.');
  lines.push('3. Have the owner log in and start founder checkout from Billing.');

  return lines.join('\n');
};

const buildFounderInviteEmailBody = ({
  firstName,
  gymName,
  inviteUrl,
  inviteExpiresAt
}) => {
  const lines = [
    `Hi ${firstName || 'there'},`,
    '',
    `Your Progressory founder setup is ready for ${gymName}.`,
    '',
    'Use this invite link to create your owner password and access your gym workspace:',
    inviteUrl,
    '',
    `This invite expires on: ${inviteExpiresAt}`,
    '',
    'Recommended next steps:',
    '1. Open the invite link and finish your owner account setup.',
    '2. Log in to Progressory.',
    '3. Open Billing and start the Founder Plan checkout.',
    '4. Once billing is active or trialing, your gym will have access.',
    '',
    `Questions before you jump in? Reply back to ${OWNER_NOTIFICATION_EMAIL}.`
  ];

  return lines.join('\n');
};

const sendOwnerInquiryNotification = async (inquiry) => {
  if (!isNotificationConfigured()) {
    return {
      delivered: false,
      skipped: true,
      reason: 'notification_not_configured'
    };
  }

  const resendApiKey = String(process.env.RESEND_API_KEY || '').trim();
  const fromEmail = String(process.env.NOTIFICATION_FROM_EMAIL || '').trim();
  const requestTypeLabel = inquiry.requestType === 'demo' ? 'Demo request' : 'Founder access request';

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [OWNER_NOTIFICATION_EMAIL],
      subject: `Progressory ${requestTypeLabel} - ${inquiry.gymName}`,
      text: buildInquiryNotificationBody(inquiry)
    })
  });

  if (!response.ok) {
    const error = new Error('Owner inquiry notification failed.');
    error.statusCode = response.status;
    error.isNotificationError = true;
    throw error;
  }

  return {
    delivered: true,
    skipped: false
  };
};

const sendFounderInviteNotification = async ({
  firstName,
  founderEmail,
  gymName,
  inviteUrl,
  inviteExpiresAt
}) => {
  if (!isNotificationConfigured()) {
    return {
      delivered: false,
      skipped: true,
      reason: 'notification_not_configured'
    };
  }

  const resendApiKey = String(process.env.RESEND_API_KEY || '').trim();
  const fromEmail = String(process.env.NOTIFICATION_FROM_EMAIL || '').trim();

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [String(founderEmail || '').trim().toLowerCase()],
      reply_to: OWNER_NOTIFICATION_EMAIL,
      subject: `Your Progressory founder setup invite - ${gymName}`,
      text: buildFounderInviteEmailBody({
        firstName,
        gymName,
        inviteUrl,
        inviteExpiresAt
      })
    })
  });

  if (!response.ok) {
    const error = new Error('Founder invite notification failed.');
    error.statusCode = response.status;
    error.isNotificationError = true;
    throw error;
  }

  return {
    delivered: true,
    skipped: false
  };
};

module.exports = {
  OWNER_NOTIFICATION_EMAIL,
  isNotificationConfigured,
  sendOwnerInquiryNotification,
  sendFounderInviteNotification
};
