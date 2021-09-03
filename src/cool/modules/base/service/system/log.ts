import { BaseService, Service, Permission } from "/@/core";

@Service("baseSysLog")
class SysLog extends BaseService {
	@Permission("clear")
	clear(data: any) {
		return this.request({
			url: "/clear",
			method: "POST",
			data
		});
	}

	@Permission("getKeep")
	getKeep() {
		return this.request({
			url: "/getKeep"
		});
	}

	@Permission("setKeep")
	setKeep(value: any) {
		return this.request({
			url: "/setKeep",
			method: "POST",
			data: {
				value
			}
		});
	}
}

export default SysLog;
