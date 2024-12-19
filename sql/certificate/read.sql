SELECT *
FROM certificate
WHERE id = ?
  AND version = 0
  AND revoked IS NULL