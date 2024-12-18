UPDATE event_scheduled
SET success    = UTC_TIMESTAMP()
WHERE event_id = ?