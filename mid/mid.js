class opt {
	constructor(host) {
	    this.host=host;
	}
	wrap_host(uri){
		return this.host+uri;
	}
	
	read(key) {
		return new Promise((resolve, reject) => {
			uni.getStorage({
				key: key,
				success: function(res) {},
				complete: function(res) {
					resolve(res.data)
				}
			})
		})
	}
	write(key, value) {
		return new Promise((resolve, reject) => {
			uni.setStorage({
				key: key,
				data: value,
				complete: function(r) {
					resolve(r);
				}
			})
		})
	}
	to(uri){
		uni.reLaunch({
			url: uri
		});
	}
	navigateTo(uri){
		uni.navigateTo({
			url:uri
		});
	}
	auth_to(uri) {
		default_req.get_().then(d => {
			uni.reLaunch({
				url: uri
			});
		}).catch(e => {
			uni.reLaunch({
				url: ""
			});
		})
	}
	base(method, url, data, opt = {}) {
		return new Promise((resolve, reject) => {
			let header = {};
			if (opt.header) {
				header = opt.header;
			}
			uni.request({
				url: this.wrap_host(url),
				header: header,
				method: method,
				data: data,
				success: res => {
					if (res.statusCode != 200) {
						console.log("---->失败",res)
						if (res.data) {
							if(res.data.message==='token'){
								uni.showToast({
									icon:'none',
									title:'登录过期，请重新登录。'
								},1000);
								setTimeout(()=>{
									uni.removeStorage({
										key: 'token',									
									})
									uni.reLaunch({
										url:'跳转地址'/*跳转地址，比如../sign/sign*/
									})
								},300)
							}else{
								uni.showToast({
									icon:'none',
									title: res.data.message,
								},1000);
							}
						}
					} else {
						if(res.data.message){
							uni.showToast({
								title: res.data.message,
							},1000);
							setTimeout(()=>{resolve(res.data)},300)
						}else{
							resolve(res.data);
						}					
						
					}
				},
				fail: () => {
					reject("fail")
				},
				complete: () => {
					// reject("fail")
				}
			});
		}).catch(t=>{
			console.log("----------------->t",t)
			if(t.data!=null && t.data.message!=null ){
				uni.showToast({
					title: t.data.message,
					duration: 5500		
				});
				uni.reLaunch({
					url: '跳转地址'/*比如/pages/tabBar/TabBar.vue*/
				})
			}else{
				uni.showToast({
					title: t,				
				},1500);
			}
			
		});
		
	}
	//普通的get
	get(url, data) {
		return this.base('GET', url, data);
	}
	post(url, data) {
		return this.base("POST", url, data)
	}
	//自带token的get
	get_(url, data) {
		return this.read("token").then(d => {
			return this.base('GET', url, data, {
				header: {"token":d.data}
			})
		})
	}
	post_(url, data) {
		return this.read("token").then(d => {
			console.log(d,"----------->token")
			return this.base('POST', url, data, {
				header:  {"token":d.data}
			})
		})
	}	
	
}



/* 接口域名地址 */

export default new opt('http://127.0.0.1:8080');

