select *
from (select mr.id as mr_id
           ,(case brr.rule_type
                 when 'PHENOTYPE' then 'Примечание к фенотипу'
                 when 'NATURAL' then 'Природная резистентность'
                 when 'CLINICAL' then 'Клинические рекомендации'
                 when 'DOSE' then 'Дозировка антибиотиков'
                 when 'MICRO' then 'Рекомендации микробиолога'
                 else 'Примечание' end) as tag
           ,br.text || ': ' || brr.text as text
           ,(case brr.rule_type
                 when 'PHENOTYPE' then 1
                 when 'NATURAL' then 2
                 when 'CLINICAL' then 3
                 when 'DOSE' then 4
                 when 'MICRO' then 5
                 else 6 end)            as sortby
      from bacteria_result br
               join bacteria_result_rule brr on brr.bacteria_result_id = br.id and brr.status = 1
               join mbio_research mr on br.mbio_research_id = mr.id and mr.sample_id = :sampleId
           ---where mr.research_id in (:researches)

      union

      select mr.id as mr_id
           ,'ЗАКЛЮЧЕНИЕ'       as tag
           ,mr.conclusion_text as text
           ,7                  as sortby
      from mbio_research mr
      where mr.sample_id = :sampleId
         ---and mr.research_id in (:researches)
     )
where text is not null
order by mr_id, sortby