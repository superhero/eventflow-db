CREATE TABLE IF NOT EXISTS event_scheduled 
(
  event_id    VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  timestamp   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  scheduled   DATETIME    NOT NULL,
  executed    DATETIME        NULL,
  success     DATETIME        NULL,
  failed      DATETIME        NULL,

  PRIMARY KEY (event_id),
  FOREIGN KEY (event_id) REFERENCES event (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_timestamp   (timestamp),
  INDEX idx_scheduled   (scheduled),
  INDEX idx_executed    (executed),
  INDEX idx_success     (success),
  INDEX idx_failed      (failed)
)
ENGINE=InnoDB