select ptr.*
  from phenotype_test_result ptr
  join bacteria_result br on ptr.bacteria_result_id = br.id
 where br.mbio_research_id = (select mr.id
                                from mbio_research mr
                               where mr.sample_id = :sampleId);