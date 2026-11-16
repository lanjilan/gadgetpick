PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS import_batches (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT (datetime('now')),
  origin TEXT NOT NULL CHECK(origin='shopee_csv'), row_count INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS import_rows (
  batch_id TEXT NOT NULL REFERENCES import_batches(id), external_id TEXT NOT NULL,
  payload_json TEXT NOT NULL CHECK(json_valid(payload_json)),
  status TEXT NOT NULL DEFAULT 'staged' CHECK(status IN ('staged','reviewed','rejected')),
  PRIMARY KEY(batch_id,external_id)
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
  specs_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(specs_json)),
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK(is_demo IN (0,1))
);
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY, creator TEXT NOT NULL, title TEXT NOT NULL, url TEXT NOT NULL,
  origin TEXT NOT NULL CHECK(origin IN ('review','manufacturer','kitab_audio','own_test')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK(verification_status IN ('pending','verified','rejected')),
  permission_status TEXT NOT NULL DEFAULT 'pending' CHECK(permission_status IN ('pending','granted','not_required','denied')),
  permission_proof_url TEXT, verified_at TEXT,
  CHECK(origin != 'kitab_audio' OR permission_status != 'granted' OR permission_proof_url IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id), source_id TEXT NOT NULL REFERENCES sources(id),
  tier TEXT NOT NULL, reason TEXT NOT NULL, drawbacks TEXT NOT NULL,
  needs_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(needs_json)),
  character_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(character_json)),
  affiliate_owner TEXT NOT NULL CHECK(affiliate_owner IN ('site','fernanda','none')),
  affiliate_url TEXT, affiliate_original_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  reviewed_at TEXT,
  CHECK(affiliate_owner!='fernanda' OR (affiliate_url IS NOT NULL AND affiliate_url=affiliate_original_url))
);
CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id),
  price INTEGER NOT NULL CHECK(price>0), observed_at TEXT NOT NULL,
  source TEXT NOT NULL, stock_status TEXT NOT NULL DEFAULT 'unknown' CHECK(stock_status IN ('unknown','available','unavailable'))
);
CREATE INDEX IF NOT EXISTS idx_offers_product_time ON offers(product_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status,product_id);
CREATE TRIGGER IF NOT EXISTS kitab_insert_guard BEFORE INSERT ON recommendations
WHEN (SELECT origin FROM sources WHERE id=NEW.source_id)='kitab_audio'
AND (NEW.affiliate_owner!='fernanda' OR NEW.affiliate_url IS NULL OR NEW.affiliate_url!=NEW.affiliate_original_url)
BEGIN SELECT RAISE(ABORT,'Kitab Audio requires original Fernanda affiliate URL'); END;
CREATE TRIGGER IF NOT EXISTS kitab_update_guard BEFORE UPDATE ON recommendations
WHEN (SELECT origin FROM sources WHERE id=NEW.source_id)='kitab_audio'
AND (NEW.affiliate_owner!='fernanda' OR NEW.affiliate_url IS NULL OR NEW.affiliate_url!=NEW.affiliate_original_url)
BEGIN SELECT RAISE(ABORT,'Kitab Audio requires original Fernanda affiliate URL'); END;
