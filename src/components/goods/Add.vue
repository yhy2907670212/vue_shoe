<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
            <!-- 步骤条区域 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- tab栏区域 -->
            <!--  -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <!-- 添加基本信息的表单 -->
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader expand-trigger="hover" v-model="addForm.goods_cat" :options="catelist" :props="cateProps" @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 渲染商品参数列表项 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <!-- 复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                               <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border size="mini"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action:图片要上传到后台的api地址 -->
                        <el-upload :action="uploadRUL"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            list-type="picture" 
                            :headers="headerObj"
                            :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器组件 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <!-- 添加商品的按钮 -->
                        <el-button type="primary" class="btnAdd" @click="Add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览 -->
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
            <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
//导入lodash
import _ from 'lodash'
export default {
    data() {
        return {
            //步骤条默认激活的序列
            activeIndex: '0',
            //添加商品的表单数据对象
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                //商品所属的分类数组
                goods_cat: [],
                // 图片的数组
                pics: [],
                //商品详情
                goods_introduce: '',
                //商品的参数（数组）
                attrs: []
            },
            //添加商品表单的验证规则
            addFormRules: {
                goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
                goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
                goods_weight:[{ required: true, message: '请输入商品重量', trigger: 'blur' }],
                goods_number:[{ required: true, message: '请输入商品数量', trigger: 'blur' }],
                goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
            },
            //所有商品分类数据
            catelist:[],
            //配置参数
            cateProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            //动态参数列表
            manyTableData: [],
            //静态参数列表
            onlyTableData: [],
            //上传图片的URL地址
            uploadRUL: 'http://127.0.0.1:8888/api/private/v1/upload',
            //图片上传组件的headers请求头对象
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            //预览图片时存储图片地址
            previewPath: '',
            //控制图片预览对话框的显示与隐藏
            previewVisible: false
        }
    },
    created() {
        this.getCateList();
    },
    methods:{
        //获取所有商品分类数据
        async getCateList() {
            const {data: res} = await this.$http.get('categories');
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类失败！')
            }
            this.catelist = res.data;
            console.log(this.catelist);
        },
        //级联选中项变化会触发这个函数
        handleChange() {
            // 控制级联选择器只能选中3级分类
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = [];
                return
            }
        },
        //切换标签页触发事件
        beforeTabLeave(activeName, oldActiveName) {
            // console.log('即将离开的标签页名字是：' + oldActiveName)
            // console.log('即将进入的标签页名字是：' + activeName)
            // return false  阻止切换
            if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请先选择商品分类！');
                return false
            }
        },
        //当tab 被选中时触发
        async tabClicked() {
            // 如果activeIndex 是 1 ，证明访问的是动态参数面版
            if (this.activeIndex === '1') {
                //发请求获取参数列表 获取动态参数
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                    params: {sel: 'many'}
                });
                if (res.meta.status !== 200) {
                     return this.$message.error('获取动态参数列表失败！')
                }
                //先将res.data.attr_vals变成数组
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ');
                });
                this.manyTableData = res.data;
                console.log(res.data);
            }else if (this.activeIndex === '2') {
                //访问商品属性面板 发起请求获取静态参数列表
                 const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                    params: {sel: 'only'}
                });
                if (res.meta.status !== 200) {
                     return this.$message.error('获取动态参数列表失败！')
                }
                this.onlyTableData = res.data;
                console.log(res.data);
            }
        },
        //处理图片预览效果
        handlePreview(file) {
            // console.log(file);
            this.previewPath = file.response.data.url;
            this.previewVisible = true;
        },
        //处理移除图片的操作
        handleRemove(file) {
            // console.log(file);
            //获取将要删除的图片的临时路劲
            const filePath = file.response.data.tmp_path;
            //根据临时路径找到这个图片对应的索引
            const i = this.addForm.pics.findIndex(x => x.pic === filePath);
            //调用数组中的splice方法，把对应的图片信息删除
            this.addForm.pics.splice(i, 1);
            console.log(this.addForm);
        },
        //图片上传成功时调用
        handleSuccess(response) {
            // console.log(response);
            // 拼接得到一个图片信息对象
            const picInfo = {pic: response.data.tmp_path};
            //将图片信息对象push到pics数组中
            this.addForm.pics.push(picInfo);
            console.log(this.addForm);
        },
        //添加商品按钮
        Add() {
            // console.log(this.addForm);
            //表单预验证
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) {
                    return this.$message.error('请填写必要的表单项！')
                }
                // 执行添加商品的请求
                // lodash   深拷贝一份addForm 数据 cloneDeep(obj)
                const form = _.cloneDeep(this.addForm);
                //将级联选择器中的goods_cat数组改成字符串
                form.goods_cat = form.goods_cat.join(',');
                //处理动态参数
                this.manyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(' ')
                    };
                    this.addForm.attrs.push(newInfo);
                });
                //处理静态属性
                this.onlyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    };
                    this.addForm.attrs.push(newInfo)
                });
                form.attrs = this.addForm.attrs;
                console.log(form);
                //将处理好的数据form 发送到数据库中
                const {data:res} = await this.$http.post('goods', form);
                if (res.meta.status !== 201) {
                    return this.$message.error('添加商品失败！')
                }
                this.$message.success('添加商品成功！');
                //跳转到商品列表页面
                this.$router.push('/goods');
            })
        }
    },
    computed: {
        //获取三级分类的id
        cateId() {
            //如果商品表单数据的分类数组长度是3 说明选中的是三级分类 就返回这个id
            if (this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
}
</script>

<style lang="less" scoped>
.el-checkbox {
    margin:0 10px 0 0 !important;
}
.previewImg {
    width: 100%;
}
.btnAdd {
    margin-top: 15px;
}
</style>