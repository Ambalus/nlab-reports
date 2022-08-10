select distinct t.text
from (select (select text
              from doctor d
              where d.id = tr.validation_doctor_id) as text
      from test_result tr
      where tr.lab_sample_id = :sampleId
            ---and tr.lab_test_id in (select st.test_id
            ---from serv_test st
            ---join lab_research lr on lr.serv_id = st.serv_id
            ---where lr.id in (:researches))
      union
      select (select text
              from doctor d
              where d.id = mr.validation_doctor_id) as text
      from mbio_research mr
      where mr.sample_id = :sampleId
         ---and mr.research_id in (:researches)
     ) t
where t.text is not null
