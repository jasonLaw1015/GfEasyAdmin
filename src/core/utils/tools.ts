import _ from "lodash";
export function useTools() {
	//手动更新upsert的数据
	/**
	 * @param findTag 通过哪个属性键查找到对应数组的属性
	 * @param tagValue 匹配哪个属性键的等于tagValue.找到对应数组 index
	 * @param keyName 给那个数组的对象增加属性的键名
	 * @param options keyName对应的新值
	 * @returns
	 */
	const setUpsertSelectComponentOption = (
		origin: any,
		findTag: any,
		tagValue: any,
		keyName: any,
		options: any
	) => {
		const index = _.findIndex(origin, function (o: any) {
			return o[findTag] == tagValue;
		});
		origin[index].component[keyName] = options;
		return origin;
	};
	//手动更新 table的数据
	/**
	 * @param findTag 通过哪个属性键查找到对应数组的属性
	 * @param tagValue 匹配哪个属性键的等于tagValue.找到对应数组 index
	 * @param keyName 给那个数组的对象增加属性的键名
	 * @param options keyName对应的新值
	 * @returns
	 */
	const setTableSelectDictOption = (
		origin: any,
		findTag: any,
		tagValue: any,
		keyName: any,
		options: any
	) => {
		const index = _.findIndex(origin, function (o: any) {
			return o[findTag] == tagValue;
		});
		origin[index][keyName] = options;
		return origin;
	};
	// const goTo = (path: string, query: any) => {
	// 	router.push({ path, query });
	// };

	/**
	 *
	 * @param table
	 * @param upsert
	 * @param tagValue 对这个键赋值
	 * @param options 增加对应的新值
	 */
	const setTableUpsertOptions = (table: any, upsert: any, tagValue: any, options: any) => {
		setUpsertSelectComponentOption(upsert.items, "prop", tagValue, "options", options);
		setTableSelectDictOption(table.columns, "prop", tagValue, "dict", options);
	};

	return { setUpsertSelectComponentOption, setTableSelectDictOption, setTableUpsertOptions };
}
