SELECT event.*
FROM event_eid
JOIN event 
  ON event_id = event.id

WHERE eid    = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
  AND domain = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin

ORDER BY timestamp ASC