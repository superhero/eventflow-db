UPDATE event_published
SET success    = UTC_TIMESTAMP()
WHERE event_id = ?