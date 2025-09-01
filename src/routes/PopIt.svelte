<script lang="ts">
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	let { popItOpen = $bindable<boolean>() } = $props();
	console.log('popItOpen in PopIt', popItOpen);
</script>

<div
	class="
		fixed top-[90px] right-[300px] z-[1000]
		flex w-[250px] flex-col
		rounded-md border border-gray-400
		backdrop-blur-sm
		{popItOpen ? 'h-[450px]' : 'h-[75px]'}
	"
>
	<p class={popItOpen ? 'h-[450px]' : 'h-[75px]'}>PopIt</p>
	<Popover.Root>
		<!-- <Popover.Trigger class={buttonVariants({ variant: 'outline' })}>Open</Popover.Trigger> -->
		<Popover.Content class="w-80">
			<div class="grid gap-4">
				<div class="space-y-2">
					<h4 class="leading-none font-medium">Dimensions</h4>
					<p class="text-sm text-muted-foreground">Set the dimensions.</p>
				</div>
				<div class="grid gap-2">
					<div class="grid grid-cols-3 items-center gap-4">
						<Label for="width">Width</Label>
						<Input id="width" value="100%" class="col-span-2 h-8" />
					</div>
					<div class="grid grid-cols-3 items-center gap-4">
						<Label for="height">Height</Label>
						<Input id="height" value="25px" class="col-span-2 h-8" />
					</div>
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>
</div>
