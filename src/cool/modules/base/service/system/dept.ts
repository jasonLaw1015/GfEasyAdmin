import { BaseService, Service, Permission } from "/@/core";

@Service("baseSysDepartment")
class SysDepartment extends BaseService {
	@Permission("order")
	order(data: any) {
		return this.request({
			url: "/order",
			method: "POST",
			data
		});
	}
}

export default SysDepartment;
