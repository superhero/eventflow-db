CREATE TABLE IF NOT EXISTS hub 
(
  id            VARCHAR(64)       NOT NULL,
  timestamp     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  external_ip   VARCHAR(16)       NOT NULL,
  external_port SMALLINT UNSIGNED NOT NULL,
  internal_ip   VARCHAR(16)       NOT NULL,
  internal_port SMALLINT UNSIGNED NOT NULL,
  quit          DATETIME              NULL,

  PRIMARY KEY (id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_external_ip_port (external_ip, external_port),
  INDEX idx_internal_ip_port (internal_ip, internal_port)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET ascii
DEFAULT COLLATE ascii_bin