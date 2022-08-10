select t.cancel_date
     , t.cancel_reason
from (select ls.cancel_date   as cancel_date
           , ls.cancel_status as cancel_status
           , ls.cancel_reason as cancel_reason
      from lab_sample ls
      where ls.id = :sampleId) t
where t.cancel_status = 1