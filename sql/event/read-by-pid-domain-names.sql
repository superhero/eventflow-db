SELECT *
FROM event
WHERE pid    = ?
  AND domain = ?
  AND name  IN (?)