UPDATE event_published
SET orphan = UTC_TIMESTAMP()
WHERE event_id = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin