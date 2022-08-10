select t.note as TEXT
from (select (select s.note
              from serv s
              where lr.serv_id = s.id) as note
      from lab_research lr
      where lr.lab_sample_id = :sampleId
         ---and lr.id in (:researches)
     ) t
where t.note is not null