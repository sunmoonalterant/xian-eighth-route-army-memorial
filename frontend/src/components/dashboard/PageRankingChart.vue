<script setup>
import { computed } from 'vue'
import EChartPanel from './EChartPanel.vue'
const props=defineProps({data:{type:Array,default:()=>[]},loading:Boolean,errorMessage:String})
const option=computed(()=>({color:['#8b1e1e'],tooltip:{trigger:'axis',appendTo:'body',axisPointer:{type:'shadow'},formatter:items=>{const item=props.data[items[0].dataIndex];return `${item.pageName}<br/>PV：${item.pv}<br/>UV：${item.uv}<br/>路径：${item.path}`}},grid:{left:100,right:30,top:15,bottom:25},xAxis:{type:'value',minInterval:1},yAxis:{type:'category',inverse:true,data:props.data.map(item=>item.pageName)},series:[{type:'bar',data:props.data.map(item=>item.pv),barMaxWidth:28}]}))
</script><template><EChartPanel :option="option" :loading="loading" :empty="!loading&&!errorMessage&&!data.length" empty-text="暂无页面访问数据" :error-message="errorMessage" aria-label="页面访问排行图"/></template>
