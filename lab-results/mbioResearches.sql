select mr.id as mr_id
     ,(select lr.text
       from lab_research lr
       where lr.id = mr.research_id) as research_text
  from mbio_research mr
 where mr.sample_id = :sampleId
   and mr.status = 'VALIDATED'
---and mr.research_id in (:researches)