SELECT event.*
FROM event_cpid

JOIN event 
  ON event_id = event.id 

WHERE event_cpid.cpid   = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
  AND event_cpid.domain = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin

ORDER BY timestamp ASC