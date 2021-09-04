<template>
	<cl-crud :ref="setRefs('crud')" @load="onLoad">
		<el-row type="flex" align="middle">
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<!-- 导出excel -->
			<cl-export-btn type="success" :columns="table.columns" />
			<!-- 新增按钮 -->
			<cl-add-btn />
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
			<cl-flex1 />
			<!-- 关键字搜索 -->
			<cl-search-key />
		</el-row>
		<el-row>
			<!-- 数据表格 -->
			<cl-table :ref="setRefs('table')" v-bind="table">
				<template #slot-other="{ scope }">
					<el-button type="text" size="mini" @click="openOtherForm(scope.row)">
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
		<cl-form :ref="setRefs('form')" />
	</cl-crud>
</template>
<script lang="ts">
import { defineComponent, inject, reactive } from "vue";
import { CrudLoad, Upsert, Table } from "cl-admin-crud-vue3/types";
import { useRefs, useGoTo } from "/@/core";
import * as Dict from "../dict/genCodeConfig";
// import { ElMessage } from "element-plus";
import dayjs from "dayjs";
export default defineComponent({
	setup() {
		const { refs, setRefs } = useRefs();
		const { goTo } = useGoTo();
		// 请求服务
		const service = inject<any>("service");
		const DictRef = reactive<any>(Dict);
		const condition = reactive<any>({
			types: "",
			status: "",
			date: []
		});
		// 新增、编辑配置
		const upsert = reactive<Upsert>({
			items: [
				{
					prop: "dbHost",
					label: "数据库host",
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
					component: {
						name: "el-input",
						props: {
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
					label: "数据库类型，如mysql/pgsql/mssql/sqlite/oracle，默认mysql",
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
					label: "默认的时间字段格式，如createTime",
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
					label: "默认的时间字段格式，如updateTime",
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
					prop: "tableNames",
					label: "表名，用逗号分隔",
					component: {
						name: "el-input",
						props: {
							placeholder: "请输入表名，用逗号分隔",
							rows: 3,
							type: "textarea"
						}
					},
					rules: {
						required: true,
						message: "表名，用逗号分隔标题不能为空"
					}
				},
				{
					prop: "activeCode",
					label: "激活码",
					component: {
						name: "el-input",
						props: {
							placeholder: "请输入激活码"
						}
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
					align: "center"
				},
				{
					prop: "updateTime",
					label: "更新时间",
					align: "center"
				},
				{
					prop: "dbHost",
					label: "数据库host",
					align: "center"
				},
				{
					prop: "dbPort",
					label: "数据库端口",
					align: "center"
				},
				{
					prop: "dbUser",
					label: "数据库用户",
					align: "center"
				},
				{
					prop: "dbPass",
					label: "数据库密码",
					align: "center"
				},
				{
					prop: "dbName",
					label: "数据库名",
					align: "center"
				},
				{
					prop: "dbType",
					label: "数据库类型，如mysql/pgsql/mssql/sqlite/oracle，默认mysql",
					align: "center"
				},
				{
					prop: "adminGenPath",
					label: "生成代码前端目录",
					align: "center"
				},
				{
					prop: "serverGenPath",
					label: "生成代码服务端目录",
					align: "center"
				},
				{
					prop: "defaultCreatedAtLabel",
					label: "默认的时间字段格式，如createTime",
					align: "center"
				},
				{
					prop: "defaultUpdatedAtLabel",
					label: "默认的时间字段格式，如updateTime",
					align: "center"
				},
				{
					prop: "ignoreTablePrefix",
					label: "忽略此前缀的表，逗号分隔",
					align: "center"
				},
				{
					prop: "tableNames",
					label: "表名，用逗号分隔",
					align: "center"
				},
				{
					prop: "activeCode",
					label: "激活码",
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
			ctx.service(service.genCodeConfig).done();
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
		 * 打开其他表单数据，@click="openOtherForm(scope.row)"
		 * data 传入的数据
		 */
		function openOtherForm(row: any) {
			refs.value.form.open({
				items: [
					{
						prop: "name",
						label: "名称",
						value: row.name,
						component: {
							name: "el-input",
							props: {
								disabled: false
							}
						}
					}
				],
				on: {
					submit: (data: any, { close, done }: any) => {
						console.log(data, close, done);
						// 	service.genCodeConfig
						// 		.xxx({
						// 			id: row.id,
						// 			data
						// 		})
						// 		.then(() => {
						// 			ElMessage.success("成功");
						// 			refs.value.crud.refresh();
						// 			close();
						// 		})
						// 		.catch((err: any) => {
						// 			ElMessage.error(err);
						// 			done();
						// 		});
					}
				}
			});
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
			openOtherForm,
			goTo,
			onLoad
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
