<script lang="ts">
	import { AlertCircle } from "@lucide/svelte";
	import { myPropertiesPageState } from "./MyPropertiesState.svelte";

</script>
<div class="rounded-2xl bg-white p-8 text-center shadow-lg">
    <AlertCircle class="mx-auto mb-4 h-16 w-16 text-red-500" />
    <h3 class="mb-2 text-xl font-bold text-slate-800">Error Loading Properties</h3>
    <p class="mb-6 text-slate-600">{myPropertiesPageState.error}</p>
    <button
        class="rounded-lg bg-emerald-600 px-6 py-3 text-white transition-colors hover:bg-emerald-700"
    >
        Try Again
    </button>
</div>