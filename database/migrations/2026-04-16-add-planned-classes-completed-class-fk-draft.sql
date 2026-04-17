-- Draft follow-up migration for stronger referential integrity.
-- Do NOT apply this until after planned_classes has been deployed and used safely.
--
-- Intended sequence:
-- 1. Apply 2026-04-16-add-planned-classes.sql
-- 2. Use and validate the feature in local/dev, then production
-- 3. Confirm every non-null completed_class_id points to a real classes.id row
-- 4. Only then apply this migration
--
-- Preflight verification query:
-- SELECT pc.id, pc.completed_class_id
-- FROM planned_classes pc
-- LEFT JOIN classes c ON pc.completed_class_id = c.id
-- WHERE pc.completed_class_id IS NOT NULL
--   AND c.id IS NULL;
--
-- Expected result before applying:
--   zero rows
--
-- If any rows are returned:
-- - fix or null out those completed_class_id values first
-- - then apply the foreign key migration

ALTER TABLE planned_classes
    ADD CONSTRAINT fk_planned_classes_completed_class
        FOREIGN KEY (completed_class_id) REFERENCES classes(id)
        ON DELETE SET NULL;
