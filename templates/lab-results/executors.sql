select distinct t.text as text
from (select tr.executor_text as text
      from test_result tr
      where tr.lab_sample_id = :sampleId
         ---and tr.lab_test_id in (select st.test_id
         ---from serv_test st
         ---join lab_research lr on lr.serv_id = st.serv_id
         ---where lr.id in (:researches))
     ) t
where t.text is not null