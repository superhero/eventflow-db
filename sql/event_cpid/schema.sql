CREATE TABLE IF NOT EXISTS event_cpid 
(
  event_id  VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  domain    VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,
  cpid      VARCHAR(64) NOT NULL CHARACTER SET ascii COLLATE ascii_bin,

  PRIMARY KEY (event_id, domain, cpid),
  FOREIGN KEY (event_id) REFERENCES event (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_domain_cpid (domain, cpid)
)
ENGINE=InnoDB