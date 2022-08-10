select brr.*
from bacteria_result_rule brr
         join bacteria_result br on brr.bacteria_result_id = br.id
where br.mbio_research_id = (select mr.id
                             from mbio_research mr
                             where mr.sample_id = :sampleId);