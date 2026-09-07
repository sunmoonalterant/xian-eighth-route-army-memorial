<script setup>
import { computed } from 'vue'
import EChartPanel from './EChartPanel.vue'
import { hasPositiveReservationStatuses,reservationStatusLabels } from '../../utils/dashboardStatistics.js'
const props=defineProps({data:{type:Object,default:()=>({})},loading:Boolean,errorMessage:String})
const rows=computed(()=>Object.entries(props.data?.statuses||{}).map(([key,value])=>({name:reservationStatusLabels[key]||key,value:value.reservations})))
const option=computed(()=>({color:['#8b1e1e','#b98543','#77706a','#55504c','#b9afa3'],tooltip:{trigger:'item',appendTo:'body',formatter:'{b}<br/>数量：{c}<br/>占比：{d}%'},legend:{bottom:0},series:[{type:'pie',radius:['45%','68%'],data:rows.value,label:{show:false}}]}))
</script><template><EChartPanel :option="option" :loading="loading" :empty="!loading&&!errorMessage&&!hasPositiveReservationStatuses(data)" empty-text="暂无预约数据" :error-message="errorMessage" aria-label="预约状态分布图"/></template>
