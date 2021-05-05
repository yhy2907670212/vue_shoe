// 通过 vue.config.js 修改 webpack 的默认配置

module.exports = {
     //判断当前是处于什么环境 根据环境确定打包入口
    chainWebpack: config => {
       //发布模式
        config.when(process.env.NODE_ENV === 'production', config => {
            config.entry('app').clear().add('./src/main-prod.js');
            // 通过 externals 加载外部 CDN 资源
            config.set('externals', {
                vue: 'Vue',
               'vue-router': 'VueRouter',
               axios: 'axios',
               lodash: '_',
               echarts: 'echarts',
               nprogress: 'NProgress',
               'vue-quill-editor': 'VueQuillEditor'
            });
            //不同的打包环境下，首页内容可能会有所不同,通过插件的方式进行定制首页内容
            config.plugin('html').tap(args => {
                args[0].isProd = true
                return args
            });
        });
        //开发模式
        config.when(process.env.NODE_ENV === 'development', config => {
            config.entry('app').clear().add('./src/main-dev.js');
            config.plugin('html').tap(args => {
                args[0].isProd = false
                return args
            })               
        })
    }
}