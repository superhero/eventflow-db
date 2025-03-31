CREATE TABLE IF NOT EXISTS event_eid 
(
  event_id  VARCHAR(64) NOT NULL,
  eid       VARCHAR(64) NOT NULL,

  PRIMARY KEY (event_id, eid),
  FOREIGN KEY (event_id) REFERENCES event (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_eid (eid)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET ascii
DEFAULT COLLATE ascii_bin