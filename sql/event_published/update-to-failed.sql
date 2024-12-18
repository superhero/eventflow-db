UPDATE event_published
SET failed     = UTC_TIMESTAMP()
WHERE event_id = ?