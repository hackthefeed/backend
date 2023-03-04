export function sleep(ms: number): Promise<true> {
	return new Promise(r => setTimeout(r, ms, true));
}