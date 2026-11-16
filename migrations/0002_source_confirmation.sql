ALTER TABLE sources ADD COLUMN permission_confirmation TEXT;
ALTER TABLE import_batches ADD COLUMN source_origin TEXT NOT NULL DEFAULT 'shopee_csv';
