<script lang="ts">
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { SourceClass } from '$lib/classes/SourceClass.svelte';

	let { source = $bindable<SourceClass>(), vertScale = $bindable<number>() } = $props();
	let srcOpen = $state(false); // or initialize from source if needed, e.g. source.srcOpen ?? false
</script>

<Collapsible.Root
	bind:open={srcOpen}
	class="
		fixed top-[90px] left-[10px] z-[1000]
		flex w-[250px] flex-col
		rounded-md border border-gray-400
		bg-white/70 p-2
		backdrop-blur-sm
		{srcOpen ? 'h-[450px]' : 'h-[75px]'}
	"
>
	<div class="flex items-center justify-between space-x-4 px-4">
		<h4 class="mt-2 mb-5 text-center font-bold">System Setup</h4>
		<Collapsible.Trigger class={buttonVariants({ variant: 'ghost', size: 'sm', class: 'w-9 p-0' })}>
			<ChevronsUpDownIcon />
			<span class="sr-only">Toggle</span>
		</Collapsible.Trigger>
	</div>
	<Collapsible.Content class="space-y-2">
		<hr />
		<div class="input-row mt-5 flex flex-row justify-between">
			<Label for="size-input">Wavelength</Label>
			<Input type="WL (μm)" placeholder="WL" bind:value={source.wavelength} class="w-16" />
		</div>

		<div class="input-row mt-5 flex flex-row justify-between">
			<Label for="size-input">Waist (W0)</Label>
			<Input type="W0 (mm)" placeholder="W0" bind:value={source.w0} class="w-16" />
		</div>

		<div class="input-row mt-5 flex flex-row justify-between">
			<Label for="size-input">W0 Starting Distance</Label>
			<Input
				type="W0 Start (mm)"
				placeholder="W0 Start"
				bind:value={source.waistposition}
				class="w-16"
			/>
		</div>

		<div class="input-row mt-5 flex flex-row justify-between">
			<Label for="size-input">M²</Label>
			<Input type="M²" placeholder="M²" bind:value={source.msq} class="w-16" />
		</div>

		<div class="input-row mt-5 flex flex-row justify-between">
			<Label for="size-input">Index of Refraction</Label>
			<Input type="ior" placeholder="ior" bind:value={source.ior} class="w-16" />
		</div>
		<div>
			<p class="slider-row mt-5 mb-3 flex">Vertical Scale: {vertScale}</p>
			<Slider
				type="single"
				bind:value={vertScale}
				min={0.1}
				max={10}
				step={0.1}
				class="max-w-[90%]"
			/>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
