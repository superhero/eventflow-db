CREATE TABLE IF NOT EXISTS log 
(
  timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  agent     VARCHAR(64) NOT NULL CHARACTER SET ascii    COLLATE ascii_bin,
  message   TEXT        NOT NULL CHARACTER SET utf8mb4  COLLATE utf8mb4_general_ci,
  error     JSON        NOT NULL,
  INDEX idx_timestamp (timestamp),
  INDEX idx_agent (agent)
)
ENGINE=InnoDB
PARTITION BY RANGE (TO_DAYS(timestamp)) 
(
  PARTITION p_hot VALUES LESS THAN MAXVALUE
)
