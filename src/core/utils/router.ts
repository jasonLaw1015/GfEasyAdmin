import { useRouter } from "vue-router";

export function useGoTo() {
	const router = useRouter();
	const goTo = (path: string, query: any) => {
		router.push({ path, query });
	};
	return { goTo };
}
