<script lang="ts">
	import { Canvas } from '@threlte/core';
	import MainScene from './Scene/MainScene.svelte';
	import { SourceClass } from '$lib/classes/SourceClass.svelte';
	import SourcePanel from './SourcePanel.svelte';
	import { GaussClass } from '$lib/classes/GaussClass.svelte';
	import Tracer from './Scene/Tracer.svelte';
	import Collapsible from '$lib/components/ui/collapsible/collapsible.svelte';

	// Source Proto:  wl, w0, waistInitialPosition, msq, ior
	let source = $state(new SourceClass(10.6, 20, 0, 1, 1)); // λ, w0, waistInitialPosition, ior, msq
	// console.log('🚀 ~ source:', source.toString());
	let vertScale = $state(1);

	const sf = 1; //scale factor
	let gpin: GaussClass[] = $state([]);
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

<div class="mt-5 ml-15 flex">
	<h1 class="text-3xl font-bold">Laser Tracer</h1>
</div>

{#if canvasOpen}
	<div class="canvas-wrapper mt-5 ml-40">
		<Canvas>
			<Tracer {source} {gpin} {vertScale} />
		</Canvas>
	</div>
{/if}

<SourcePanel bind:source bind:vertScale />

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
