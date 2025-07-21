// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		/* interface Window {
			ethereum: any;
		} */
	}

	/* 	interface Window {
		ethereum?: {
			isMetaMask?: boolean;
			request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
			on: (eventName: string, handler: (...args: unknown[]) => void) => void;
			removeListener: (eventName: string, handler: (...args: unknown[]) => void) => void;
		};
	} */
}

export {};
