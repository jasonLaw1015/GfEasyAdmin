import { BaseService, Service, Permission } from "/@/core";
@Service("genCodeConfig")
class GenCodeConfig extends BaseService {
	@Permission("firstInfo")
	firstInfo(params: any) {
		return this.request({
			url: "/firstInfo",
			params
		});
	}
	@Permission("save")
	save(data: any) {
		return this.request({
			url: "/save",
			data,
			method: "POST"
		});
	}
}
export default GenCodeConfig;
