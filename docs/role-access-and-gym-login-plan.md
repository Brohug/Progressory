# Role Access And Gym Login Plan

## Permission matrix

This is the intended default product split for gym accounts.

| Area | Owner | Admin | Coach | Member |
| --- | --- | --- | --- | --- |
| Sign in to app | Yes | Yes | Yes | Yes |
| Dashboard | Yes | Yes | Yes | Limited |
| Curriculum index / decision tree | Yes | Yes | Yes | Yes |
| Library viewing | Yes | Yes | Yes | Yes if visibility allows |
| Library create/edit/delete | Yes | Yes | No | No |
| Programs | Yes | Yes | View only | No |
| Topics | Yes | Yes | View only | No |
| Training scenarios | Yes | Yes | View only | No |
| Planned classes | Yes | Yes | Yes | No |
| Live classes | Yes | Yes | Yes | No |
| Attendance | Yes | Yes | Yes | No |
| Member records | Yes | Yes | Yes | Own progress only |
| Member progress updates | Yes | Yes | Yes | No |
| Reports | Yes | Yes | Yes | No |
| Staff management | Yes | No | No | No |
| Staff role changes | Yes | No | No | No |
| Owner role changes | No in-app | No | No | No |
| Billing / gym settings | Yes | No | No | No |

## Product rules

- There is exactly one true owner account per gym in-app.
- Owners can create admin and coach accounts, but the app does not allow promoting someone to owner.
- Admin is the gym operations role. It can manage curriculum structure and day-to-day setup, but not staff ownership.
- Coach is the teaching role. It can run classes, attendance, reports, progress, and class planning, but should not control the whole curriculum model or staff setup.
- Member is the student/parent role. It should be limited to learner-facing views and personal progress.

## Current implementation notes

The codebase now enforces the following:

- Staff setup and staff account management are owner-only.
- Programs, topics, training methods, and training scenarios are owner/admin write areas.
- Coaches remain allowed in operational teaching areas like classes, planned classes, members, progress, and reports.
- Staff members now use invite links to set their own password instead of the owner choosing it for them.

## Staff onboarding flow

### Owner flow

1. Owner opens the Staff page.
2. Owner enters first name, last name, email, and role.
3. App generates a staff setup link.
4. Owner copies the link and sends it by email, text, or private message.
5. Staff member opens the link and creates their own password.

### Existing staff reset flow

1. Owner opens the Staff page.
2. Owner chooses `Create Reset Link`.
3. App generates a new one-time password link.
4. Staff member opens the link and sets a new password.

### Staff first login

1. Staff member opens `/staff-access/:token`.
2. Staff member confirms a new password.
3. App activates the account and signs them in.

## Gym-specific login and QR plan

### Goal

Each gym should have a simple handoff path for students, parents, and staff that feels gym-specific instead of generic.

### Recommended structure

- Primary production app stays a secure HTTPS web app.
- Each gym gets a branded login landing page keyed by gym slug.
- QR codes point to that gym-specific landing page, not directly to a raw invite token.

### Recommended URLs

- Staff / owner login: `/login?gym=<slug>`
- Member or parent access landing page: `/join/<slug>`
- Invite links remain one-time secure URLs:
  - `/member-access/<token>`
  - `/staff-access/<token>`

### QR code usage

- Front desk QR: points to the gym member landing page.
- Staff room QR: points to the gym staff login page.
- Printed handout QR: points to the gym-specific onboarding page with clear paths for parents, students, and staff.

### Why this direction

- Works immediately on web.
- Opens cleanly from iPhone or Android camera scans.
- Avoids forcing native-app-only onboarding too early.
- Still leaves the door open for later iOS/Android wrappers using the same URLs and auth model.

## Suggested next rollout

1. Add gym-specific landing pages keyed by gym slug.
2. Add QR code generation in the owner/admin UI.
3. Add email sending for staff and member invite links.
4. Add a small permissions screen in the Staff page so owners can see what each role can actually do.
