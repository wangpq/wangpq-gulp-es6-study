const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cssnano = require('gulp-cssnano');
const concat = require('gulp-concat');
const connect = require('gulp-connect-multi')();
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const gulpHtmlReplace=require('gulp-html-replace');
const less = require('gulp-less');
const sass = require('gulp-sass');
const LessAutoprefix = require('less-plugin-autoprefix')
const autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });
const gulpAutoPrefixer = require('gulp-autoprefixer');
const cleanCss =require('gulp-clean-css');
const rimraf = require('gulp-rimraf');

// 基本配置参数
let config = {
  // 本地web服务器
  "connect" : {
      "root" : ['./dest/'],
      "port" : 8080,
      "livereload" : true
  },
  "css" :{
      "path" : {
          "src" : "src/css/",
          "dest" : "dest/css/"
      }
  },
  "less" : {
      "path" : {
          "src" : "src/less/",
          "dest" : "src/css/"
      }
  },
  "sass" : {
      "path" : {
          "src" : "src/sass/",
          "dest" : "src/css/"
      }
  },
  "html" : {
      "path" : {
          "src" : "src/html/",
          "dest" : "dest/html/"
      }
  },
  "img" :  {
      "path" : {
          "src" : "src/images/",
          "dest" : "dest/images/"
      }
  },
  "js" : {
      "path" : {
          "src" : "src/js/",
          "dest" : "dest/js/"
      }
  }
};

// 辅助函数
let helper={
  // 自动给元素或者数组中的元素补全路径
  addPathToNodes : function(path,nodes){
      if(nodes instanceof Array){
          var arr=[];
          for(var i=0,l=nodes.length;i<l;i++){
              arr.push(path+nodes[i])
          }
          return arr;
      }else{
          return path+nodes;
      }
  },
  // 将元素或者数组中的元素作为函数参数并执行函数
  doNodesFn : function(nodes,fullPath,fn){
      if(nodes instanceof Array){
          for(var i=0,l=nodes.length;i<l;i++){
              fn(nodes[i],fullPath);
          }
      }else{
          fn(nodes,fullPath);
      }
  }
}


// 项目CSS和JS合并压缩配置
let tasks={
    /**
     * 合并文件配置,默认带压缩功能
     */
    cat : {
		css : {
            fullPath : false,
			group : [
				{
					value : ['reset.css','animate.css','app.css'],
					name : "style"
				}
			]
		},
		js : {
            fullPath : false,
			group : [
				{
					value : ['flexible.js'],
					name : "flexible"
				}
			]
		}
    },
	/**
	 *替换HTML中指定的CSS和JS
	 *注意key和HTML中书写的名称对应,value和合并cat.group.name对应
	 */
    replace : {
        style: '../css/style.min.css',
        flexibleJs: '../js/flexible.min.js'
    },
    // 入口js文件名
    appJsName : {
        oldName : "app",
        newName : "bundle"
    }
}




// 启动本地web服务器
gulp.task('connect', connect.server({
	root : config.connect.root,
	port : config.connect.port,
	livereload : config.connect.livereload
}));

// 监听图片改动并复制到目标文件夹，并实时重加载页面
gulp.task('images', function(){
    gulp.src(config.img.path.src+'**/*.{jpg,png,gif,ico}')
        .pipe(gulp.dest(config.img.path.dest))
    gulp.src(config.html.path.dest+'**/*.html')
        .pipe(connect.reload());
});

// 监听ES6改动并编译到目标文件夹，然后合并转换为可执行的文件
gulp.task('javascript', function(){
  gulp.src(config.js.path.src+'**/*.js')
  .pipe(babel({
    presets: ['es2015']
  }))
  //.pipe(uglify()) 加了压缩无法debugger调试
  .pipe(gulp.dest(config.js.path.dest))

  browserify({
      entries: config.js.path.dest + tasks.appJsName.oldName+".js"
  })
  .bundle()
  .pipe(source( tasks.appJsName.newName+".js" ))
  .pipe(gulp.dest(config.js.path.dest));

  gulp.src(config.html.path.dest+'**/*.html')
  .pipe(connect.reload());
})

// 合并并压缩css
// concatMinCss方法中(没有采用**/*.css这种获取css文件的方式，因为样式需要按顺序合并打包，不然页面显示可能出错)
gulp.task('style', function(){
  //gulp.src(config.css.path.src+'**/*.css')
  /*
    .pipe(concat('app.css'))
    .pipe(cssnano())
    .pipe(rename(function(path){
      path.basename += '.min';
    }))
    .pipe(gulp.dest(config.css.path.dest));
    */

    gulp.src(config.css.path.src+'**/*.css')
    .pipe(gulpAutoPrefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(gulp.dest(config.css.path.dest));

    gulp.src(config.html.path.dest+'**/*.html')
        .pipe(connect.reload());   
})

// html改变,自动重启本地web服务器
gulp.task('html', function() {
  gulp.src(config.html.path.src+'**/*.html')
  .pipe(gulp.dest(config.html.path.dest))

  gulp.src(config.html.path.dest+'**/*.html')
  .pipe(connect.reload());
});

/***********************************************/
// 拷贝图片到目的文件夹中
gulp.task('copyImages', function(){
    gulp.src(config.img.path.src+'**/*.{jpg,png,gif,ico}')
        .pipe(gulp.dest(config.img.path.dest))
});

// CSS自动补全前缀并合并为指定文件名压缩到目标文件夹
gulp.task('concatMinCss', function() {
    var fn=function(node,fullPath){
       //先删除dest中的css，有时候会不更新
        gulp.src(config.css.path.dest+node.name+'.min.css')
            .pipe(rimraf({force: true}));
        var srcValue=fullPath ? node.value : helper.addPathToNodes(config.css.path.src,node.value);
        gulp.src(srcValue)
            .pipe(gulpAutoPrefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(concat(node.name+'.css'))
            .pipe(rename({suffix: '.min'}))
            .pipe(cleanCss({compatibility: 'ie8'}))
            .pipe(gulp.dest(config.css.path.dest))
    }
    helper.doNodesFn(tasks.cat.css.group,tasks.cat.css.fullPath,fn);
});


// JS合并为指定文件名压缩到目标文件夹
gulp.task('concatMinJs', function() {
    /*
    gulp.src(config.js.path.dest+'*.js')
    .pipe(rimraf({force: true}));
    */

    gulp.src(config.js.path.src+'**/*.js')
        .pipe(babel({
           presets: ['es2015']
        }))
        .pipe(uglify()) 
        .pipe(gulp.dest(config.js.path.dest))
  
    browserify({
        entries: config.js.path.dest + tasks.appJsName.oldName+".js"
    })
    .bundle()
    .pipe(source( tasks.appJsName.newName+".js" ))
    .pipe(rename({suffix:'.min'}))
    .pipe(gulp.dest(config.js.path.dest));

    var fn=function(node,fullPath){
        var srcValue=fullPath ? node.value : helper.addPathToNodes(config.js.path.src,node.value);
        gulp.src(srcValue)
            .pipe(concat(node.name+'.js'))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(gulp.dest(config.js.path.dest))
    }
    helper.doNodesFn(tasks.cat.js.group,tasks.cat.js.fullPath,fn);

});

// 替换HTML文件中的CSS和JS并输出到指定位置
gulp.task('gulpHtmlReplace', function() {
    gulp.src(config.html.path.dest+'**/*.html')
        .pipe(rimraf({force: true}));
    gulp.src(config.html.path.src+'**/*.html')
        .pipe(gulpHtmlReplace(tasks.replace))
        .pipe(gulp.dest(config.html.path.dest));
})

/***********************************************/


// 监视文件变化，自动执行任务
gulp.task('watch', function(){
  gulp.watch(config.css.path.src+'**/*.css', ['style']);
  gulp.watch(config.js.path.src+'**/*.js', ['javascript']);
  gulp.watch(config.img.path.src+'**/*.{jpg,png,gif,ico}', ['images']);
  gulp.watch([config.html.path.src + '**/*.html'], ['html']);
})

// 默认开发调试阶段
gulp.task('default', ['copyImages','connect','watch']);
gulp.task('dev', ['copyImages','connect','watch']);

// live 构建最终的html、css、js、images
gulp.task('live', ['gulpHtmlReplace','concatMinCss','concatMinJs','copyImages']);
