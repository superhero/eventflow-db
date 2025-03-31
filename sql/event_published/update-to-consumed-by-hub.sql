UPDATE event_published

SET 
  consumed_hub = UTC_TIMESTAMP(),
  hub          = ?

WHERE event_id = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
  AND consumed_hub IS NULL
