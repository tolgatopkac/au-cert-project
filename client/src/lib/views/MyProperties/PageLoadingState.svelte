<div class="space-y-6">
	<!-- Stats Loading -->
	<div class="grid grid-cols-2 gap-6 lg:grid-cols-4">
		{#each Array(4) as _}
			<div class="animate-pulse rounded-2xl bg-white p-6 shadow-lg">
				<div class="mb-4 h-12 w-12 rounded-xl bg-slate-200"></div>
				<div class="mb-2 h-8 rounded bg-slate-200"></div>
				<div class="h-4 w-20 rounded bg-slate-200"></div>
			</div>
		{/each}
	</div>

	<!-- Properties Loading -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each Array(6) as _}
			<div class="animate-pulse overflow-hidden rounded-2xl bg-white shadow-lg">
				<div class="h-48 bg-slate-200"></div>
				<div class="p-6">
					<div class="mb-4 h-4 rounded bg-slate-200"></div>
					<div class="mb-2 h-4 w-3/4 rounded bg-slate-200"></div>
					<div class="h-4 w-1/2 rounded bg-slate-200"></div>
				</div>
			</div>
		{/each}
	</div>
</div>
