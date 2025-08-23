<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { interactivity, OrbitControls } from '@threlte/extras';
	import { Spring } from 'svelte/motion';
	import { SourceClass } from '$lib/classes/SourceClass.svelte';

	interactivity();

	let {
		source,
		vertScale
	}: {
		source: SourceClass;
		vertScale: number;
	} = $props();

	const scale = new Spring(1);

	let rotation = $state(0);
	let rayleighDistance = source.rayleighDistance();

	let cameraPosition: [number, number, number] = [-300, 0, 0];
	let targetPosition: [number, number, number] = [0, 0, 0];
	function resetScene() {
		cameraPosition = [-300, 0, 0];
		targetPosition = [0, 0, 0];
	}
</script>

<T.PerspectiveCamera
	makeDefault
	position={[10, 10, 10]}
	oncreate={(ref) => {
		ref.lookAt(0, 1, 0);
	}}
>
	<OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[0, 10, 10]} castShadow />

<T.Mesh
	rotation.y={rotation}
	position.y={1}
	scale={scale.current}
	onpointerenter={() => {
		scale.target = 1.5;
	}}
	onpointerleave={() => {
		scale.target = 1;
	}}
	castShadow
>
	<T.BoxGeometry args={[source.w0 / 2, source.ior, vertScale / 2]} />
	<T.MeshStandardMaterial color="yellow" />
</T.Mesh>

<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
	<T.CircleGeometry args={[4, 40]} />
	<T.MeshStandardMaterial color="white" />
</T.Mesh>
