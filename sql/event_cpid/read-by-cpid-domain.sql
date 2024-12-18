SELECT event.*
FROM event_cpid
JOIN event 
  ON event_id = id
WHERE cpid = ?
  AND domain = ?