UPDATE event_published

SET
  consumed_spoke = UTC_TIMESTAMP(),
  consumer       = ?

WHERE event_id = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
  AND consumed_spoke IS NULL
