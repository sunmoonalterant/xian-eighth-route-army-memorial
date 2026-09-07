<script setup>
import { computed } from 'vue'
import EChartPanel from './EChartPanel.vue'
import { formatShortDate, getAxisLabelInterval } from '../../utils/dashboardStatistics.js'
const props=defineProps({data:{type:Array,default:()=>[]},loading:Boolean,errorMessage:String})
const option=computed(()=>({color:['#8b1e1e','#b98543'],tooltip:{trigger:'axis',appendTo:'body',axisPointer:{type:'line'}},legend:{data:['预约单数','预约人数'],top:0},grid:{left:45,right:20,top:45,bottom:35},xAxis:{type:'category',data:props.data.map(item=>formatShortDate(item.date)),axisLabel:{interval:getAxisLabelInterval(props.data.length)}},yAxis:{type:'value',minInterval:1},series:[{name:'预约单数',type:'line',smooth:true,data:props.data.map(item=>item.reservations)},{name:'预约人数',type:'line',smooth:true,data:props.data.map(item=>item.people)}]}))
</script><template><EChartPanel :option="option" :loading="loading" :empty="!loading&&!errorMessage&&!data.length" empty-text="暂无预约趋势数据" :error-message="errorMessage" aria-label="预约趋势图"/></template>
