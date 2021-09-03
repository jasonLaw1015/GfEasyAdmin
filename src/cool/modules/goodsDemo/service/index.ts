//批量导入同目录的service
const files = import.meta.globEager("./*.ts");
const modules: any = {};
for (const i in files) {
	if (!i.includes("index.ts")) {
		const value = files[i].default;
		const key = i.replace(".ts", "").replace("./", "");
		modules[key] = new value();
	}
}

export default modules;
