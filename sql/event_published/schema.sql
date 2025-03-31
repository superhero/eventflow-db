CREATE TABLE IF NOT EXISTS event_published 
(
  event_id        VARCHAR(64) NOT NULL,
  published       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  publisher       VARCHAR(64) NOT NULL,
  consumer        VARCHAR(64)     NULL,
  hub             VARCHAR(64)     NULL,
  consumed_hub    DATETIME        NULL,
  consumed_spoke  DATETIME        NULL,
  success         DATETIME        NULL,
  failed          DATETIME        NULL,
  orphan          DATETIME        NULL,

  PRIMARY KEY (event_id),
  FOREIGN KEY (hub)       REFERENCES hub    (id),
  FOREIGN KEY (event_id)  REFERENCES event  (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_published       (published),
  INDEX idx_consumed_hub    (consumed_hub),
  INDEX idx_consumed_spoke  (consumed_spoke)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET ascii
DEFAULT COLLATE ascii_bin