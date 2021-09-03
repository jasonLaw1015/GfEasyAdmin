import { BaseService, Service, Permission } from "/@/core";

@Service("baseComm")
class Common extends BaseService {
	/**
	 * 文件上传模式
	 */
	@Permission("uploadMode")
	uploadMode() {
		return this.request({
			url: "/uploadMode"
		});
	}

	/**
	 * 文件上传，如果模式是 cloud，返回对应参数
	 *
	 * @returns
	 * @memberof CommonService
	 */
	@Permission("upload")
	upload(params: any) {
		return this.request({
			url: "/upload",
			method: "POST",
			params
		});
	}

	/**
	 * 用户退出
	 */
	@Permission("logout")
	userLogout() {
		return this.request({
			url: "/logout",
			method: "POST"
		});
	}

	/**
	 * 用户信息
	 *
	 * @returns
	 * @memberof CommonService
	 */
	@Permission("person")
	userInfo() {
		return this.request({
			url: "/person"
		});
	}

	/**
	 * 用户信息修改
	 *
	 * @param {*} params
	 * @returns
	 * @memberof CommonService
	 */
	@Permission("personUpdate")
	userUpdate(params: any) {
		return this.request({
			url: "/personUpdate",
			method: "POST",
			data: {
				...params
			}
		});
	}

	/**
	 * 权限信息
	 *
	 * @returns
	 * @memberof CommonService
	 */
	@Permission("permmenu")
	permMenu() {
		return this.request({
			url: "/permmenu"
		});
	}
}

export default Common;
