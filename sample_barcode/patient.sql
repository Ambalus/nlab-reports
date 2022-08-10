SELECT p.id, p.text
  FROM patient p
 WHERE EXISTS (
    SELECT 1
      FROM lab_sample   ls
          ,lab_research lr
          ,lab_order    lo
     WHERE ls.id = :sampleId
       AND lr.lab_sample_id = ls.id
       AND lr.lab_order_id = lo.id
       AND lo.patient_id = p.id
 )
