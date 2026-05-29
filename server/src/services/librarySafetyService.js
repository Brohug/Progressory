const allowedMimeTypes = new Set([
  'video/mp4',
  'video/webm',
  'image/jpeg',
  'image/png',
  'application/pdf'
]);

const reportReasons = new Set([
  'inappropriate_content',
  'minor_safety_concern',
  'copyright_or_permission_issue',
  'harassment_or_abuse',
  'other'
]);

const visibilityOptions = ['coach_only', 'members', 'parents', 'members_and_parents'];
const contentStatuses = ['active', 'hidden', 'deleted'];

const normalizePositiveInt = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const getMaxUploadBytes = (mimeType) => {
  const normalizedMimeType = String(mimeType || '').toLowerCase();
  const maxUploadMb = Number.parseInt(process.env.MAX_UPLOAD_MB || '100', 10);
  const safeDefault = Number.isInteger(maxUploadMb) && maxUploadMb > 0 ? maxUploadMb : 100;

  if (normalizedMimeType.startsWith('image/')) {
    return Math.min(safeDefault, 25) * 1024 * 1024;
  }

  if (normalizedMimeType === 'application/pdf') {
    return Math.min(safeDefault, 25) * 1024 * 1024;
  }

  return safeDefault * 1024 * 1024;
};

const validateUploadMetadata = ({
  originalFilename,
  mimeType,
  fileSize,
  contentSafetyConfirmed
}) => {
  if (contentSafetyConfirmed !== true) {
    return 'Confirm that this content is appropriate and safe before uploading it.';
  }

  const hasAnyUploadMetadata = [
    originalFilename,
    mimeType,
    fileSize
  ].some((value) => value !== undefined && value !== null && value !== '');

  if (!hasAnyUploadMetadata) {
    return '';
  }

  if (!mimeType || !allowedMimeTypes.has(String(mimeType).toLowerCase())) {
    return 'Only MP4, WebM, JPEG, PNG, and PDF content is allowed.';
  }

  const parsedFileSize = normalizePositiveInt(fileSize);

  if (parsedFileSize === null) {
    return 'File size is invalid.';
  }

  if (parsedFileSize > getMaxUploadBytes(mimeType)) {
    return 'This file is larger than the current upload size limit.';
  }

  if (!String(originalFilename || '').trim()) {
    return 'Original filename is required when upload metadata is provided.';
  }

  return '';
};

const canUploadLibraryContent = (user) => (
  user?.role === 'owner'
  || user?.role === 'admin'
  || (user?.role === 'coach' && user?.can_upload_library_content === true)
);

const canManageLibraryEntry = (user, entry) => {
  if (!user || !entry) {
    return false;
  }

  if (user.role === 'owner' || user.role === 'admin') {
    return true;
  }

  return (
    user.role === 'coach'
    && user.can_upload_library_content === true
    && Number(entry.created_by_user_id) === Number(user.id)
  );
};

module.exports = {
  allowedMimeTypes,
  reportReasons,
  visibilityOptions,
  contentStatuses,
  validateUploadMetadata,
  canUploadLibraryContent,
  canManageLibraryEntry
};
