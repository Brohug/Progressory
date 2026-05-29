const { POLICY_VERSION } = require('../constants/policy');

const getAcceptedPolicyVersion = () => POLICY_VERSION;

const buildPolicyAcceptanceColumns = () => ({
  terms_accepted_at: 'NOW()',
  privacy_accepted_at: 'NOW()',
  acceptable_use_accepted_at: 'NOW()',
  child_safety_accepted_at: 'NOW()',
  accepted_policy_version: '?'
});

const validatePolicyAcceptance = (value) => value === true;

module.exports = {
  POLICY_VERSION,
  getAcceptedPolicyVersion,
  buildPolicyAcceptanceColumns,
  validatePolicyAcceptance
};
