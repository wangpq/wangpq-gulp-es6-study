"use strict";var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _jquery = require("./jquery");var _jquery2 = _interopRequireDefault(_jquery);
var _gztUtil = require("./gztUtil");var _gztUtil2 = _interopRequireDefault(_gztUtil);
var _urlconfig = require("./urlconfig");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

App = function () {

    function App() {_classCallCheck(this, App);
        this._init();
        this.controls();
    }_createClass(App, [{ key: "_init", value: function _init()

        {
            this.dialog = (0, _jquery2.default)(".yd-pop-box");
            this.dialogBtn = this.dialog.find(".btn");
            this.dialogBd = this.dialog.find(".bd");
            this.dialogText = this.dialog.find(".text");
        } }, { key: "wpAnimate", value: function wpAnimate(

        node, name, fn) {
            node.addClass('animated ' + name).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                node.removeClass('animated ' + name);
                fn && fn(node);
            });
        } }, { key: "controls", value: function controls()
        {
            var self = this;

            self.dialogBtn.bind("click", function () {
                self.wpAnimate(self.dialog, "bounceOutUp", function () {
                    self.dialog.hide();
                });
            });

            (0, _jquery2.default)(".yd-hd a.back").unbind("click").bind("click", function () {
                self.historyBack();
            });

            (0, _jquery2.default)("#yaohao").unbind("click").bind("click", function () {
                self.yaohao();
            });

            (0, _jquery2.default)(".clickme").unbind("click").bind("click", function () {
                self.chickMe();
            });
        } }, { key: "chickMe", value: function chickMe()
        {
            var self = this;
            _jquery2.default.ajax({
                type: 'post',
                url: _urlconfig.urlconfig.fetchPhoneCharge,
                success: function success(data) {
                    var data = JSON.parse(data);
                    if (data && data.hint !== "") {
                        self.autoReadText(data.hint);
                    }
                },
                error: function error(xhr, type) {
                    self.dialogShow(function () {
                        self.dialogText.html("<span>对不起出错啦</span>");
                        self.dialogBd.removeClass().addClass("bd c0");
                    });
                } });

        }
        // 修改摇号的地址
    }, { key: "yaohao", value: function yaohao() {
            var url = "http://xkczd.gz163.cn/gzt/ident",
            username = _gztUtil2.default.getUrlParam("username"),
            result = window.gztObj.get3DESCipher("", username);

            window.gztObj.openOtherHtml("摇号", url + "?ac=" + result);
        }
        // 返回并刷新
    }, { key: "historyBack", value: function historyBack() {
            window.history.go(-1);
        } }, { key: "autoReadText", value: function autoReadText(

        x) {
            var self = this;

            if (x == 1) {// 您申领的是孟关小客车专段号牌，不能领取话费礼包哦！
                self.dialogShow(function () {
                    self.dialogBd.removeClass().addClass("bd c4");
                });
            } else
            if (x == 2) {// 已超过活动时间，不能领取！
                self.dialogShow(function () {
                    self.dialogText.html("<span>已超过活动时间</br>不能领取!</span>");
                    self.dialogBd.removeClass().addClass("bd c0");
                });
            }
            //else if(x==3){  // 该手机不支持充值！
            //}
            else if (x.indexOf("4_") > -1) {// 恭喜，您的手机号" + mobileTel + "已获得300元话费！请于5分钟后查询！
                    self.dialogShow(function () {
                        (0, _jquery2.default)(".yd-pop-box .text strong").text(x.substr(2));
                        self.dialogBd.removeClass().addClass("bd c1");
                    });
                } else
                if (x == 5) {// 您已经领取过了哦！
                    self.dialogShow(function () {
                        self.dialogBd.removeClass().addClass("bd c2");
                    });
                } else
                if (x == 6) {// 您还未中签，中签之后才可领取哦！
                    self.dialogShow(function () {
                        self.dialogBd.removeClass().addClass("bd c3");
                    });
                } else
                if (x == 7) {// 还没摇号
                    self.dialogShow(function () {
                        self.dialogText.html("<span>还没摇号</span>");
                        self.dialogBd.removeClass().addClass("bd c0");
                    });
                } else
                if (x == 8) {// 其他错误
                    self.dialogShow(function () {
                        self.dialogText.html("<span>对不起出错啦</span>");
                        self.dialogBd.removeClass().addClass("bd c0");
                    });
                } else
                {
                    self.dialogShow(function () {
                        self.dialogText.html("<span>对不起出错啦</span>");
                        self.dialogBd.removeClass().addClass("bd c0");
                    });
                }
        } }, { key: "dialogShow", value: function dialogShow(
        fn) {
            fn && fn();
            this.dialog.show();
            this.wpAnimate(this.dialog, "bounceInDown");
        } }]);return App;}();




new App();