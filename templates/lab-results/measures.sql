select tr.id
     , tr.pathology_status                            as pat
     , tr.text
     , tr.value
     , tr.units
     , tr.norm_text                                   as norm
     , (select lt.format
        from lab_test lt
        where lt.id = tr.lab_test_id)                 as format
     , tr.note
     , (select tg.text
        from test_group tg
        where tg.id = (select lt.test_group_id
                       from lab_test lt
                       where lt.id = tr.lab_test_id)) as group_text
     , (select tg.view_sortcode
        from test_group tg
        where tg.id = (select lt.test_group_id
                       from lab_test lt
                       where lt.id = tr.lab_test_id)) as group_sortcode
     , (select lt.view_sortcode
        from lab_test lt


        where lt.id = tr.lab_test_id)                 as test_sortcode
     , tr.lab_sample_id                               as ls_id
from test_result tr
where tr.suppress_status = 0
  and tr.lab_sample_id = :sampleId
  and tr.value is not null
  and tr.validation_status = 1
  ---and tr.lab_test_id in (select st.test_id
  ---from serv_test st
  ---join lab_research lr on lr.serv_id = st.serv_id
  ---where lr.id in (:researches))
order by ls_id desc, group_sortcode, group_text, test_sortcode, text
