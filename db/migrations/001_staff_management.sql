-- Apply once to an existing database before deploying the staff manager.
ALTER TABLE quick_links ALTER COLUMN icon SET DEFAULT 'link';
UPDATE quick_links SET icon = 'link' WHERE icon IS NULL OR icon = '';
ALTER TABLE quick_links ALTER COLUMN icon SET NOT NULL;
ALTER TABLE feature_tiles ALTER COLUMN icon SET DEFAULT 'link';
UPDATE feature_tiles SET icon = 'link' WHERE icon IS NULL OR icon = '';
ALTER TABLE feature_tiles ALTER COLUMN icon SET NOT NULL;

CREATE TABLE staff_users (
    id            serial PRIMARY KEY,
    username      text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role          text NOT NULL CHECK (role IN ('manager', 'admin')),
    active        boolean NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE staff_sessions (
    id         bigserial PRIMARY KEY,
    user_id    int NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX staff_sessions_expiry_idx ON staff_sessions (expires_at);
