CREATE TABLE IF NOT EXISTS event_eid 
(
  event_id  VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  eid       VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,

  PRIMARY KEY (event_id, eid),
  FOREIGN KEY (event_id) REFERENCES event (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_eid (eid)
)
ENGINE=InnoDB
