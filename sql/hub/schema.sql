CREATE TABLE IF NOT EXISTS hub 
(
  id            VARCHAR(64)       NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  timestamp     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  external_ip   VARCHAR(16)       NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  external_port SMALLINT UNSIGNED NOT NULL,
  internal_ip   VARCHAR(16)       NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  internal_port SMALLINT UNSIGNED NOT NULL,
  quit          DATETIME              NULL,

  PRIMARY KEY (id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_external_ip_port (external_ip, external_port),
  INDEX idx_internal_ip_port (internal_ip, internal_port)
)
ENGINE=InnoDB