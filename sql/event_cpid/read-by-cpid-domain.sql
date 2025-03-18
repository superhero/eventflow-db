SELECT event.*
FROM event_cpid
JOIN event 
  ON event_id = id AND event.domain = event_cpid.domain
WHERE event_cpid.cpid   = ?
  AND event_cpid.domain = ?
ORDER BY timestamp ASC