CREATE TABLE IF NOT EXISTS event
(
  id        VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  domain    VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  rid       VARCHAR(64)     NULL CHARACTER SET ascii COLLATE ascii_bin,
  pid       VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  name      VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  data      JSON        NOT NULL,

  PRIMARY KEY (id),
  FOREIGN KEY (rid) REFERENCES event (id) ON DELETE SET NULL,

  INDEX idx_rid         (rid),
  INDEX idx_name        (name, timestamp),
  INDEX idx_domain      (domain, timestamp),
  INDEX idx_domain_pid  (domain, pid, timestamp)
)
ENGINE=InnoDB