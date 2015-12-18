<template>
    <input type="text" @click="showCalendar" v-model="value" placeholder="请输入起始日期">
    <div @click="none"  @touchstart="none" class="calendar" v-show="show" :style="{'left':x+'px','top':y+'px'}" transition="calendar" transition-mode="out-in">
        <div class="calendar-tools">
            <i class="fa fa-angle-left float left" @click="prev"  @touchstart="prev">＜</i>
            <i class="fa fa-angle-right float right" @click="next"  @touchstart="next">＞</i>
            <div class="text-center">{{current}}</div>
        </div>
        <table>
        <thead>
            <tr>
                <td v-for="week in weeks" class="week">{{week}}</td>
            </tr>
         </thead>
        <tr v-for="(k1,day) in days">
            <td 
            v-for="(k2,child) in day" 
            :class="{'today':child.today,'disabled':child.disabled}"
            @click="select(k1,k2,$event)" @touchstart="select(k1,k2,$event)">
            {{child.day}}
            </td>
        </tr>
        </table>
    </div>
</template>

<script>
module.exports = {
    props: {
        show: {
            type: Boolean,
            required: true,
            twoWay: true    
        },
        value: {
            type: String,
            required: true,
            twoWay: true    
        },
        x: {
            type: Number,
            required: true,
            twoWay: true    
        },
        y: {
            type: Number,
            required: true,
            twoWay: true    
        }, 
        begin: {
            type: String
        }, 
        end: {
            type: String 
        }
    },
    data: function() {
        return {
            year:0,
            month:0,
            day:0,
            days:[],
            today:[],
            current:'',
            sep:"-",
            weeks:['日', '一', '二', '三', '四', '五', '六'],
            months:['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
        }
    },
    ready:function(){
        var now = new Date();
        // 判断日期格式？ 2015-12-18 || 2015/12/18
        // if(this.value.indexOf("-")!=-1)
            // this.sep="-";
        this.year = now.getFullYear();
        this.month = now.getMonth();
        this.day = now.getDate();

        var year = this.year;
        var month = now.getMonth() + 1;
        var day = now.getDate();

        if(month < 10) {
            month = "0" + month;
        }
        if(day < 10) {
            day = "0" + day;
        }
        var date = year + "-" + month + "-" + day;
        if(this.value === "today") {
            this.value = date;
        }
        if(this.value === "null") {
            this.value = null
        }

        this.render(this.year, this.month);
        // console.log("ready")
    },
    methods:{
        showCalendar:function(e){
            e.stopPropagation();
            var that=this;
            that.show=true;
            that.x=e.target.offsetLeft;
            that.y=e.target.offsetTop+e.target.offsetHeight+8;
            var bindHide=function(e){
                e.stopPropagation();
                that.show=false;
                document.removeEventListener('click',bindHide,false);
            };
            setTimeout(function(){
                document.addEventListener('click',bindHide,false);
            },500);
        },
        render:function(y, m){
            var that            = this;
            var d               = new Date();
            var firstDayOfMonth = new Date(y, m, 1).getDay();        //当月第一天星期几
            var lastDateOfMonth = new Date(y, m + 1, 0).getDate();   //当月最后一天日期
            
            // 上月最后一天计算有误
            // var lastDayOfLastMonth  = m == 0 ? new Date(y, m, 0).getDate() : new Date(y, m, 0).getDate();//最后一月的最后一天
            var lastDayOfLastMonth = new Date(y, m, 0).getDate();
            var seletSplit = [];

            that.current = y + ' / ' + that.months[m];

            // 若 value == null，此处 split 报错。
            if(that.value) {
                console.log("if");
                seletSplit = that.value.split(that.sep);
            } else {
                console.log("else");
                seletSplit.push(y, m, 1);
            }
            var i,line=0,temp=[];

            // 遍历当月每一天
            for(i = 1; i <= lastDateOfMonth; i++) {
                // dow 表示当天是星期几
                var dow = new Date(y, m, i).getDay();
                // 若是星期天，另起一行，第一个，清空该行数据
                if(dow == 0) {
                    temp[line]=[];
                } else if(i == 1) {
                    // 若是当月第一天，也需要清空该行数据
                    temp[line]=[];

                    // 当月第一周需要处理上月的部分天数
                    var k = lastDayOfLastMonth - firstDayOfMonth + 1;
                    // 当月日期前几天属于上月，需disabled
                    for(var j = 0; j < firstDayOfMonth; j++) {
                        temp[line].push({day: k, disabled: true});
                        k++;
                    }
                }

                // 当月渲染
                var chk  = new Date();
                var chkY = chk.getFullYear();
                var chkM = chk.getMonth();
                // 选中当前input日期
                if (
                    parseInt(seletSplit[0]) === that.year 
                    &&
                    parseInt(seletSplit[1])-1 === that.month
                    &&
                    parseInt(seletSplit[2]) === i
                ) {
                    temp[line].push({day:i, today:true});
                    that.today = [line, temp[line].length-1];
                // 当天
                } else if (chkY == that.year && chkM == that.month && i == that.day && that.value == "") {
                    temp[line].push({day: i, today: true});
                    that.today=[line, temp[line].length-1];
                } else {//默认
                    // 1.判断begin和end的日期
                    var options = {day: i, today: false};
                    if(that.begin != ""){
                        var beginSplit = that.begin.split(that.sep);
                        var beginDate  = new Date(parseInt(beginSplit[0]),parseInt(beginSplit[1])-1,parseInt(beginSplit[2]));
                        var beginTime  = Number(beginDate);
                        var thisDate   = new Date(that.year, that.month, i);
                        var thisTime   = Number(thisDate);

                        if(beginTime > thisTime) {
                            options.disabled=true;
                        }
                    }
                    if(that.end != ""){
                        var endSplit = that.end.split(that.sep);
                        var endDate  = new Date(parseInt(endSplit[0]),parseInt(endSplit[1])-1,parseInt(endSplit[2]));
                        var endTime  = Number(endDate);
                        var thisDate = new Date(that.year,that.month,i);
                        var thisTime = Number(thisDate);

                        if(endTime < thisTime) {
                            options.disabled = true;
                        }
                    }
                    temp[line].push(options);
                }
                // 一行最后一个，即星期六
                if (dow == 6) {
                    line++;
                } else if (i == lastDateOfMonth) {
                    var k = 1;
                    for (dow; dow < 6; dow++) {
                        temp[line].push({day: k, disabled: true});
                        k++;
                    }
                }
            }

            that.days=temp;
        },
        prev:function(e){
            e.stopPropagation();
            var that=this;
            if (that.month == 0) {
                that.month = 11;
                that.year = that.year - 1;
            } else {
                that.month = that.month - 1;
            }
            that.render(that.year,that.month);
        },
        next:function(e){
            e.stopPropagation();
            var that=this;
            if (that.month == 11) {
                that.month = 0;
                that.year = that.year + 1;
            } else {
                that.month = that.month + 1;
            }
            that.render(that.year,that.month);
        },
        select:function(k1,k2,e){
            if(e!=undefined)e.stopPropagation();
            var that=this;
            // 取消上次选中
            if(that.today.length>0){
                that.days[that.today[0]][that.today[1]].today=false; 
            }
            
            // 设置当前选中天
            that.days[k1][k2].today=true;
            that.today=[k1,k2];
            that.value=that.year+that.sep+(that.month+1)+that.sep+that.days[k1][k2].day;
            that.show=false;
        },
        none:function(e){
            e.stopPropagation();
        }
    },
    attached: function() {
        // TODO
    }
}
</script>

<style>
input {
    width: 320px;
}
.calendar {
    width:         300px;
    padding:       10px;
    background:    #fff;
    position:      absolute;
    border:        1px solid #DEDEDE;
    border-radius: 2px;
    opacity:       .95;
    transition:    all .5s ease;
}
 
.calendar-enter, .calendar-leave {
    opacity:   0;
    transform: translate3d(0,-10px, 0);
}

.calendar:before {
    position:            absolute;
    left:                30px;
    top:                 -10px;
    content:             "";
    border:              5px solid rgba(0, 0, 0, 0);
    border-bottom-color: #DEDEDE;
}
.calendar:after {
    position:            absolute;
    left:                30px;
    top:                 -9px;
    content:             "";
    border:              5px solid rgba(0, 0, 0, 0);
    border-bottom-color: #fff;
}

.calendar-tools{
    height:      32px;
    font-size:   20px;
    line-height: 32px;
    color:       #5e7a88;
}

.calendar-tools > i {
    /*margin:         0 16px;*/
    line-height:      32px;
    cursor:           pointer;
    color:            #707070;
    position:         absolute;
    width:            16px;
    height:           32px;
    background-color: transparent;
}

.calendar-tools > i.left {
    left: 16px;
}

.calendar-tools > i.right {
    right: 16px;
}

.calendar-tools > i:hover{
    color:#5e7a88;
}

.calendar-tools .text-center {
    text-align: center;
}

.calendar table {
  clear:           both;
  width:           100%;
  border-collapse: collapse;
  color:           #444444;
}

.calendar td {
  height:         40px;
  width:          14.28571429%;
  text-align:     center;
  vertical-align: middle;
  font-size:      14px;
  cursor:         pointer;
  border-radius:  2px;
}

.calendar td:hover{
    background: #f3f8fa;
}

.calendar td.week{
  pointer-events: none !important;
  cursor:         default !important;    
}

.calendar td.disabled {
  color:          #c0c0c0;
  pointer-events: none !important;
  cursor:         default !important;
}

.calendar td.today {    
  background-color: #5e7a88;
  color:            #fff;
  font-size:        16px;
}

.calendar thead td {
  text-transform: uppercase;
}
</style>
