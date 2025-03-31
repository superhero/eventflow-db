SELECT event.*
FROM event_cpid
JOIN event 
  ON event_id = event.id AND event.domain = event_cpid.domain
WHERE event_cpid.cpid   = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
  AND event_cpid.domain = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
ORDER BY timestamp ASC