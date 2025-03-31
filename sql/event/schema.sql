CREATE TABLE IF NOT EXISTS event
(
  id        VARCHAR(64) NOT NULL,
  timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  domain    VARCHAR(64) NOT NULL,
  rid       VARCHAR(64)     NULL,
  pid       VARCHAR(64) NOT NULL,
  name      VARCHAR(64) NOT NULL,
  data      JSON        NOT NULL,

  PRIMARY KEY (id),
  FOREIGN KEY (rid) REFERENCES event (id) ON DELETE SET NULL,

  INDEX idx_rid         (rid),
  INDEX idx_name        (name, timestamp),
  INDEX idx_domain      (domain, timestamp),
  INDEX idx_domain_pid  (domain, pid, timestamp)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET ascii
DEFAULT COLLATE ascii_bin