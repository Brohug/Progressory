ALTER TABLE planned_classes
    MODIFY COLUMN program_id INT NULL;

ALTER TABLE classes
    MODIFY COLUMN program_id INT NULL;
