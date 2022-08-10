select ls.ids                                              as ids
      ,ls.text                                             as specimen
      ,(select lo.reg_date
          from lab_order lo
         where lo.id = (select max(lr.lab_order_id)
                          from lab_research lr
                         where lr.lab_sample_id = ls.id))  as reg_date
      ,ls.collect_date                                     as collect_date
      ,ls.delivery_date                                    as delivery_date
      ,coalesce(greatest((select max(tr.result_date)
                            from test_result tr
                           where tr.lab_sample_id = ls.id
                             ---and tr.lab_test_id in (select st.test_id
                            ---from serv_test st
                            ---join lab_research lr on lr.serv_id = st.serv_id
                           ---where lr.id in (:researches))
                         )
                        ,(select max(mr.validation_date)
                            from mbio_research mr
                           where mr.sample_id = ls.id
                             ---and mr.research_id in (:researches)
                        ))
              ,(select max(tr.result_date)
                  from test_result tr
                 where tr.lab_sample_id = ls.id
                   ---and tr.lab_test_id in (select st.test_id
                  ---from serv_test st
                  ---join lab_research lr on lr.serv_id = st.serv_id
                 ---where lr.id in (:researches))
               )
              ,(select max(mr.validation_date)
                  from mbio_research mr
                 where mr.sample_id = ls.id
                   ---and mr.research_id in (:researches)
               ))                                          as result_date
      ,(select cp.text
          from collect_place cp
         where cp.id = ls.collect_place_id)                as collect_place
  from lab_sample ls
 where ls.id = :sampleId