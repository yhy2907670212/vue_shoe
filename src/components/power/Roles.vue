<template>
    <div>
         <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
         <!-- 卡片视图区 -->
         <el-card>
             <!-- 添加角色按钮区域 -->
             <el-row>
                 <el-col>
                     <el-button type="primary">添加角色</el-button>
                 </el-col>
             </el-row>
             <!-- 角色列表区 -->
              <el-table :data="rolelist">
                  <!-- 展开列 -->
                   <el-table-column type="expand">
                      <template slot-scope="scope">
                          <el-row :class="['bdbottom', i1 ===0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                              <!-- 渲染一级权限 -->
                              <el-col :span="5">
                                  <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                  <i class="el-icon-caret-right"></i>
                              </el-col>
                              <!-- 渲染二级和三级权限 -->
                              <el-col :span="19">
                                  <!-- 渲染二级权限 -->
                                  <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                                      <el-col :span="6">
                                          <el-tag closable type="success" @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                          <i class="el-icon-caret-right"></i>
                                      </el-col>
                                      <!-- 渲染三级权限 -->
                                      <el-col :span="18">
                                          <el-tag closable type="warning" v-for="item3 in item2.children" :key="item3.id" @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                      </el-col>
                                  </el-row>
                              </el-col>
                          </el-row>
                      </template>
                   </el-table-column>
                   <el-table-column type="index" label="序列" width="50px"></el-table-column>
                    <el-table-column label="角色名称" prop="roleName"></el-table-column>
                    <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                    <el-table-column label="操作" width="310px">
                        <template slot-scope="scope">
                            <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                            <el-button type="warning" size="mini" icon="el-icon-delete">删除</el-button>
                            <el-button type="danger" size="mini" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                        </template>
                    </el-table-column>
              </el-table>
         </el-card>
         <!-- 分配权限的对话框 -->
         <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
             <!-- 树形控件 -->
            <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <template #footer>
                <span class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //所有角色列表数据
            rolelist: [],
            //分配权限的对话框的显示与隐藏
            setRightDialogVisible: false,
            //所有权限列表数据
            rightslist: [],
            //树形控件的属性绑定对象
            treeProps: {
                children: 'children',
                label: 'authName'
            },
            //默认选中节点的id值数组
            defKeys: [],
            //当前即将分配权限的角色id
            roleId: ''
        }
    },
    created() {
        this.getRolesList()
    },
    methods: {
        //获取所有角色列表数据
        async getRolesList() {
            const {data: res} = await this.$http.get('roles');
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表数据失败！')
            }
            this.rolelist = res.data;
        },
        //根据id删除对应的权限
        async removeRightById(role, rightId) {
            //弹框提示用户
            const confirmReslut = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err);
            if (confirmReslut !== 'confirm') {
                return this.$message.info('取消了删除！')
            }
            //发送delete请求删除对应的权限
            const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
            if (res.meta.status !== 200) {
                return this.$message.error('删除权限失败！')
            }
            // 重新给role赋值，渲染页面
            role.children = res.data;
        },
        //展示分配权限的对话框
        async showSetRightDialog(role) {
            this.roleId = role.id;
            // 获取所有权限数据
            const {data:res} = await this.$http.get('rights/tree');
            if (res.meta.status !== 200) {
                return this.$message.error('获取权限列表失败！')
            }
            this.rightslist = res.data;
            //递归获取三级节点的id
            this.getLeafKeys(role, this.defKeys);
            this.setRightDialogVisible = true;
        },
        //通过递归的形式，获取角色所有的三级权限id，并保存到defKeys数组中
        getLeafKeys(node, arr) {
            //如果当前节点不包含children属性，则是三级节点
            if (!node.children) {
                return arr.push(node.id)
            }
            //反之不是三级节点，开始遍历当前节点下children属性，调用这个getLeafKeys函数
            node.children.forEach(item => this.getLeafKeys(item, arr));
        },
        //监听分配权限对话框的关闭事件
        setRightDialogClosed() {
            this.defKeys = []
        },
        //为角色分配权限
        async allotRights() {
            //获取被选中节点的id
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ];
            // 转换成以,分开的字符串
            const idStr = keys.join(',');
            // 发起post请求，添加权限
            const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr});
            if (res.meta.status !== 200) {
                return this.$message.error('分配权限失败！')
            }
            this.$message.success('分配权限成功！');
            //重新渲染页面
            this.getRolesList();
            //隐藏对话框
            this.setRightDialogVisible = false;
        }
    }
}
</script>

<style lang="less" scoped>
.el-tag{
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>