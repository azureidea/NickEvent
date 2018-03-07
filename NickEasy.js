/**
 * @author nick 
 * @email 401541212@qq.com
 * @date 2018-3-4 
 * @version 1.0
 * @description NickEasy轻量级的前端框架，本框架以事件为驱动方式继承于NickEvents，记录DOM与引用的数据的绑定关系，当数据发生变化时通知绑定的DOM元素进行更新，因此更新是更精确的且不需要复杂大量的比较。
 * 该框架推荐通过属性来约定数据绑定的关系，并且该框架只占用较小的自定义属性名称以减少属性名冲突的问题！
 * 所有的事件通过事件路由规则进行绑定，事件路由是异步方式执行，通过事件委托进行执行！
 */
;(function() {
	'use strict';
	/**
	 * @description 将{}中的表达式通过eval语句执行解析，为了统一规范限制了循环中可以使用的index索引及当前循环到的value值，并且将this指向了当前对象
	 * 将此函数放在这个位置目的是防止内部私有变量被修改，开辟出新的作用域。
	 * @param {String} __ 需要通过eval执行的语句
	 * @param {Object} index 当前遍历的索引
	 * @param {Object} value 当前遍历的数据
	 */
	var $eval = function(__, index, value) {
		try {
			return eval(__);
		} catch(e) {
			console.error(e);
		}
	};
	(function() {
		/**
		 * @description 返回数据类型，并且可以根据指定的正则表达式判断数据类型是否匹配
		 * @param {Object} type
		 * @return {Boolean|String} 返回布尔值或数据类型
		 */
		var getType = function(type) {
			return function(data) {
				var dataType = {}.toString.call(data).slice(8, -1);
				return type ? new RegExp(type).test(dataType) : dataType;
			}
		};
		/**
		 * @type {Function} type 返回指定数据的类型
		 * @type {Function} isArray 返回指定数据是否是数组类型
		 * @type {Function} isFunction 返回指定数据是否是函数类型
		 * @type {Function} isObject 返回指定数据是否是对象类型
		 * @type {Function} isNumber 返回指定数据是否是数值类型
		 * @type {Function} isString 返回指定数据是否是字符串类型
		 * @type {Function} isWindow 返回指定数据是否是window对象
		 */
		var type = getType();
		var isArray = getType('Array');
		var isFunction = getType('Function');
		var isObject = getType('Object');
		var isNumber = getType('Number');
		var isString = getType('String');
		var isWindow = getType('Window|global');
		var isElement = function(element) {
			return element && element instanceof HTMLElement;
		};
		/**
		 * @description NickEasy框架的特点是轻量、易用，对于数据绑定及更新没有引入虚拟DOM，并且采用的是数据与DOM关联的方式进行数据更新，
		 * 如果一个数据被N个元素引用则关联关系数组中将保存所有的元素，一旦数据发生更新即会通知这些元素进行重新渲染，同一个元素不会在同一个数据中出现两次，
		 * 并且垃圾回收机制会异步回收已经不在页面上的元素以解决可能发生的内存泄漏问题。
		 * @param {Object} element
		 * @constructor NickEasy框架类
		 * @param {Element} 一个对象将绑定一个元素作为上下文对象，如果未指定该元素默认指向body 
		 */
		var NickEasy = function(element) {
			/**
			 * @type {Object} _this 当前对象
			 * @type {Window} _window 当前窗口对象
			 * @type {Document} _document 当前文档对象
			 * @type {HTMLElement} _html 当前页面根节点即html标签
			 * @type {HTMLBodyElement} _body 当前页面body对象
			 * @type {Element} _context 当前对象关联的上下文对象
			 * @type {Object} __relations 保存数据与DOM元素关联的对象
			 * @type {Object} __store 保存当前state数据的对象
			 * @type {Object} state 可对外的state对象，该对象的值是__store的副本，store更新的时候即更新state
			 * @type {Object} __extendHandler 扩展的处理程序，如果data-nick中定义的属性名与当前对象的属性名一致则将通过该属性方法进行处理 内置了for html class方法
			 */
			var _this = this;
			var _window = window;
			var _document;
			var _html;
			var _body;
			var _context;
			var __relations = {};
			var __store = {};
			var state = {};
			var __extendHandler = {
				/**
				 * @param {Element} element dom元素
				 * @param {Object} data 新的数据
				 * @param {Object} old 旧的数据
				 * @param {Array} template 处理后的模板数组
				 */
				'for': function(element, data, old, template) {
					/**
					 * @type {String} html 保存html代码片段
					 * @type {Array} htmlCopy html文本数组 该数组与模板数组是对应关系 在拆分时 abc{a} abc放在了html数组中 {a}放在了template数组中
					 * @type {Element} div 临时使用的节点
					 * @type {Array} copyTemplate 已处理的模板数组
					 */
					var html = '';
					var htmlCopy = template[0];
					var copyTemplate = template[1];
					//根据当前元素的标签名创建同类型的标签，以便直接进行节点替换
					var div = document.createElement(element.tagName);
					//遍历要更新的数据
					for(var i in data) {
						//获取当前所遍历的数据
						var newData = data[i];
						//复制html代码数组
						var result = htmlCopy.slice();
						//遍历模板数组
						copyTemplate.forEach(function(value, j) {
							//将模板数组中的数据通过eval执行并添加到结果数组中
							result[j] += $eval.call(_this, value, i, data[i]);
						});
						//将处理结果转换成字符串并添加到html字符串中
						html += result.join('');
					}
					//设置元素的html内容
					div.innerHTML = html;
					//将当前的节点与临时节点进行替换
					element.parentNode.replaceChild(div, element);
					//异步对当前元素进行初始化 
					setTimeout(function() {
						init(div);
					});
				},
				'html': function(element, data, old, template) {
					//如果数据不是未定义更新html内容并异步对元素进行初始化
					if(data !== undefined) {
						element.innerHTML = data;
						setTimeout(function() {
							init(element);
						});
					}
				},
				'class': function(element, data, old) {
					//通过classList删除老的类名添加新的类名
					var classList = element.classList;
					classList.remove(old);
					if(data) classList.add(data);
				}
			};
			/**
			 * 
			 * @param {Window} wind 重置当前对象内的window对象，此方法主要应用于框架引用父级时window指向的问题
			 */
			var setWindow = function(wind) {
				//如果指定了新的window对象 更新相关变量
				if(isWindow(wind)) {
					_window = wind;
					_document = _window.document;
					_html = _document.documentElement;
					_body = _document.body;
				}
			};
			/**
			 * @description 遍历指定元素内的所有节点，根据节点的属性及文本节点中的{}表达式进行数据关联关系绑定及数据渲染
			 * @param {Element} element 需要进行初始化的元素
			 */
			var init = function(element) {
				/**
				 * @type {Element} element 要处理的根节点
				 * @type {Array} replaceRelation 保存需要进行节点替换的文本节点数组，数组中保存的是[文档片段,文本节点]
				 */
				element = isElement(element) ? element : _context;
				var replaceRelation = [];
				/**
				 * @description 将解析出来的节点克隆并添加到代码片段中
				 * @param {Boolean} isText 是否为文本节点
				 * @param {String} result 解析出来的字符串
				 * @param {Element} textNode 文本节点
				 * @param {Element} nickNode 自定义节点
				 * @param {Element} fragment 代码片段
				 */
				var cloneNode = function(isText, result, textNode, nickNode, fragment) {
					/**
					 * @type {String} key 绑定关联关系的数据名称
					 * @type {Element} 将插入页面的克隆的节点
					 */
					var key;
					var element = textNode.cloneNode();
					//如果是文本节点并且文本不是全空 克隆文本节点并设置文本内容
					if(isText && /\S/.test(result)) {
						element.nodeValue = result;
					} else if(!isText) {
						//将表达式两侧空白字符清除
						key = result.replace(/^\s+|\s+$/,'');
						//从state中读取数据
						result = state[key];
						//更新节点内容 如果是undefined则不会显示任何内容，但文本节点依旧存在
						element.nodeValue = result;
						//添加到关联数组中
						addRelation(element, key , 'nodeValue',  []);
					}
					//将节点添加到文档片段
					if(element) fragment.appendChild(element);
				};
				/**
				 * @description 检测元素是否在关联数组中如果不存在则保存到关联数组中
				 * @param {Element} element 要检测的元素
				 * @param {String} key 要绑定的数据名称
				 * @param {String} attribute 与元素关联的属性名
				 * @param {Array} template 保存的模板数据
				 */
				var addRelation = function(element, key, attribute, template){
					//如果当前要绑定的数据名称在关联对象中不存在则创建
					if(!__relations[key]) __relations[key] = [];
					/**
					 * @type {Boolean} inRelation 判断当前元素是否已经在关联数组中
					 * @type {Number} index 用于遍历关联数组的索引值
					 * @type {Array} relation 当前数据名称对应的关联数组
					 * @type {Number} length 关联数组的长度
					 */
					var inRleation;
					var index = 0;
					var relation = __relations[key];
					var length = relation.length;
					//遍历关联数组
					for(; index < length; index++) {
						//如果当前元素已经在关联数组中退出循环，为了防止内存泄漏一定要防止重复存入相同的元素
						if(element == relation[index][0]) {
							inRleation = true;
							break;
						}
					}
					//如果当前元素不在关联数组中 则向关联数组中添加关联关系
					if(!inRleation) __relations[key].push([element, attribute, template]);
				};				
				/**
				 * @description 递归查询节点的函数，每一个元素都会被递归查找，对文本节点和标签节点分别处理
				 * @param {Object} element
				 */
				var mapChildNodes = function(element) {
					/**
					 * @type {Number} nodeType 当前元素的节点类型
					 * @type {NodeList} childNodes 当前元素的子节点集合
					 * @type {String} nodeValue 节点的内容
					 */
					var nodeType = element.nodeType;
					var childNodes = element.childNodes;
					var nodeValue;
					//如果是标签节点需要对标签的属性进行处理
					if(nodeType == 1) {
						/**
						 * @type {String} attribute 获取元素的自定义属性
						 */
						var attribute = element.dataset.nick;
						if(attribute) {
							//如果有属性根据;号对属性进行拆分并遍历
							attribute.split(/;+/).forEach(function(attribute) {
								/**
								 * @type {Array} tmp 保存属性名和值的临时数组
								 * @type {String} key 绑定的属性名称，如果该属性名称为标签的属性名称则数据与标签属性关联，如果属性名在扩展处理程序中有对应的函数则交由扩展程序进行处理
								 * @type {String} value 绑定的数据名称，即在state中的key名称 当对应的数据发生变化时会通知关联的元素进行渲染
								 */
								var tmp = attribute.split('=');
								var key = tmp[0];
								var value = tmp[1];
								//如果绑定的属性为for则特殊处理
								if(key == 'for') {
									/**
									 * @type {String} htmlStr 当前元素的html内容
									 * @type {Number} index 查找文本时用于标记位置的索引值
									 * @type {Array} html 用于保存html文本的数组
									 * @type {Array} template 用于保存表达式模板的数组
									 */
									var htmlStr = element.innerHTML;
									var index = 0;
									var html = [];
									var template = [];
									//如果当前元素没有forInit属性则设置属性并清空内容，此方法只执行一次，因为for处理完成之后还会触发init 因此仅第一次进行内容清空
									if(!element.forInit) {
										element.innerHTML = '';
										element.forInit = true;
									}
									//通过replace方法对节点内容进行匹配处理
									htmlStr.replace(/\{.*?\}/g, function(matchResult, matchIndex) {
										//将表达式之前的文本存储到html数组中
										html.push(htmlStr.substring(index, matchIndex));
										//将当前匹配的表达式存入到template模板数组中
										template.push(matchResult.slice(1, -1));
										//更新查找的索引位置
										index = matchIndex + matchResult.length;
									});
									//将剩余的字符串存入到html数组中
									html.push(htmlStr.substring(index));
									//更新模板数组
									template = [html, template];
								}
								//添加到关联数组中
								addRelation(element, value, key, template);
							});
						};
						//遍历当前元素的子节点并继续进行递归处理
						[].forEach.call(childNodes, function(element) {
							mapChildNodes(element);
						});
					} else if(/\{.*?\}/.test(nodeValue = element.nodeValue)) {
						/**
						 * 如果是文本节点并且节点内容包含{}表达式则对节点进行替换处理
						 * @type {Element} fragment 文档片段
						 * @type {Number} index 用于遍历的索引值
						 * @type {Element} nickNode 临时使用的nick节点
						 * @type {Element} textNode 临时使用的文本节点
						 * @type {String} text 匹配到的纯文本内容
						 * @type {String} result 匹配到的{}表达式
						 * @type {Element} nodeText 要使用的文本节点
						 * @type {Element} nodeNick 要使用的标签节点
						 */
						var fragment = document.createDocumentFragment();
						var index = 0;
						var nickNode = document.createElement('nick');
						var textNode = document.createTextNode('');
						var text;
						var result;
						var nodeText;
						var nodeNick;
						//匹配文本节点中的表达式进行处理
						nodeValue.replace(/\{.*?\}/g, function(matchResult, matchIndex) {
							//获取表达式前的字符
							text = nodeValue.substring(index, matchIndex);
							//获取匹配到的表达式
							result = matchResult.slice(1, -1);
							//将文本节点和标签节点进行克隆并添加到文档片段中
							cloneNode(true, text, textNode, nickNode, fragment);
							cloneNode(false, result, textNode, nickNode, fragment);
							//更新查找的索引位置
							index = matchIndex + matchResult.length;
						});
						//将最后面的文本节点添加到片段
						cloneNode(true, nodeValue.substring(index), textNode, nickNode, fragment);
						//如果在当前的循环中执行节点替换将导致节点遍历出问题，因为更改了DOM之后节点数量有变化，因此先将要处理的节点保存到数据中，处理完成后统一进行替换
						replaceRelation.push([fragment, element]);
					}

				};
				//递归处理根节点
				mapChildNodes(element);
				//遍历需要进行节点远的的数组 对节点进行替换  abc{title}abc 最终将会生成三个节点 两端是文本节点 中间的节点类型得看表达式的值是html代码还是纯文本
				replaceRelation.forEach(function(relation) {
					relation[1].parentNode.replaceChild(relation[0], relation[1]);
				});
			};
			/**
			 * 
			 * @param {Object} store 数据存储容器，可以指定将数据保存到哪个容器中
			 * @param {Boolean} isDefine 是否为常量数据
			 * @param {Boolean} isUpdate 保存数据后是否触发数据更新处理函数，扩展处理程序就未启用数据更新
			 * @return {Function} 返回数据存储的处理函数
			 */
			var saveData = function(store, isDefine, isUpdate) {
				/**
				 * @param {String|Object} key 要保存的数据或数据名称
				 * @param {Object} value 要保存的数据值
				 */
				return function(key, value) {
					//如果传递的参数是key value形式最终统一拼接成{key:value}形式
					var data = isObject(key) ? key : {};
					if(isString(key) && value !== undefined) data[key] = value;
					//遍历要保存的数据
					for(key in data) {
						//获取当前的数据值
						value = data[key];
						//如果不是常量数据或者 是常量数据但是仓库中的数据为未定义 才允许将数据保存到仓库中
						if(!isDefine || (isDefine && store[key] === undefined)) {
							//将老数据与新数据 转换成字符串进行比较  如果不相等才会进行处理
							if(store[key] + '' !== value + '') {
								var old = store[key];
								store[key] = value;
								//如果要操作的仓库为state对应的仓库  则更新仓库时同步更新state属性
								if(store == __store) {
									state[key] = value;
								}
								//如果需要执行更新则进行数据更新
								if(isUpdate){
									updateData(key, old);
									_this.emit('update', key, value, old);
								}
							}
						}
					}
				}
			};
			/**
			 * 
			 * @param {Object} store 指定要读取的仓库对象
			 * @return {Function} 从仓库中读取数据的处理函数
			 */
			var getData = function(store) {
				/**
				 * @param {String} key 需要读取的数据名
				 */
				return function(key) {
					//从仓库中读取指定的数据
					var data = store[key];
					//要复制的数据副本，所有返回的数据都是副本以防止对内部数据进行修改
					var copy = data;
					//如果读取的数据是数组直接对数组进行复制
					if(isArray(data)) copy = data.slice();
					//如果读取的数据是对象则遍历复制
					if(isObject(data)) {
						copy = {};
						for(key in data) {
							copy[key] = data[key];
						}
					}
					//将复制的数据返回 函数未进行复制！如果想得到函数的副本可以通过new Function实现
					return copy;
				}
			};
			/**
			 * @description 数据更新回调函数，当数据更新时会自动将关联数组中的元素取出并进行重新渲染
			 * @param {String} key 要更新的数据名称
			 * @param {Object} old 更新前老的数据
			 */
			var updateData = function(key, old) {
				//根据数据名称遍历关联数组
				;
				(__relations[key] || []).forEach(function(relation) {
					/**
					 * @type {Element} element 关联的标签元素
					 * @type {String} attribute 关联的标签属性
					 * @type {Array} template 关联的模板数组
					 * @type {Function} handler 根据关联的标签属性查找的对应的处理程序
					 * @type {Object} value 根据关联的数据名获取的数据
					 */
					var element = relation[0];
					var attribute = relation[1];
					var template = relation[2];
					var handler = __extendHandler[attribute];
					var value = _this.get(key);
					//如果元素及属性均有值
					if(element && attribute) {
						//如果有对应的处理程序则交由处理程序处理
						if(handler) {
							handler(element, value, old, template);
						} else {
							//如果不是标签的标签属性则通过setAttribute设置属性
							if(element[attribute] === undefined) {
								element.setAttribute(attribute, value);
							} else {
								//标准属性直接赋值
								element[attribute] = value;
							}
						}
						//执行垃圾回收
						gc(key);
					}
				});
			};
			/**
			 * @description 垃圾回收处理函数，异步遍历关联数组，将不在页面显示的元素从关联数组中清除
			 */
			var gc = function() {
				//仅随机数为0时执行垃圾回收 随机数越大垃圾回收概率越小
				if(parseInt(Math.random() * _this.gc)) return;
				//异步执行
				setTimeout(function() {
					/**
					 * @type {String} key 关联的数据名称
					 * @type {Array} relation 关联数组
					 * @type {Number} index 遍历关联数组的索引值
					 * @type {Number} length 关联数组的长度
					 * @type {Array} tmp 关联数组中取出的数组 里面保存了关联关系
					 * @type {Element} element 当前关联的元素对象
					 * @type {Element} elementParent 当前关联元素的父级对象 
					 */
					var key;
					var relation;
					var index ;
					var length;
					var tmp;
					var element;
					var elementParent;
					//遍历关联数据
					for(key in __relations) {
						//获取指定数据的关联数组
						relation = __relations[key];
						//初始化遍历索引
						index = 0;
						//获取关联数组长度
						length = relation.length;
						//遍历关联数组
						for(; index < length; index++){
							tmp = relation[index];
							element = tmp[0];
							elementParent = element.parentNode;
							//如果当前元素的DOM连接属性为false表示已不在DOM中，该属性低版本不支持，或者该元素没有父级，或者 该元素不是父级的后代，或者该元素不是页面文档的后代那么将元素从数组中清除
							// contains方法在检测时 如果父子都不在文档中 但对父级使用contains依然返回true因为它们还是后代关系，但子级相对于页面文档已经不是，因为它们都不在文档中，为了更高效优先判断连接及父级检测，都不成立再从文档上检测
							if(element.isConnected === false || !elementParent ||  !elementParent.contains(element) || !_document.contains(element)){
								relation.splice(index, 1);
								index--;
								length--;
							}
						}
					}
				});
			};
			/**
			 * @description 事件路由处理函数，所有的事件都绑定在当前对象的根节点上，事件触发时逐级向上查找当查找到根元素时终止
			 * 所有的事件都绑定在eventsRouter对象上 结构如下  eventsRouter = {click:{名称:回调函数},touchstart:{xx:function...}} 
			 */
			var eventsRouter = function(){
				//每个对象只能执行一次事件绑定防止重复绑定
				if(_context.eventRouterInit) return;
				_context.eventRouterInit = true;
				/**
				 * @type {Number} startTime 记录触摸开始的时间
				 * @type {Number} useTime 记录触摸结束时花费的时间
				 * @type {Number} startX 记录触摸开始的X坐标
				 * @type {Number} startY 记录触摸开始的y坐标
				 * @type {Number} moveX 记录移动的X坐标
				 * @type {Number} moveY 记录触移动的y坐标
				 * @type {Boolean} isTouch 记录设备是否支持触摸，在触摸时设置为true
				 */
				var startTime = 0;
				var useTime = 0;
				var startX = 0;
				var startY = 0;
				var moveX = 0;
				var moveY = 0;
				var isTouch;
				/**
				 * @description 开始事件
				 * @param {Event} e event事件对象
				 */
				var start = function(event){
					//记录是否支持触摸，以及开始触摸的坐标和时间
					isTouch = e.changedTouches;
					var e = isTouch ? event.changedTouches[0] : event;
					startTime = Date.now() || e.timeStamp;
					startX = e.clientX;
					startY = e.clientY;
				};
				/**
				 * @description 结束事件
				 * @param {Event} event event事件对象
				 */
				var end = function(event){
					//计算事件结果时所消耗的时间及移动的距离
					var e = isTouch ? event.changedTouches[0] : event;
					useTime = (Date.now() || e.timeStamp) - startTime;
					moveX = e.clientX - startX;
					moveY = e.clientY - startY;
					if(!moveX && !moveY && isTouch){
						//如果未发生移动且是支持触摸则执行click事件
						router('click',e,event);
					}
				};
				/**
				 * @description 移动事件 暂无需求先放着
				 */
				var move = function(){
					
				};
				/**
				 * @description 执行事件路由的处理函数 根据event.target向上查找元素是否有属性绑定了事件，当找到根节点时终止查找
				 * @param {String} type 要执行的事件类型名称
				 * @param {Event} e event对象，如果是触摸设备表示触摸点event
				 * @param {Event} event event对象在触摸设备上表示完整的event对象而非单个触摸点
				 */
				var router = function(type,e,event){
					setTimeout(function(){
						/**
						 * @type {Element} 当前事件的目标元素
						 * @type {Element} 当前根节点的父级节点，当循环查找到根节点的父级时则循环终止
						 */
						var target = e.target;
						var root = _context.parentNode;
						if(!root) return;
						//如果目标存在且不是root节点则继续查找
						while(target && target != root){
							//如果目标节点存在且有自定义events属性则将events属性拆分遍历处理
							if(target && target.dataset && target.dataset.events){
								//遍历事件属性
								target.dataset.events.split(';').forEach(function(tmp){
									//将事件属性拆分成key value形式
									tmp = tmp.split('=');
									var eventHandler = tmp[1];
									//如果元素的data-disabled 为true则表示按钮禁用，不为true即可执行事件
									if(target.dataset.disabled != 'true'){
										_this.emit(eventHandler, target, e, event);
									}
								});
							}
							//更新目标元素向上查找
							target = target.parentNode;
						}
					});
				};
				//绑定事件
				_context.addEventListener('touchstart',start);	
				_context.addEventListener('touchend',end);	
				_context.addEventListener('click',function(e){
					if(!isTouch)router('click',e, e);
				});
			};
			/**
			 * @property {Number} gc 设置垃圾回收执行概率
			 * @property {Object} eventsRouter 当前对象的事件路由对象 结构：  {click:{xx:function(){},xx:function(){}},touch:{...}} 
			 * @property {Object} state 当前对象的state状态数据对象 与__store同步
			 * @property {Function} set 向仓库存储数据的方法
			 * @property {Function} define 向仓库存储常量数据的方法
			 * @property {Function} get 从仓库根据key读取指定数据的方法
			 * @property {Object} extendHandler 向扩展程序添加处理程序的方法 用户可自行添加处理程序
			 * @type {Element} _conext 当前对象关联的DOM元素上下文对象
			 */
			_context = isElement(element) ? element : _body;
			_this.gc = 10;
			_this.eventsRouter = {};
			_this.state = state;
			_this.setWindow = setWindow;
			_this.set = saveData(__store, false, true);
			_this.define = saveData(__store, true, true);
			_this.get = getData(__store);
			_this.extendHandler = saveData(true, __extendHandler, false);
			setWindow(_window);
			NickEvents.call(_this);
			init(_context);
			eventsRouter();
		};
		window.NickEasy = NickEasy;
	})();
})();
