# NickEvent
NickEvent类是一个集事件机制、流程控制机制、异步操作等于一体的类库，
它是基于事件的，并且支持异步操作或异步事件，
使用它不需要使用promise因为内部已经具有promise的功能，
流程控制主要负责处理事件之间的关联及依赖关系而且是支持异步的。

一个小小的示例：
chain打头的事件绑定方法表示是需要关联依赖的，数组中定义的就是该事件所需要的关联依赖
chain表示关联完成，chainAll表示所有关联成功完成，chainError表示所有关联失败完成。
使用setTimeout加随机时间只是为了模拟异步操作。
如下功能：
   同时异步去加载数据库配置文件，和模板文件。
   数据库连接事件依赖于数据库配置文件，配置文件加载后会触发数据库连接事件，
   数据库查询事件又依赖于数据库连接事件，数据库连接成功后会触发数据库查询事件，
   渲染事件依赖于数据库查询与模板加载事件，当数据库查询完成并且模板加载完成后会触发渲染事件。
   每一个事件的第一个参数都是next回调函数，执行函数若传递参数true表示当前事件操作失败，若不传递参数则表示当前回调函数执行成功。
   通过next来通知事件是否完成，它是依赖关系处理的关键所在！
   
   
		var myevent = new NickEvents();
		var randTime = function(){
			return parseInt(Math.random()*1000);	
		};
		myevent.on('load-config',function(next){
			setTimeout(function(){
				console.log('加载数据库配置文件成功');
				next();
			},randTime());
		});
		myevent.chainAll('connect-db',['load-config'],function(next){
			setTimeout(function(){
				console.log('连接数据库成功'); next();
			},randTime());
		});
		myevent.chain('select-db',['connect-db'],function(next){
			setTimeout(function(){
				console.log('查询数据成功');	next();
			},randTime());
		});
		myevent.on('load-template',function(next){
			setTimeout(function(){
				console.log('加载模板成功');	next();
			},randTime());
		});
		myevent.chainAsyncAll('render',['select-db','load-template'],function(next){
			setTimeout(function(){
				console.log('渲染成功');		next();
			},randTime());
		});
		myevent.emit('load-config');
		myevent.emit('load-template');
		
		setTimeout(function(){
			myevent.emit('load-config');
			myevent.emit('load-template');
		},5000);
