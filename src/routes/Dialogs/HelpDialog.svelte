<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	let {
		openHelpDialog = $bindable<boolean>()
	}: {
		openHelpDialog: boolean;
	} = $props();

	$effect(() => {
		console.log('openHelpDialog:', openHelpDialog);
	});
	function exitHelpDialog(e: MouseEvent) {
		openHelpDialog = false;
	}
</script>

<Dialog.Root bind:open={openHelpDialog}>
	<Dialog.Content
		class=" fixed right-[500px]
        z-[1000] flex h-auto
        w-max flex-col overflow-y-auto
        rounded-md border border-gray-400
        backdrop-blur-sm"
	>
		<Dialog.Header>
			<Dialog.Title>Help Mouse & Key Actions</Dialog.Title>
			<Dialog.Description></Dialog.Description>
		</Dialog.Header>
		<article>All "Clicks" refer to left mouse button click</article>
		<div class="grid gap-4 py-4">
			<div
				class="border-surface-500 rounded-container-token grid grid-cols-3 gap-x-5 gap-y-2 border p-4"
			>
				<div class="col-span-2">Change distance or efl.</div>
				<div><i>Click Lens/Line</i></div>

				<!-- <div class="col-span-2">Change lens position by dragging lens with mouse</div>
				<div><i>Double Click Lens</i></div> -->

				<!-- <div class="col-span-2">Change distance or efl using mouse wheel</div>
				<div><i>Click Lens/Line</i></div> -->

				<div class="col-span-2">Modify Lens Props</div>
				<div><i>Ctrl Click Lens</i></div>

				<div class="col-span-2">Modify Line Props</div>
				<div><i>Ctrl Click Line</i></div>

				<div class="col-span-2">Delete Lens</div>
				<div><i>Alt Click Lens</i></div>

				<div class="col-span-2">Add lens at cursor location</div>
				<div><i>Alt Click Line</i></div>

				<div class="col-span-2">Display lens efl or distance settings</div>
				<div><i>Hover Over Lens/Dist</i></div>

				<div class="col-span-2">Look for and remove adjacent distances</div>
				<div><i>Ctrl C or c</i></div>

				<div class="col-span-2">Append a lens element to end of system</div>
				<div><i>Ctrl L or l</i></div>

				<div class="col-span-2">Append a distance element to end of system</div>
				<div><i>Ctrl D or d</i></div>

				<div class="col-span-2">Remove last lens or distance from system</div>
				<div><i>Ctrl Z or z</i></div>

				<div class="col-span-2">Reset to single distance element</div>
				<div><i>Ctrl Alt R or r</i></div>

				<div class="col-span-2">Reset view</div>
				<div><i>Ctrl O or o</i></div>
			</div>
		</div>
		<!-- <Dialog.Footer>
			<Button type="submit" onclick={exitHelpDialog}>Save changes</Button>
		</Dialog.Footer> -->
	</Dialog.Content>
</Dialog.Root>
