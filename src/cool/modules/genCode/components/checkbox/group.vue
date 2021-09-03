<template>
	<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange"
		>全选</el-checkbox
	>
	<div style="margin: 15px 0"></div>
	<el-checkbox-group :max="maxNumRef" v-model="checked" @change="handleCheckedCitiesChange">
		<el-checkbox v-for="item in optionList" :label="item.label" :key="item.label"
			>{{ item.value }}:[{{ item.label }}]</el-checkbox
		>
	</el-checkbox-group>
</template>

<script lang="ts">
import { ref, defineComponent, watch, computed } from "vue";
import { useRefs } from "/@/core";

export default defineComponent({
	name: "j-checkbox-group",

	props: {
		modelValue: [Array],
		maxNum: {
			type: [Number],
			default: () => {
				return -1; //-1不限制
			}
		},
		options: {
			type: [Array],
			default: () => {
				return [];
			}
		}
	},

	emits: ["update:modelValue", "change"],

	setup(props, { emit }) {
		const optionList = computed(() => props.options);
		const maxNumRef = ref(100);
		const labelList = optionList.value.map((item: any) => {
			return item.label;
		});
		maxNumRef.value = props.maxNum == -1 ? optionList.value.length : props.maxNum;
		const { refs, setRefs }: any = useRefs();
		let checked = ref([]);
		let checkAll = ref(false);
		let isIndeterminate = ref(true);

		//         isIndeterminate: true

		function setVal(val: any) {
			checked.value = val;
		}

		function confirm(checkedArr: any) {
			emit("update:modelValue", checkedArr);
			emit("change", checkedArr);
			checked.value = checkedArr;
		}
		function handleCheckAllChange(val: any) {
			//@ts-ignore
			checked.value = val ? labelList : [];
			isIndeterminate.value = false;
			confirm(checked.value);
		}
		function handleCheckedCitiesChange(val: any) {
			let checkedCount = val.length;
			checkAll.value = checkedCount === optionList.value.length;
			isIndeterminate.value = checkedCount > 0 && checkedCount < optionList.value.length;
			confirm(val);
		}

		watch(
			() => props.modelValue,
			(val: any) => {
				if (val) {
					setVal(val);
				}
			}
		);
		return {
			refs,
			setRefs,
			checked,
			checkAll,
			maxNumRef,
			confirm,
			handleCheckAllChange,
			handleCheckedCitiesChange,
			optionList,
			isIndeterminate
		};
	}
});
</script>

<style lang="scss" scoped></style>
