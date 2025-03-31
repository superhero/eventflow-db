CREATE TABLE IF NOT EXISTS event_published 
(
  event_id        VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  published       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  publisher       VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  consumer        VARCHAR(64)     NULL CHARACTER SET ascii COLLATE ascii_bin,
  hub             VARCHAR(64)     NULL CHARACTER SET ascii COLLATE ascii_bin,
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
