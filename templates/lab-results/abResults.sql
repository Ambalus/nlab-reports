select br.id            as id
      ,br.text          as text
      ,ar.antibiotic_id as antibiotic_id
      ,ar.text          as antibiotic_text
      ,ar.sir           as sir
      ,ar.mic           as mic
      ,ar.dia           as dia
      ,mr.id            as mr_id
  from bacteria_result br
  join mbio_research mr on br.mbio_research_id = mr.id and mr.status = 'VALIDATED' and mr.sample_id = :sampleId
  join antibiotic_result ar on ar.bacteria_result_id = br.id
     ---join lab_research lr on mr.research_id = lr.id
     ---where lr.id in (:researches)
 order by mr_id, id, antibiotic_id