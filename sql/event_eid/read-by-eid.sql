SELECT event.*
FROM event_eid
JOIN event 
  ON event_id = id
WHERE eid = ?
ORDER BY timestamp ASC