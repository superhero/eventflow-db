UPDATE event_published
SET success = UTC_TIMESTAMP()
WHERE event_id = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin