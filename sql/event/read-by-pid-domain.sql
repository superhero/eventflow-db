SELECT *
FROM event
WHERE pid    = ?
  AND domain = ?
ORDER BY timestamp ASC