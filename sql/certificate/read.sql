SELECT *
FROM certificate
WHERE id = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
  AND version = 0
  AND revoked IS NULL