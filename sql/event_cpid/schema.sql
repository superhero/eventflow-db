CREATE TABLE IF NOT EXISTS event_cpid 
(
  event_id  VARCHAR(64) NOT NULL,
  domain    VARCHAR(64) NOT NULL,
  cpid      VARCHAR(64) NOT NULL,

  PRIMARY KEY (event_id, domain, cpid),
  FOREIGN KEY (event_id) REFERENCES event (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_domain_cpid (domain, cpid)
)
ENGINE=InnoDB