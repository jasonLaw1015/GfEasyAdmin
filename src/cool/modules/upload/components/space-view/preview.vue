<template>
	<div class="cl-upload-space">
		<div class="upload__item">
			<p>{{ text }}</p>
			<cl-upload-space @confirm="confirm" :limit="limitNum" />

			<p style="margin-top: 10px" v-if="urls">选择的文件：</p>
			<div v-if="urls">
				<el-image
					v-for="(item, index) of urls.split(',')"
					:key="index"
					:src="item"
					:preview-src-list="[item]"
					:style="{ width: '130px', marginRight: '10px' }"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, defineComponent, watch, computed } from "vue";
import { useRefs } from "/@/core";

export default defineComponent({
	name: "cl-upload-space-preview",

	props: {
		modelValue: [String],
		text: [String],
		limit: {
			type: [String, Number],
			default: 6
		}
	},

	emits: ["update:modelValue", "change"],

	setup(props, { emit }) {
		const limitNum = computed(() => props.limit);

		const { refs, setRefs }: any = useRefs();
		let urls = ref("");

		function setVal(val: string) {
			urls.value = val;
		}

		function confirm(imgUrls: any) {
			emit("update:modelValue", imgUrls);
			emit("change", imgUrls);
			urls.value = imgUrls;
		}

		watch(
			() => props.modelValue,
			(val: any) => {
				setVal(val);
			}
		);
		return {
			refs,
			setRefs,
			urls,
			confirm,
			limitNum
		};
	}
});
</script>

<style lang="scss" scoped>
.cl-upload-space {
	.upload__item {
		width: 100%;
		margin-bottom: 10px;
		background-color: #fff;
		padding: 10px;

		& > p {
			margin-bottom: 10px;
			font-size: 14px;
		}
	}
}
</style>
