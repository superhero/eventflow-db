DELETE 
FROM event_cpid
WHERE event_id  = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
  AND cpid      = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin