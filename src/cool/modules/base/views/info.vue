<template>
	<div class="page-my-info">
		<div class="title">基本信息</div>

		<el-form size="small" label-width="100px" :model="form" :disabled="saving">
			<el-form-item label="头像">
				<cl-upload v-model="form.headImg" />
			</el-form-item>

			<el-form-item label="昵称">
				<el-input v-model="form.nickName" placeholder="请填写昵称" />
			</el-form-item>

			<el-form-item label="输入当前密码">
				<el-input v-model="form.nowPassword" type="password" />
			</el-form-item>
			<el-form-item label="输入新密码">
				<el-input v-model="form.newPassword" type="password" />
			</el-form-item>
			<el-form-item label="">
				<el-button type="primary" :disabled="saving" @click="save">保存修改</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts">
import { ElMessage } from "element-plus";
import { defineComponent, inject, computed, reactive, ref } from "vue";
import { useStore } from "vuex";

export default defineComponent({
	name: "sys-info",

	cool: {
		route: {
			path: "/my/info",
			meta: {
				label: "个人中心"
			}
		}
	},

	setup() {
		const store = useStore();
		const service = inject<any>("service");
		const form = reactive({
			nickName: "",
			headImg: "",
			nowPassword: "",
			newPassword: ""
		});
		// 表单数据
		const userInfo = computed(() => store.getters.userInfo);

		form.nickName = userInfo.value.nickName;
		form.headImg = userInfo.value.headImg;
		// 保存状态
		const saving = ref<boolean>(false);

		// 保存
		async function save() {
			const { headImg, nickName, nowPassword, newPassword } = form;

			saving.value = true;

			await service.base.common
				.userUpdate({
					headImg,
					nickName,
					nowPassword,
					newPassword
				})
				.then(() => {
					form.nowPassword = "";
					form.newPassword = "";
					ElMessage.success("修改成功");
					store.dispatch("userInfo");
				})
				.catch((err: string) => {
					ElMessage.error(err);
				});

			saving.value = false;
		}

		return {
			form,
			saving,
			save
		};
	}
});
</script>

<style lang="scss">
.page-my-info {
	background-color: #fff;
	height: 100%;
	padding: 20px;
	box-sizing: border-box;

	.el-form {
		width: 400px;
		max-width: 100%;
	}

	.title {
		color: #000;
		margin-bottom: 30px;
		font-size: 15px;
	}
}
</style>
