<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card>
            <!-- 搜索框 -->
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" clearable>
                        <template #append>
                        <el-button icon="el-icon-search"></el-button>
                        </template>
                   </el-input>
                </el-col>
            </el-row>
            <!-- 订单列表数据 -->
            <el-table :data="orderlist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status" width="100px">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.pay_status == 1">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
                <el-table-column label="下单时间" prop="create_time" width="180px">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px"> 
                    <template slot-scope="">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total" background>
            </el-pagination>
        </el-card>
        <!-- 修改地址的对话框 -->
        <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="50%" @close="addressDialogClosed">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                  <el-cascader :options="cityData" v-model="addressForm.address1" clearable></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                  <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                <el-button @click="addressDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
                </span>
            </template>
        </el-dialog>
        <!-- 展示物流进度的对话框 -->
        <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%" >
          <!-- 时间线 -->
            <el-timeline>
                <el-timeline-item
                v-for="(activity, index) in progressInfo"
                :key="index"
                :timestamp="activity.time">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
//导入城市划分数据
import cityData from './citydata.js'
export default {
    data() {
        return {
            // 查询参数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            //总数据条数
            total: 0,
            //订单数据列表
            orderlist: [],
            //控制修改地址对话框的显示与隐藏
            addressDialogVisible: false,
            //修改地址表单数据
            addressForm: {
                address1: [],
                address2: ''
            },
            //修改地址表单数据的验证规则
            addressFormRules: {
                address1: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
                address2:[{ required: true, message: '请输入详细地址', trigger: 'blur' }]
            },
            //城市数据
            cityData: cityData,
            //控制物流进度对话框的显示与隐藏
            progressDialogVisible: false,
            //物流信息数据
            progressInfo: []
        }
    },
    created() {
        this.getOrderList()
    },
    methods: {
        //获取订单列表
        async getOrderList() {
            const {data:res} = await this.$http.get('orders', {
                params: this.queryInfo
            });
            if (res.meta.status !== 200) {
                this.$message.error('获取订单列表失败！')
            }
            this.total = res.data.total;
            this.orderlist = res.data.goods;
            console.log(res.data);
        },
        //当前页发生变化时触发
        handleSizeChange(newpage) {
            this.queryInfo.pagesize = newpage;
            this.getOrderList();
        },
        // 当前页码发生变化时触发
        handleCurrentChange(newpage) {
            this.queryInfo.pagenum = newpage;
            this.getOrderList();
        },
        //展示修改地址的对话框
        showBox() {
            this.addressDialogVisible = true;
        },
        //关闭修改地址对话框时清空数据
        addressDialogClosed() {
            this.$refs.addressFormRef.resetFields();
        },
        //展示物流进度的对话框
        async showProgressBox() {
            //发起请求查看物流信息
             const { data: res } = await this.$http.get('/kuaidi/1106975712662')
            if (res.meta.status !== 200) {
               return this.$message.error('获取物流进度失败！')
            }
            this.progressInfo = res.data;
            console.log(this.progressInfo);
            this.progressDialogVisible = true;
            
        }
    }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
.el-cascader {
    width: 100%;
}
</style>