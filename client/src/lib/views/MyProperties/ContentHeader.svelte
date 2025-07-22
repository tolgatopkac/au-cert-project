<script lang="ts">
	import { Grid3X3, List } from "@lucide/svelte";
	import { myPropertiesPageState } from "./MyPropertiesState.svelte";

</script>
<div class="mb-6 rounded-2xl bg-white p-6 shadow-lg">
    <div
        class="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0"
    >
        <div class="flex space-x-1 rounded-lg bg-slate-100 p-1">
            <button
                onclick={() => (myPropertiesPageState.activeTab = 'all')}
                class="rounded-md px-4 py-2 text-sm font-medium transition-all {myPropertiesPageState.activeTab ===
                'all'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'}"
            >
                All Properties
            </button>
            <button
                onclick={() => (myPropertiesPageState.activeTab = 'active')}
                class="rounded-md px-4 py-2 text-sm font-medium transition-all {myPropertiesPageState.activeTab ===
                'active'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'}"
            >
                Active Listings
            </button>
            <button
                onclick={() => (myPropertiesPageState.activeTab = 'recent')}
                class="rounded-md px-4 py-2 text-sm font-medium transition-all {myPropertiesPageState.activeTab ===
                'recent'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'}"
            >
                Recently Added
            </button>
            <button
                onclick={() => (myPropertiesPageState.activeTab = 'reviewed')}
                class="rounded-md px-4 py-2 text-sm font-medium transition-all {myPropertiesPageState.activeTab ===
                'reviewed'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'}"
            >
                Reviewed
            </button>
        </div>

        <div class="flex space-x-2">
            <button
                onclick={() => (myPropertiesPageState.viewMode = 'grid')}
                class="rounded-lg p-2 {myPropertiesPageState.viewMode === 'grid'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'text-slate-400 hover:text-slate-600'} transition-colors"
            >
                <Grid3X3 class="h-5 w-5" />
            </button>
            <button
                onclick={() => (myPropertiesPageState.viewMode = 'list')}
                class="rounded-lg p-2 {myPropertiesPageState.viewMode === 'list'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'text-slate-400 hover:text-slate-600'} transition-colors"
            >
                <List class="h-5 w-5" />
            </button>
        </div>
    </div>
</div>