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
			<!-- 查询条件 -->
			<span class="span-label">状态:</span>
			<cl-query field="status" :list="DictRef.GoodsInfoStatusDict" />
			<cl-filter label="类型:">
				<el-select size="mini" v-model="condition.types" @change="typesChange">
					<el-option value="" label="全部" />
					<el-option
						v-for="(item, k) in DictRef.GoodsInfoTypesDict"
						:key="k"
						:value="item.value"
						:label="item.label"
					/>
				</el-select>
			</cl-filter>

			<cl-flex1 />

			<!-- 关键字搜索 -->
			<cl-search-key />
		</el-row>
		<el-row>
			<!-- 数据表格 -->
			<cl-table :ref="setRefs('table')" v-bind="table">
				<template #column-pic="{ scope }">
					<div v-for="(item, k) in scope.row.pic.split(',')" :key="k">
						<el-image
							style="width: 130px; height: 130px"
							:src="item"
							:preview-src-list="[item]"
						/>
					</div>
				</template>
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
import * as Dict from "../dict/goodsInfo";
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
					prop: "title",
					label: "标题",
					component: {
						name: "el-input",
						props: {
							placeholder: "请输入标题",
							autofocus: true
						}
					},
					rules: {
						required: true,
						message: "标题不能为空"
					}
				},
				{
					prop: "subTitle",
					label: "副标题",
					component: {
						name: "el-input",
						props: {
							placeholder: "请输入副标题",
							autofocus: true
						}
					},
					rules: {
						required: true,
						message: "副标题不能为空"
					}
				},

				{
					prop: "pic",
					label: "图片",
					component: {
						name: "cl-upload-space-preview",
						props: {
							text: "选择图片",
							limit: 6
						}
					}
				},
				{
					label: "状态",
					prop: "status",
					value: "1",
					component: {
						name: "el-radio-group",
						options: Dict.GoodsInfoStatusDict
					}
				},
				{
					label: "类型",
					prop: "types",
					value: "1",
					component: {
						name: "el-radio-group",
						options: Dict.GoodsInfoTypesDict
					}
				},
				{
					prop: "sort",
					label: "排序",
					value: 0,
					component: {
						name: "el-input-number"
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
					prop: "title",
					label: "标题",
					align: "left"
				},
				{
					prop: "subTitle",
					label: "副标题",
					align: "left"
				},
				{
					prop: "pic",
					label: "图片",
					width: 200
				},

				{
					prop: "status",
					label: "状态",
					align: "center",
					dict: Dict.GoodsInfoStatusDict
				},
				{
					prop: "types",
					label: "类型",
					align: "center",
					dict: Dict.GoodsInfoTypesDict
				},
				{
					prop: "sort",
					label: "排序",
					align: "center",
					sortable: "custom",
					width: 80
				},
				{
					prop: "createTime",
					label: "创建时间",
					align: "center",
					width: 135
				},
				{
					prop: "updateTime",
					label: "更新时间",
					align: "center",
					width: 135
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
			ctx.service(service.goodsInfo).done();
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
						// 	service.goodsInfo
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
