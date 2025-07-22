<script lang="ts">
	import { Home, Plus } from "@lucide/svelte";
	import { myPropertiesPageState } from "./MyPropertiesState.svelte";

</script>
    <div class="rounded-2xl bg-white p-8 text-center shadow-lg">
    <Home class="mx-auto mb-4 h-16 w-16 text-slate-300" />
    <h3 class="mb-2 text-xl font-bold text-slate-800">
        {myPropertiesPageState.activeTab === 'all'
            ? 'No Properties Yet'
            : `No ${myPropertiesPageState.activeTab} Properties`}
    </h3>
    <p class="mb-6 text-slate-600">
        {myPropertiesPageState.activeTab === 'all'
            ? "You haven't listed any properties yet. Create your first listing to get started!"
            : `You don't have any ${myPropertiesPageState.activeTab} properties at the moment.`}
    </p>
    {#if myPropertiesPageState.activeTab === 'all'}
        <a
            href="/create"
            class="inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-6 py-3 text-white transition-colors hover:bg-emerald-700"
        >
            <Plus class="h-5 w-5" />
            <span>List Your First Property</span>
        </a>
    {/if}
</div> 