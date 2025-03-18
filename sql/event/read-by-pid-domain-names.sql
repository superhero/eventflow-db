SELECT *
FROM event
WHERE pid    = ?
  AND domain = ?
  AND name  IN (?)
ORDER BY timestamp ASC