<script lang="ts">
	import { Canvas } from '@threlte/core';
	import MainScene from './Scene/MainScene.svelte';
	import { SourceClass } from '$lib/classes/SourceClass.svelte';
	import SourcePanel from './SourcePanel.svelte';
	import PopIt from './PopIt.svelte';
	import GenericDialog from './Dialogs/GenericDialog.svelte';
	import { GaussClass } from '$lib/classes/GaussClass.svelte';
	import Tracer from './Scene/Tracer.svelte';
	import Collapsible from '$lib/components/ui/collapsible/collapsible.svelte';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	import { toggleMode } from 'mode-watcher';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { ClampToEdgeWrapping } from 'three';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import HelpDialog from './Dialogs/HelpDialog.svelte';

	// Source Proto:  wl, w0, waistInitialPosition, msq, ior
	let source = $state(new SourceClass(10.6, 20, 0, 1, 1)); // λ, w0, waistInitialPosition, ior, msq
	// console.log('🚀 ~ source:', source.toString());
	let vertScale = $state(1);
	let popItOpen = $state(false);
	let dialogOpen = $state(false);
	let activeObject = $state(-1);
	let openHelpDialog = $state(false);
	const sf = 1; //scale factor

	let gpin: GaussClass[] = [];
	gpin.push(new GaussClass('distance', 100 / sf)); // index 0
	gpin.push(new GaussClass('lens', 100 / sf, 1, 'green')); // index 1
	//
	gpin.push(new GaussClass('distance', 100 / sf)); // index 2
	gpin.push(new GaussClass('distance', 100 / sf)); // index 3
	// OR
	//gp.push(new GaussOp('distance', 300 / sf));
	//
	gpin.push(new GaussClass('lens', 100 / sf, 1, 'yellow')); // index 4
	gpin.push(new GaussClass('distance', 100 / sf)); // index 5
	gpin.push(new GaussClass('lens', 100 / sf, 1, 'red'));
	gpin.push(new GaussClass('distance', 100 / sf)); // index 7

	let canvasOpen = true;
</script>

<div class="mt-5 flex flex-row items-center justify-between">
	<div class="ml-40">
		<h1 class="text-3xl font-bold">Laser Tracer</h1>
	</div>
	<div class="mr-40">
		<Button onclick={toggleMode} variant="outline" size="icon">
			<SunIcon
				class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
			/>
			<MoonIcon
				class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>
</div>

<GenericDialog {gpin} bind:dialogOpen bind:activeObject />
<HelpDialog bind:openHelpDialog />

{#if canvasOpen}
	<div class="canvas-wrapper mt-5 ml-40">
		<Canvas>
			<Tracer
				{source}
				{gpin}
				{vertScale}
				bind:popItOpen
				bind:dialogOpen
				bind:activeObject
				bind:openHelpDialog
			/>
		</Canvas>
	</div>
{/if}

<SourcePanel bind:source bind:vertScale />

<!-- <PopIt bind:popItOpen /> -->

<style>
	.canvas-wrapper {
		border: 2px solid #444;
		border-radius: 12px;
		box-shadow: 0 4px 8px rgba(173, 78, 78, 0.1);
		overflow: hidden;
		width: 1200px;
		height: 800px;
	}

	/* You can also style the canvas globally */
	:global(canvas) {
		border: 1px dashed #999;
	}
</style>
