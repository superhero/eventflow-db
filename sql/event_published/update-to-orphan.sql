UPDATE event_published
SET orphan     = UTC_TIMESTAMP()
WHERE event_id = ?