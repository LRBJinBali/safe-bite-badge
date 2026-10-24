CREATE TABLE awards (
  stall_id TEXT NOT NULL,
  browser_id TEXT NOT NULL,
  badge TEXT NOT NULL,
  month TEXT NOT NULL,
  simulated INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (stall_id, browser_id, badge)
);
CREATE INDEX awards_month ON awards (month);

CREATE TABLE award_sessions (
  stall_id TEXT NOT NULL,
  browser_id TEXT NOT NULL,
  month TEXT NOT NULL,
  PRIMARY KEY (stall_id, browser_id, month)
);

CREATE TABLE reactions (
  item_id TEXT NOT NULL,
  browser_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  simulated INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (item_id, browser_id, kind)
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (email, role)
);
CREATE TABLE login_codes (
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (email, role)
);
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE vendor_venues (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  market TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE readiness_items (
  venue_id TEXT NOT NULL,
  item_key TEXT NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (venue_id, item_key)
);
CREATE TABLE registration_steps (
  venue_id TEXT NOT NULL,
  step_key TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (venue_id, step_key)
);
CREATE TABLE visit_requests (
  ref TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE rate_limits (
  key TEXT NOT NULL,
  window INTEGER NOT NULL,
  n INTEGER NOT NULL,
  PRIMARY KEY (key, window)
);

-- Demo-mode event log: powers the admin overview's activity list. Never holds personal data.
CREATE TABLE activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  detail TEXT NOT NULL,
  simulated INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
