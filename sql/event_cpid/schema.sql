CREATE TABLE IF NOT EXISTS event_cpid 
(
  event_id  VARCHAR(64) NOT NULL,
  cpid      VARCHAR(64) NOT NULL,

  PRIMARY KEY (event_id, cpid),
  FOREIGN KEY (event_id) REFERENCES event (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_cpid (cpid)
)
ENGINE=InnoDB