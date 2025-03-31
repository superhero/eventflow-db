UPDATE event_scheduled
SET failed = UTC_TIMESTAMP()
WHERE event_id = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin