<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { GaussClass } from '$lib/classes/GaussClass.svelte';

	let {
		gpin,
		dialogOpen = $bindable<boolean>(),
		activeObject = $bindable<number>()
	}: {
		gpin: GaussClass[];
		dialogOpen: boolean;
		activeObject: number;
	} = $props();

	$effect(() => {
		console.log('dialogOpen:', dialogOpen);
		if (dialogOpen && activeObject > -1) {
			console.log('activeObject:', activeObject, 'value: ', gpin[1].value);
		}
	});

	function saveChanges(e: MouseEvent) {
		gpin[activeObject].value = Number(gpin[activeObject].value);
		dialogOpen = false;
	}
</script>

<!-- <div
	class="
		fixed top-[90px] right-[10px] z-[1000]
		flex w-[250px] flex-col
		rounded-md border border-gray-400
		backdrop-blur-sm 
		{popItOpen ? 'h-[450px]' : 'h-[75px]'}
	"
> -->
<Dialog.Root bind:open={dialogOpen}>
	<!-- <Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Edit Profile</Dialog.Trigger> -->
	{#if dialogOpen && gpin[activeObject].type === 'lens'}
		<Dialog.Content
			class=" fixed top-[300px] right-[500px]
        z-[1000] flex h-auto max-h-[90vh]
        w-[250px] flex-col overflow-auto
        rounded-md border border-gray-400
        backdrop-blur-sm"
		>
			<Dialog.Header>
				<Dialog.Title>Edit Lens EFL</Dialog.Title>
				<Dialog.Description>Change EFL and click save. Or click X to close.</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="efl" class="text-right">EFL</Label>
					<Input id="efl" class="col-span-3" bind:value={gpin[activeObject].value as number} />
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit" onclick={saveChanges}>Save changes</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{/if}
	<!-- <Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Edit Profile</Dialog.Trigger> -->
	{#if dialogOpen && gpin[activeObject].type === 'distance'}
		<Dialog.Content
			class=" fixed top-[300px] right-[500px]
			z-[1000] flex h-auto max-h-[90vh]
			w-[250px] flex-col overflow-auto
			rounded-md border border-gray-400
			backdrop-blur-sm"
		>
			<Dialog.Header>
				<Dialog.Title>Edit Air Gap</Dialog.Title>
				<Dialog.Description>Change Air Gap and click save. Or click X to close.</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="efl" class="text-right">Air Gap</Label>
					<Input id="efl" class="col-span-3" bind:value={gpin[activeObject].value as number} />
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit" onclick={saveChanges}>Save changes</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{/if}
</Dialog.Root>
<!-- </div> -->
