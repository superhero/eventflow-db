SELECT *
FROM event
WHERE pid    = ?
  AND domain = ?
  AND timestamp BETWEEN ? AND ?
ORDER BY timestamp ASC