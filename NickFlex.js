;(function(){
/**
 * @author nick (崔传腾)
 * @email 401541212@qq.com
 * @date 2018-3-28
 * @version 1.0
 * @description 移动端布局新解决方案： NickFlex.js主要解决移动端适配问题，
 * 解决REM单位下产生的问题以及REM单位在开发及维护中的不便。
 * 1.解决了REM单位下1像素边框的问题
 * 2.解决了REM单位下字体可能异常变大的问题
 * 3.解决了REM单位下所有图片或背影都需要设置尺寸的问题
 * 4.解决了REM单位下处处需要进行计算的问题
 * 5.解决了REM单位下图片放大失真需要2X 3X图的问题 使用1X图依然不失真！
 * 6.解决了REM单位字体偶尔异常巨大的问题。
 * 源码详见https://github.com/cuichuanteng/NickEvent/blob/master/NickFlex.js
 * @example 使用方法如下
 *  1.引入当前js文件即可 默认会自动执行NickFlex().resize();
 *  如果我的设计稿不是750或者最小宽度不希望是750的一半375怎么办？
 * 1. NickFlex().resize(800,500, 750);手动重复执行这个方法并在resize函数内传递参数,如上设计稿尺寸定为800 ，最小尺寸为500,最大尺寸为700
 * 未指定参数的使用默认参数详见resize函数的注释及代码
 * 然后你就可以正常使用px单位了就按设计稿中的尺寸去书写，其它的问题都不用关心，因此一切都会被缩放到最佳的尺寸。
 * 
 */
	/**
	 * @description 初始化页面适配布局，可对指定window窗口进行适配处理
	 * @param {Window} win window对象指定要操作的window窗口，默认为当前window
	 */
	var NickFlex = function(win){
		/**
		 * @type {Window} _window 要操作的window对象
		 * @type {Document} _document 要操作的document文档对象
		 * @type {Element} _body 要操作的body对象
		 * @type {Object} flex 进行适配操作的对象
		 * @type {Array} _metas meta标签列表用于检测是否设置meta标签及缩放比例
		 * @type {Boolean} _hasViewPort 判断是否有viewport标签
		 * @type {Number} _minWidth 保存用户指定的在PC或大屏下显示的最小宽度
		 */
		var _window = /Window|global/i.test({}.toString.call(win).slice(8, -1)) ? win : window;
		var _document = _window.document;
		var _body = _document.body;
		var _metas;
		var _hasViewPort;
		var _minWidth;
		var flex = {
			/**
			 * 
			 * @param {Number} designWidth 配置设计稿的宽度，默认为750
			 * @param {Number} minWidth    配置当可视区域大于最大宽度时默认以多少宽度显示，即最小显示宽度，默认为设计稿宽的1/2 即一半
			 * @param {Number} maxWidth    配置最大的宽度，当可视区域宽度超过此最大限制时强制设置body的宽度为最小宽度，以保持最佳显示。
			 */
			resize:function(designWidth, minWidth, maxWidth){
				var resize = function(){
					//获取所有viewport标签
					_metas = document.querySelectorAll('meta[name="viewport"]');
					//判断是否有viewport
					_hasViewPort = !!_metas.length;
					//没有viewport创建一个
					_metas = !_hasViewPort ? [document.createElement('meta')] : _metas;
					//设置viewport属性
					if(!_hasViewPort){
						_metas[0].name = 'viewport';
						document.querySelector('head').appendChild(_metas[0]);
					}
					//遍历meta标签强制设置缩放为1比1
					[].forEach.call(_metas, function(_meta){
						//对于设置viewport的meta标签强制指定content属性  设置1比1缩放，禁用双击缩放，iphonex则viewport-fit=cover解决刘海问题
						_meta.content = 'width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
					});
					//如果指定最大宽度且body宽大于最大宽，或者未指定最大宽并且页面宽大于375，这两种条件下重置最小宽度
					if( (maxWidth && _body.clientWidth > maxWidth) || (!maxWidth && document.documentElement.clientWidth > 375)){
						_body.style.cssText+='width:'+minWidth+'px;';
					}
					//同时限制html body溢出隐藏，因此缩放后的container已经超出body和html范围
					_document.documentElement.style.cssText += _body.style.cssText+='height:100%;margin:0 auto;overflow:hidden;';
					/**
					 * @type {Element} container body的第一个子元素 所有内容必须写在body中的第一个子元素中
					 * @type {Number}  clientWidth body的可视区域宽度
					 * @type {Number}  clientHeight body的可视区域高度
					 * @type {Number}  scale 需要缩放的比例， 可视区域的宽/设计稿的宽得到一个缩放比值。 假设设计稿750 body 375 则 375/750=0.5 则窗口需要缩小0.5倍才正好适配body的宽度
					 * @type {Number}  zoom  高度需要放大的比例，当进行scale缩放时导致高度跟着缩放，为了让高度适应屏幕高度达到百分百的高必须将高度值*放大比例进行高度补偿。假设body高度750 scale0.5之后高度只有375半屏高度，因此先将高度750*2 然后再scale0.5保持高度依然是一屏高。
					 */
					var container = _body.firstElementChild;
					var clientWidth = _body.clientWidth;
					var clientHeight = _body.clientHeight;
					var scale = clientWidth / designWidth;
					var zoom = designWidth / clientWidth;
					//设置body的第一个子元素节点的宽高缩放等属性完成适配初始化,container窗口将替代body成为主容器，默认允许溢出且溢出滚动
					container.style.cssText+='overflow:auto;-webkit-overflow-scrolling: touch;width:100%;-webkit-transform:scale('+scale+');transform:scale('+scale+');-webkit-transform-origin:left top;transform-origin:left top;height:'+clientHeight*zoom+'px;width:'+designWidth+'px;';
				};
				//重置视口最大宽度
				var resizeWidth = function(){
					//获取可视区域宽度判断屏幕宽
					var clientWidth = document.documentElement.clientWidth;
					//小于750宽的设备以设计稿宽一半显示，一般750的设计稿以375显示， 大于1000并且小于1199的以750显示 针对ipad pro， 大于750但小于1100的以640显示对应ipad ，其它超过1199的PC默认以设计稿一半显示。
					minWidth = _minWidth ||  (clientWidth > 750 ? (clientWidth > 1000 && clientWidth < 1199  ?  750 : ( clientWidth > 1100 ? designWidth/2 : 640 )) : designWidth/2);
				}
				//未指定设计稿宽则默认为750
				designWidth = designWidth - 0 || 750;
				//未指定最大宽度，即PC与移动端区分的最大宽度值，默认为768 ，即ipad依然正常缩放显示，而ipad pro则视为PC 
				maxWidth = maxWidth -0 || 0;
				//获取在PC或大屏下用户强制设置的最小显示宽度,若未指定则自动适配
				_minWidth = minWidth - 0; 
				resizeWidth();
				if(_body){
					//body加载立即执行重置
					resize();
				}else{
					//body未加载待DOM加载完成后设置
					_document.addEventListener('DOMContentLoaded', function(){
						_body = _document.body;
						resize();
					});
				}
				//窗口变化时重新检测调整适配
				_window.addEventListener('resize', function(){
					  resizeWidth();
				      resize();
				});
			}
		};
		return flex;
	};
	NickFlex(window).resize();
	window.NickFlex = NickFlex;
})();
