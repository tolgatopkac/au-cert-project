<script>
	import { Plus } from '@lucide/svelte';
</script>

<div class="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
	<div>
		<h1 class="mb-2 text-3xl font-bold text-slate-800 lg:text-4xl">My Properties</h1>
		<p class="text-lg text-slate-600">Manage your blockchain real estate portfolio</p>
	</div>

	<div class="mt-4 lg:mt-0">
		<a
			href="/create"
			class="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl"
		>
			<Plus class="h-5 w-5" />
			<span>List New Property</span>
		</a>
	</div>
</div>
