select mr.id                                            as mr_id
      ,br.id                                            as id
      ,br.text                                          as text
      ,br.growth                                        as growth
      ,(select b.norm_note
         from bacteria b
        where b.id =  br.bacteria_id)                   as norm
      ,(select bg.text
          from bacteria_group bg
         where bg.id = (select b.group_id
                          from bacteria b
                         where b.id =  br.bacteria_id)) as group_text
      ,p.text                                           as phen_text
      ,p.value                                          as phen_val
      ,p.test_id                                        as phen_test
      ,(select max(1)
          from bacteria_result_rule brr
         where brr.bacteria_result_id = br.id
           and upper(brr.rule_type) = 'PHENOTYPE')     as phen_pat
  from bacteria_result br
  join mbio_research mr on mr.id = br.mbio_research_id
  left join phenotype_test_result p on p.bacteria_result_id = br.id
 where mr.sample_id = :sampleId and mr.status = 'VALIDATED'
   ---and mr.research_id in (:researches)
 order by mr_id, group_text nulls first, id, phen_test


