CREATE TABLE IF NOT EXISTS log 
(
  timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  agent     VARCHAR(64) NOT NULL,
  message   TEXT        NOT NULL,
  error     JSON        NOT NULL,
  INDEX idx_timestamp (timestamp),
  INDEX idx_agent (agent)
)
ENGINE=InnoDB
PARTITION BY RANGE (TO_DAYS(timestamp)) 
(
  PARTITION p_hot VALUES LESS THAN MAXVALUE
)
