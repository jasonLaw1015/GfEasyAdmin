<template>
	<cl-crud :ref="setRefs('crud')" @load="onLoad">
		<el-row type="flex" align="middle">
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<!-- 导出excel -->
			<cl-export-btn type="success" :columns="table.columns" />

			<!-- 删除按钮 -->
			<cl-multi-delete-btn />
			<cl-flex1 />
			<!-- 时间筛选 -->
			<!-- <div @click="goTo(`/plugin`, { id: 1 })">路由</div> -->
			<cl-filter label="时间筛选">
				<el-date-picker
					v-model="condition.date"
					unlink-panels
					type="datetimerange"
					range-separator="至"
					size="mini"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:default-time="[
						new Date(2000, 1, 1, 0, 0, 0),
						new Date(2000, 2, 1, 23, 59, 59)
					]"
					@change="dateChange"
				/>
			</cl-filter>
		</el-row>
		<el-row type="flex" align="middle">
			<el-button type="danger" size="mini" @click="openSetting1"
				>1、配置所需要环境参数</el-button
			>
			<el-button type="warning" size="mini" @click="openSetting2"
				>2、检测步骤1配置是否可用</el-button
			>
			<el-button type="primary" size="mini" @click="openSetting3">3、开始生成代码</el-button>
			<!-- 新增按钮 -->
			<!-- <cl-add-btn>3、开始选择表生成代码</cl-add-btn> -->
			<cl-flex1 />
		</el-row>
		<el-row type="flex" align="middle">
			<el-link>生成代码日志</el-link>
			<cl-flex1 />
			<!-- 关键字搜索 -->
			<cl-search-key />
		</el-row>
		<el-row>
			<!-- 数据表格 -->
			<cl-table :ref="setRefs('table')" v-bind="table">
				<!-- tables -->
				<template #column-tables="{ scope }">
					<span v-for="(item, k) in scope.row.tables.split(`,`)" :key="k">
						<el-tag type="success">{{ item }}</el-tag>
					</span>
				</template>
				<template #slot-other="{ scope }">
					<el-button type="text" size="mini" @click="openSetting(scope.row)">
						打开表单
					</el-button>
				</template>
			</cl-table>
		</el-row>
		<el-row type="flex">
			<cl-flex1 />
			<!-- 分页控件 -->
			<cl-pagination />
		</el-row>
		<!-- 新增、编辑 -->
		<cl-upsert
			:ref="setRefs('upsert')"
			v-bind="upsert"
			:on-info="onUpsertInfo"
			:on-submit="onUpsertSubmit"
		/>
		<!-- 表单 -->
		<cl-form :ref="setRefs('form')">
			<template #slot-tables="{ scope }">
				<checkbox-group
					:maxNum="state.hasActiveCode == -1 ? 1 : -1"
					v-model="scope.tables"
					:options="state.optionsList"
				/>
			</template>
		</cl-form>
	</cl-crud>
</template>
<script lang="ts">
import { defineComponent, inject, reactive, ref, onMounted } from "vue";
import { CrudLoad, Upsert, Table } from "cl-admin-crud-vue3/types";
import { useRefs, useGoTo } from "/@/core";
import * as Dict from "../dict/genCodeLog";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import axios from "axios";
//@ts-ignore
// import Cookies from "js-cookie";
import CheckboxGroup from "../components/checkbox/group.vue";
import { storage } from "/@/core/utils";

const GenHost = "http://127.0.0.1:9000";

export default defineComponent({
	components: {
		CheckboxGroup
	},
	setup() {
		const { refs, setRefs } = useRefs();
		const { goTo } = useGoTo();
		// 请求服务
		const service = inject<any>("service");
		//hasActiveCode -1 没激活码 1有激活码
		let state = reactive<any>({ optionsList: [{}], hasActiveCode: -1 });
		const DictRef = reactive<any>(Dict);
		//已使用生成数量
		let usedGenNum = ref(0);
		const condition = ref<any>({
			types: "",
			status: "",
			date: []
		});
		//非激活用户-限制生成代码次数
		const LimitGenNum = ref(3);
		onMounted(() => {
			//过期
			if (storage.isExpired("usedGenNum")) {
				console.log("过期", storage.get("usedGenNum"), storage.isExpired("usedGenNum"));
				usedGenNum.value = 0;
			} else {
				console.log("未过期", storage.get("usedGenNum"), storage.isExpired("usedGenNum"));

				usedGenNum.value = storage.get("usedGenNum") || 0;
			}
		});
		// 新增、编辑配置
		const upsert = reactive<Upsert>({
			items: [
				{
					prop: "title",
					label: "标题",
					component: {
						name: "el-input",
						props: {
							placeholder: "请输入标题"
						}
					},
					rules: {
						required: true,
						message: "标题标题不能为空"
					}
				},
				{
					prop: "description",
					label: "描述",
					component: {
						name: "el-input",
						props: {
							placeholder: "请输入描述"
						}
					},
					rules: {
						required: true,
						message: "描述标题不能为空"
					}
				},
				{
					prop: "tables",
					label: "生成的表",
					component: {
						name: "el-input",
						props: {
							placeholder: "请输入生成的表",
							rows: 3,
							type: "textarea"
						}
					},
					rules: {
						required: true,
						message: "生成的表标题不能为空"
					}
				},
				{
					prop: "params",
					label: "当前请求参数",
					component: {
						name: "el-input",
						props: {
							placeholder: "请输入当前请求参数",
							rows: 6,
							type: "textarea"
						}
					},
					rules: {
						required: true,
						message: "当前请求参数标题不能为空"
					}
				},
				{
					prop: "res",
					label: "请求结果",
					component: {
						name: "el-input",
						props: {
							placeholder: "请输入请求结果"
						}
					},
					rules: {
						required: true,
						message: "请求结果标题不能为空"
					}
				}
			]
		});
		// 表格配置
		const table = reactive<Table>({
			props: {
				"row-key": "id"
			},
			columns: [
				{
					type: "selection",
					width: 60
				},
				{
					prop: "id",
					label: "ID",
					align: "center"
				},
				{
					prop: "createTime",
					label: "创建时间",
					align: "center",
					sortable: true
				},
				{
					prop: "updateTime",
					label: "更新时间",
					align: "center"
				},
				{
					prop: "title",
					label: "标题",
					align: "center"
				},
				{
					prop: "description",
					label: "描述",
					align: "center"
				},
				{
					prop: "tables",
					label: "生成的表",
					align: "center"
				},
				{
					prop: "params",
					label: "当前请求参数",
					align: "center",
					minWidth: 200,
					showOverflowTooltip: true
				},
				{
					prop: "res",
					label: "请求结果",
					align: "center"
				},
				{
					label: "操作",
					type: "op",
					// buttons: ["slot-other", "edit", "delete"],
					buttons: ["edit", "delete"]
				}
			]
		});
		// 搜索条件更改
		function onDataChange(key: string, value: any) {
			const obj: any = {};
			obj[key] = value;
			refs.value.crud.refresh(obj);
		}
		// 搜索条件-类型更改
		function typesChange(value: any) {
			onDataChange("types", value);
		}
		// 时间筛选
		function dateChange(date: any) {
			let [startTime, endTime] = date || [];
			if (startTime) {
				startTime = dayjs(startTime).format("YYYY-MM-DD 00:00:00");
			}
			if (endTime) {
				endTime = dayjs(endTime).format("YYYY-MM-DD 23:59:59");
			}
			refs.value.crud.refresh({ startTime, endTime });
		}
		// crud 加载
		function onLoad({ ctx, app }: CrudLoad) {
			// 绑定 service
			ctx.service(service.genCodeLog).done();
			app.refresh();
		}
		/**
		 * 编辑-打开事件
		 * prams 请求参数
		 * next 调用info方法
		 * done 表示数据处理完毕，返回给表单
		 */
		async function onUpsertInfo(params: any, { next, done }: any) {
			// console.log("onUpsertInfo", { params, next, done });
			//do something;这里可以对params做下处理
			const d: any = await next(params);
			//do something; 对d数据处理
			done(d);
		}
		/**
		 * 提交事件，处理数据;
		 * isEdit 判断是不是编辑的，true 编辑更新  false 新增操作提交
		 * data  需要提交的数据
		 * next  调用next()会自动调用service.***的add、update方法
		 */
		function onUpsertSubmit(isEdit: boolean, data: any, { next }: any) {
			// console.log("onUpsertSubmit", { isEdit, data, next });
			//true 表示data是编辑操作后传入的
			if (isEdit) {
				//do something
			} else {
				//do something
			}
			next(data);
		}
		/**
		 * 打开其他表单数据，@click="openSetting(scope.row)"
		 * data 传入的数据
		 */
		async function openSetting1() {
			let row: any = {};
			await service.genCodeConfig
				.firstInfo()
				.then((res: any) => {
					row = res || {};
				})
				.catch((err: any) => {
					ElMessage.error(err);
				});

			refs.value.form.open({
				title: "配置1",
				width: "80%",
				pros: {},
				items: [
					{
						prop: "dbHost",
						label: "数据库host",
						value: row.dbHost,
						component: {
							name: "el-input",
							props: {
								placeholder: "请输入数据库host"
							}
						},
						rules: {
							required: true,
							message: "数据库host标题不能为空"
						}
					},
					{
						prop: "dbPort",
						label: "数据库端口",
						value: row.dbPort,

						component: {
							name: "el-input",
							props: {
								placeholder: "请输入数据库端口"
							}
						},
						rules: {
							required: true,
							message: "数据库端口标题不能为空"
						}
					},
					{
						prop: "dbUser",
						label: "数据库用户",
						value: row.dbUser,
						component: {
							name: "el-input",
							props: {
								placeholder: "请输入数据库用户"
							}
						},
						rules: {
							required: true,
							message: "数据库用户标题不能为空"
						}
					},
					{
						prop: "dbPass",
						label: "数据库密码",
						value: row.dbPass,
						component: {
							name: "el-input",
							props: {
								type: "password",
								placeholder: "请输入数据库密码"
							}
						},
						rules: {
							required: true,
							message: "数据库密码标题不能为空"
						}
					},
					{
						prop: "dbName",
						label: "数据库名",
						value: row.dbName,
						component: {
							name: "el-input",
							props: {
								placeholder: "请输入数据库名"
							}
						},
						rules: {
							required: true,
							message: "数据库名标题不能为空"
						}
					},
					{
						prop: "dbType",
						label: "数据库类型",
						value: row.dbType,
						component: {
							name: "el-input",
							props: {
								placeholder:
									"请输入数据库类型，如mysql/pgsql/mssql/sqlite/oracle，默认mysql"
							}
						},
						rules: {
							required: true,
							message:
								"数据库类型，如mysql/pgsql/mssql/sqlite/oracle，默认mysql标题不能为空"
						}
					},
					{
						prop: "adminGenPath",
						label: "生成代码前端目录",
						value: row.adminGenPath,
						component: {
							name: "el-input",
							props: {
								placeholder: "请输入生成代码前端目录",
								rows: 3,
								type: "textarea"
							}
						},
						rules: {
							required: true,
							message: "生成代码前端目录标题不能为空"
						}
					},
					{
						prop: "serverGenPath",
						label: "生成代码服务端目录",
						value: row.serverGenPath,
						component: {
							name: "el-input",
							props: {
								placeholder: "请输入生成代码服务端目录",
								rows: 3,
								type: "textarea"
							}
						},
						rules: {
							required: true,
							message: "生成代码服务端目录标题不能为空"
						}
					},
					{
						prop: "defaultCreatedAtLabel",
						label: "默认的创建时间字段label",
						value: row.defaultCreatedAtLabel,
						component: {
							name: "el-input",
							props: {
								placeholder: "请输入默认的时间字段格式，如createTime"
							}
						},
						rules: {
							required: true,
							message: "默认的时间字段格式，如createTime标题不能为空"
						}
					},
					{
						prop: "defaultUpdatedAtLabel",
						label: "默认的更新时间字段label",
						value: row.defaultUpdatedAtLabel,
						component: {
							name: "el-input",
							props: {
								placeholder: "请输入默认的时间字段格式，如updateTime"
							}
						},
						rules: {
							required: true,
							message: "默认的时间字段格式，如updateTime标题不能为空"
						}
					},
					{
						prop: "ignoreTablePrefix",
						label: "忽略此前缀的表，逗号分隔",
						value: row.ignoreTablePrefix,
						component: {
							name: "el-input",
							props: {
								placeholder: "请输入忽略此前缀的表，逗号分隔"
							}
						},
						rules: {
							required: true,
							message: "忽略此前缀的表，逗号分隔标题不能为空"
						}
					},
					{
						prop: "activeCode",
						label: "激活码",
						value: row.activeCode,
						component: {
							name: "el-input",
							props: {
								"show-password": true,
								placeholder: "请输入激活码"
							}
						}
					}
				],
				on: {
					submit: (data: any, { close, done }: any) => {
						console.log({ row });
						console.log(data, close, done);
						data.id = row.id || null;
						service.genCodeConfig
							.save(data)
							.then(() => {
								done();
								close();
							})
							.catch((err: any) => {
								ElMessage.error(err);
								done();
							});
					}
				}
			});
		}
		async function openSetting2() {
			let config: any = {};
			await service.genCodeConfig
				.firstInfo()
				.then((res: any) => {
					config = res || {};
				})
				.catch((err: any) => {
					ElMessage.error(err);
				});
			//检测
			PostGenCheck(config);
		}
		async function openSetting3() {
			//获取配置参数
			let config: any = {};
			await service.genCodeConfig
				.firstInfo()
				.then((res: any) => {
					config = res || {};
				})
				.catch((err: any) => {
					ElMessage.error(err);
				});

			//获取可生成的表
			let res = await PostGenTableList(config);
			if (res && res.length > 0) {
				state.optionsList = res.map((item: any) => {
					return {
						label: item.tableName,
						value: item.tableComment
					};
				});
			}
			console.log({ config });
			let title = "生成代码:";
			if (config.activeCode == "") {
				title =
					title +
					"(最大使用数量：" +
					LimitGenNum.value +
					"，已使用数量：" +
					usedGenNum.value +
					"）";
			} else {
				state.hasActiveCode = 1;
			}
			//打开表单
			refs.value.form.open({
				title,
				width: "80%",
				props: {},
				items: [
					{
						prop: "title",
						label: "标题",
						component: {
							name: "el-input",
							props: {
								placeholder: "请输入标题"
							}
						},
						rules: {
							required: true,
							message: "标题标题不能为空"
						}
					},
					{
						prop: "description",
						label: "描述",
						component: {
							name: "el-input",
							props: {
								placeholder: "请输入描述",
								rows: 3,
								type: "textarea"
							}
						},
						rules: {
							required: true,
							message: "描述标题不能为空"
						}
					},
					{
						prop: "tables",
						label: "选择需要生成的表",
						component: {
							name: "slot-tables"
						},
						rules: {
							required: true,
							message: "选择需要生成的表不能为空",
							trigger: ["change", "click"]
						}
					}
				],
				on: {
					submit: (data: any, { close, done }: any) => {
						let params = { ...data, ...config };
						params.tableNames = data.tables ? data.tables.join(",") : "";
						delete params.tables;
						//没激活码
						if (config.activeCode == "") {
							if (Number(usedGenNum.value) < LimitGenNum.value) {
								PostBatchGenCode(params);
							} else {
								ElMessage.error(
									"未有激活的用户，每天只能使用" + LimitGenNum.value + "次"
								);
							}
						} else {
							PostBatchGenCode(params);
						}

						done();
						close();
					}
				}
			});
		}

		//request 获取生成配置是否正确
		function PostGenCheck(config: any) {
			axios
				.post(GenHost + "/admin/genTable/check", config)
				.then(function (response) {
					console.log(response);
					ElMessageBox.confirm("步骤1配置，校验通过!!", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "success"
					});
					// ElMessage.info(response);
				})
				.catch(function (error) {
					console.log(error);
					ElMessageBox.confirm("error:" + error, "步骤1配置出现错误，请检查!", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "error"
					});
				});
		}
		//request 获取生成配置是否正确
		function PostBatchGenCode(config: any) {
			axios
				.post(GenHost + "/admin/batchGenCode", config)
				.then(function (response) {
					console.log(response);

					//判断没激活码的才要记录cookie值
					if (config.activeCode == "") {
						const temp = Number(usedGenNum.value) + 1;
						if (Number(usedGenNum.value) > 0) {
							storage.set("usedGenNum", temp);
							// Cookies.set("usedGenNum", temp);
						} else {
							// var exp = dayjs().add(10, "second").toDate();
							//30s
							storage.set("usedGenNum", temp, 60 * 60 * 24);
							// Cookies.set("usedGenNum", temp, {
							// 	expires: exp
							// });
						}
						usedGenNum.value = temp;
					}

					ElMessageBox.confirm("生成成功", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "success"
					});
					// ElMessage.info(response);
				})
				.catch(function (error) {
					console.log(error);
					ElMessageBox.confirm("error:" + error, "生成失败", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "error"
					});
				});
		}
		//request 获取生成配置是否正确
		async function PostGenTableList(config: any) {
			let res: any;
			try {
				res = await axios.post(GenHost + "/admin/genTable/list", config);
			} catch (error) {
				ElMessageBox.confirm("error:" + error, "生成失败", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "error"
				});
			}
			return res;
		}

		return {
			refs,
			setRefs,
			upsert,
			DictRef,
			table,
			condition,
			typesChange,
			dateChange,
			onUpsertInfo,
			onUpsertSubmit,
			openSetting1,
			openSetting2,
			openSetting3,
			goTo,
			onLoad,
			state,
			LimitGenNum,
			PostGenCheck
		};
	}
});
</script>
<style lang="sass" scoped>
.span-label
  font-size: 12px
  outline: none
  cursor: pointer
  color: #333
  min-width: 30px
  margin-left: 10px
</style>
