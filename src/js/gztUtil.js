﻿let gztUtil={
    /**
     * 获取某个地址栏参数
     * @method getUrlParam
     * @param {name} String 要获取的参数
     * @return {Null} 返回一个字符串或者null
     */
    getUrlParam : function(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]);
        return null;
    }
}

export default gztUtil
  