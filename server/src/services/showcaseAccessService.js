const pool = require('../config/db');

const SHOWCASE_GYM_SLUG = 'progressory-demo-academy';

let showcaseGymPromise = null;

const loadPlatformAdminShowcaseGym = async (queryable = pool) => {
  const [rows] = await queryable.query(
    `SELECT id, name, slug
     FROM gyms
     WHERE slug = ?
     LIMIT 1`,
    [SHOWCASE_GYM_SLUG]
  );

  return rows[0] || null;
};

const getPlatformAdminShowcaseGym = async (queryable = pool) => {
  if (queryable !== pool) {
    return loadPlatformAdminShowcaseGym(queryable);
  }

  if (!showcaseGymPromise) {
    showcaseGymPromise = loadPlatformAdminShowcaseGym(queryable).catch((error) => {
      showcaseGymPromise = null;
      throw error;
    });
  }

  return showcaseGymPromise;
};

const applyPlatformAdminShowcaseContext = async (user, isPlatformAdmin, queryable = pool) => {
  if (!user || !isPlatformAdmin) {
    return user;
  }

  const showcaseGym = await getPlatformAdminShowcaseGym(queryable);

  if (!showcaseGym) {
    return {
      ...user,
      is_showcase_mode: false
    };
  }

  return {
    ...user,
    actual_gym_id: user.gym_id,
    actual_gym_name: user.gym_name,
    gym_id: showcaseGym.id,
    gym_name: showcaseGym.name,
    slug: showcaseGym.slug,
    is_showcase_mode: true
  };
};

module.exports = {
  SHOWCASE_GYM_SLUG,
  getPlatformAdminShowcaseGym,
  applyPlatformAdminShowcaseContext
};
