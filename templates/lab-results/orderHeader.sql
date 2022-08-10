-- mock = orderHeader
select (select p.code
          from patient p
         where p.id = (select lo.patient_id
                         from lab_order lo
                        where lo.id = (select max(lr.lab_order_id)
                                         from lab_research lr
                                        where lr.lab_sample_id = ls.id))) as PATIENT_NUM
      ,(select p.text
          from patient p
         where p.id = (select lo.patient_id
                         from lab_order lo
                        where lo.id = (select max(lr.lab_order_id)
                                         from lab_research lr
                                        where lr.lab_sample_id = ls.id))) as PATIENT_TEXT
      ,(select p.sex
          from patient p
         where p.id = (select lo.patient_id
                         from lab_order lo
                        where lo.id = (select max(lr.lab_order_id)
                                         from lab_research lr
                                        where lr.lab_sample_id = ls.id))) as PATIENT_SEX
      ,(select p.birth_date
          from patient p
         where p.id = (select lo.patient_id
                         from lab_order lo
                        where lo.id = (select max(lr.lab_order_id)
                                         from lab_research lr
                                        where lr.lab_sample_id = ls.id))) as PATIENT_BIRTH_DATE
      ,ls.collect_date                                                    as COLLECT_DATE
      ,coalesce((select o.text
                   from organization o
                  where o.id = (select lo.source_org_id
                                  from lab_order lo
                                 where lo.id = (select max(lr.lab_order_id)
                                                  from lab_research lr
                                                 where lr.lab_sample_id = ls.id)))
               ,(select d.text
                   from dep d
                  where d.id = (select lo.source_dep_id
                                  from lab_order lo
                                 where lo.id = (select max(lr.lab_order_id)
                                                  from lab_research lr
                                                 where lr.lab_sample_id = ls.id)))) as SOURCE_TEXT
      ,(select lo.custom_data
          from lab_order lo
         where lo.id  = (select max(lr.lab_order_id)
                           from lab_research lr
                          where lr.lab_sample_id = ls.id)) as CUSTOM_DATA
  from lab_sample ls
 where ls.id = :sampleId