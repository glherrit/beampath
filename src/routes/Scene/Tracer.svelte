<script lang="ts">
	import { Text, OrbitControls } from '@threlte/extras';
	import { interactivity } from '@threlte/extras';
	import { T, useThrelte } from '@threlte/core';
	import {
		AmbientLight,
		BufferGeometry,
		DoubleSide,
		LineDashedMaterial,
		Object3D,
		Vector3
	} from 'three';

	import { Line2 } from 'three/addons/lines/Line2.js';
	import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
	import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
	// import TracerLC from '$components/threlte/gausstracer/TracerLC.svelte';

	import {
		calcZend,
		findMinWaists,
		findWaistSizes,
		gaussProfile,
		gaussVectorProfile,
		generateLensData,
		genLineSegArray,
		genTypeMap
	} from '$lib/gtrace';

	import {
		genLineSegment,
		setAxisLimits,
		toGrid,
		genGridLines2,
		toWorld
	} from '$lib/math/mathUtils';
	import { SourceClass } from '$lib/classes/SourceClass.svelte';
	import { GaussClass } from '$lib/classes/GaussClass.svelte';
	import { combineAdjacentDistances, addLens } from '$lib/classes/GaussClass.svelte';
	import { getMeshIndex, getExtraKeyInfo, centerLine } from '$lib/meshUtils';
	// import { modalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
	// import HelpModal from '$components/threlte/gausstracer/HelpModal.svelte';
	// import ModifyOpModal from '$components/threlte/gausstracer/ModifyOpModal.svelte';
	// import GaussGraphModal from '$components/threlte/gausstracer/GaussGraphModal.svelte';

	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	// let {
	// 	source = $bindable<SourceClass>(),
	// 	gpin = $bindable<GaussClass[]>(),
	// 	vertScale = $bindable<number>()
	// } = $props();

	let {
		source,
		gpin,
		vertScale,
		popItOpen = $bindable<boolean>(),
		dialogOpen = $bindable<boolean>(),
		activeObject = $bindable<number>(),
		openHelpDialog = $bindable<boolean>()
	}: {
		source: SourceClass;
		gpin: GaussClass[];
		vertScale: number;
		popItOpen: boolean;
		dialogOpen: boolean;
		activeObject: number;
		openHelpDialog: boolean;
	} = $props();

	interactivity();
	// let { source = <SourceClass>(), vertScale = $bindable<number>() } = $props();

	console.log('🚀 ~ vertScale:', vertScale);
	// console.log('🚀 ~ source:', source.toString());

	let cameraPosition: [number, number, number] = [-300, 0, 0];
	let targetPosition: [number, number, number] = [0, 0, 0];

	// let { data = $bindable<DoubletClass>(), extraParam = $bindable<number>() } =
	// $props();

	const titletext = 'Gaussian Beam Tracer';
	const showwaists = true;
	const showSegLines = true;
	const offsetbackground = 2;

	// **************************************
	// set canvas parameters and initial grid values
	const gridWidth = 250; // total grid width = 2 * gridWidth
	const horizDivs = 5;
	const gridHeight = 75; // total grid height = 2 * gridHeight
	const vertDivs = 5;

	// **************************************
	// calculate z or optical axis parameters
	const zstart = 0; // assume model begins at z = 0
	let zend = calcZend(gpin); // find end of model
	const zinc = 1; // plot beam path every 1 mm
	let scaleZ = (2 * gridWidth) / (zend - zstart); // scale about -gridWith
	let zScale = [
		[zstart, calcZend(gpin)],
		[-gridWidth, gridWidth]
	]; // zScale is used to convert z to grid coordinates

	const zLabels: number[] = []; // setup z axis labels scheme
	for (let i = 0; i <= 2 * gridWidth; i += (2 * gridWidth) / vertDivs) {
		zLabels.push(i);
	}

	// **************************************
	// calculate y axis parameters (waist size)
	let maxY = 5; // manually set max y for now, it will be updated later
	let scaleY = (gridHeight * vertScale) / maxY; // scale about center of plot 0 in Y axis
	maxY = calcZend(gpin) * 0.5;
	scaleY = gridHeight / maxY;

	upDateCanvas(gpin);

	const yLabels: number[] = [];
	for (let i = -gridHeight; i <= gridHeight; i += gridHeight / horizDivs) {
		yLabels.push(i);
	}

	let lineWidth = 0.005;
	let lineColor = $state(0x0000ff);

	let gpDistIndex = -1; // if user presses number key change the gp index
	let gpLensIndex = -1;
	let gpDragIndex = -1;
	let backupcolor = 'white';

	// *****************************************************************

	function onclickLine(e: MouseEvent) {
		const index = getMeshIndex(e, 'Line');
		const isCtrlKeyPressed = getExtraKeyInfo(e, 'ctrlKey');
		const isAltKeyPressed = getExtraKeyInfo(e, 'altKey');
		const isValidIndex = index > -1 && index < gpin.length;

		// Standard Click Used for Altering Line Length (Value)
		if (isValidIndex && !isAltKeyPressed && !isCtrlKeyPressed) {
			dialogOpen = true;
			activeObject = index;
			return;
		}

		let newIndex = getMeshIndex(e, 'Line');
		// check for activated lens and deactivate
		if (gpLensIndex > -1) {
			gpin[gpLensIndex].color = backupcolor;
			gpLensIndex = -1;
		}

		// CtrlClick Line - use modal to change line properties
		if (isCtrlKeyPressed && newIndex > -1) {
			// changeOpModal(e, 'Line', 'Distance');
			return;
		}

		// AltClick Line - add lens at current pointer loc
		if (isAltKeyPressed && newIndex > -1) {
			console.log('AltClick Line');
			if (gpLensIndex > -1) {
				gpin[gpLensIndex].color = backupcolor;
				gpLensIndex = -1;
			}
			const keys = Object.keys(e);
			if (keys.includes('pointOnLine')) {
				const point = e['pointOnLine' as keyof MouseEvent] as unknown as Vector3;
				const trackz = toWorld(point.z, zScale);
				addLens(gpin, trackz);
				upDateCanvas(gpin);
			}
			return;
		}

		// Click Line - activate line for user mod if keyboard
		if (newIndex > -1) {
			if (newIndex === gpDistIndex) {
				gpDistIndex = -1;
				//gpin[newIndex].tag = false;
				lineColor = 0x0000ff;
			} else {
				//console.log(newIndex);
				//gpin[newIndex].tag = true;
				gpDistIndex = newIndex;
				lineColor = 0xff0000;
			}
		}
	}

	function onLineEnter(e: MouseEvent) {
		const index = getMeshIndex(e, 'Line');
		gpin[index].tag = true;
		lineWidth = 0.01;
	}

	function onLineLeave(e: MouseEvent) {
		const index = getMeshIndex(e, 'Line');
		gpin[index].tag = false;
		lineWidth = 0.005;
	}

	// *****************************************************************

	function onClickLens(e: MouseEvent) {
		const index = getMeshIndex(e, 'Lens');
		const isCtrlKeyPressed = getExtraKeyInfo(e, 'ctrlKey');
		const isAltKeyPressed = getExtraKeyInfo(e, 'altKey');
		const isValidIndex = index > -1 && index < gpin.length;

		if (isValidIndex && !isAltKeyPressed && !isCtrlKeyPressed) {
			dialogOpen = true;
			activeObject = index;
			return;
		}

		// here for activating lens for keyboard changes
		if (index > -1 && !isAltKeyPressed && !isCtrlKeyPressed) {
			lineColor = 0x0000ff;
			// this happens if another lens is clicked
			// when one is already active
			if (index > 0 && gpLensIndex > 0) {
				gpin[gpLensIndex].color = backupcolor;
			}
			// now swap colors for activated lens or
			// deactivate lens and reset colors
			if (index === gpLensIndex) {
				gpin[index].color = backupcolor;
				gpLensIndex = -1;
				gpDistIndex = -1;
			} else {
				gpLensIndex = index;
				gpDistIndex = -1;
				backupcolor = gpin[index].color;
				gpin[index].color = 'white';
			}
		}
		// here for deleting lens - Crtl Click Lens
		if (index > -1 && !isAltKeyPressed && isCtrlKeyPressed) {
			// changeOpModal(e, 'Lens', 'EFL');

			upDateCanvas(gpin);
		}

		// here for deleting lens - Alt Click Lens
		if (index > -1 && isAltKeyPressed && !isCtrlKeyPressed) {
			// deleteLens(gpin, index);
			// combineAdjacentDistances(gpin);
			console.log('🟢🟢🟢🟢🟢🟢🟢🟢');
			console.log('Alt Click Lens - usual this deletes the lens');
			console.log('index:', index);
			console.log('gpin[index]:', gpin[index].toString());
			upDateCanvas(gpin);
		}
	}

	function onLensEnter(e: MouseEvent) {
		// console.log('lensmap:', lensMap);
		const index = getMeshIndex(e, 'Lens');
		gpin[index].tag = true;
	}

	function onLensLeave(e: MouseEvent) {
		const index = getMeshIndex(e, 'Lens');
		gpin[index].tag = false;
		//console.log('line enter', index, lensMap[index]);
	}

	// *****************************************************************

	/*
	// function onKeyDown(e: KeyboardEvent) {
	// 	if ($modalStore[0]) return;
	// 	console.log('ekey=', e.key);
	// 	e.preventDefault();

	// 	// escape key to reset activated elements
	// 	if (e.key === 'Escape') {
	// 		if (gpDragIndex > -1) {
	// 			gpin[gpDragIndex].color = backupcolor;
	// 			gpDragIndex = -1;
	// 		}
	// 	}

	// 	// recombine adjacent distance ops
	// 	if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
	// 		combineAdjacentDistances(gpin);
	// 		upDateCanvas();
	// 		const modal: ModalSettings = {
	// 			type: 'alert',
	// 			title: 'Recombination Complete',
	// 			body: 'Eliminated adjacent distances if needed.',
	// 			buttonTextCancel: 'Finished'
	// 		};
	// 		modalStore.trigger(modal);
	// 	}

	// 	// Add lens op to end of system
	// 	if (e.ctrlKey && (e.key === 'L' || e.key === 'l')) {
	// 		gpin.push(new GaussOp('lens', 100, 1, 'orangered', false));
	// 		console.log('add lens');
	// 		upDateCanvas();
	// 	}

	// 	// Add distance op to end of system
	// 	if (e.ctrlKey && (e.key === 'D' || e.key === 'd')) {
	// 		gpin.push(new GaussOp('distance', 100, 1, 'blue', false));
	// 		upDateCanvas();
	// 	}

	// 	// here if user has selected a distance - incrementally changes distance
	// 	if (gpDistIndex >= 0 && gpDistIndex < gpin.length) {
	// 		switch (e.key) {
	// 			case 'a':
	// 			case 'ArrowLeft':
	// 				gpin[gpDistIndex].value -= 5;
	// 				upDateCanvas();
	// 				break;

	// 			case 'd':
	// 			case 'ArrowRight':
	// 				gpin[gpDistIndex].value += 5;
	// 				upDateCanvas();
	// 				break;

	// 			default:
	// 				break;
	// 		}
	// 	}
	// 	// here if user selected lens - incrementally changes efl
	// 	if (gpLensIndex >= 0 && gpLensIndex < gpin.length) {
	// 		switch (e.key) {
	// 			case 'a':
	// 			case 'ArrowLeft':
	// 				gpin[gpLensIndex].value -= 5;
	// 				upDateCanvas();
	// 				break;

	// 			case 'd':
	// 			case 'ArrowRight':
	// 				gpin[gpLensIndex].value += 5;
	// 				upDateCanvas();
	// 				break;

	// 			default:
	// 				break;
	// 		}
	// 	}

	// 	const PI = Math.PI;
	// 	// return to z-right, y-up orientation
	// 	if (e.ctrlKey && (e.key === 'o' || e.key === 'O')) {
	// 		resetControls();
	// 	}

	// 	// remove last element in gp op array
	// 	if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
	// 		const modal: ModalSettings = {
	// 			type: 'confirm',
	// 			title: 'Please Confirm - Remove Last Op?',
	// 			body: 'Are you sure you want to remove last lens or distance?',
	// 			response: (r: boolean) => {
	// 				if (r) {
	// 					gpin = gpin.slice(0, -1);
	// 					upDateCanvas();
	// 				}
	// 			}
	// 		};
	// 		modalStore.trigger(modal);
	// 	}

	// 	// here for resetting system
	// 	if (e.ctrlKey && e.altKey && (e.key === 'r' || e.key === 'R')) {
	// 		const modal: ModalSettings = {
	// 			type: 'confirm',
	// 			title: 'Please Confirm - Reset System?',
	// 			body: 'Are you sure you wish to reset system?',
	// 			response: (r: boolean) => {
	// 				if (r) {
	// 					gpin = [];
	// 					gpin.push(new GaussOp('distance', 100, 1, 'blue', false));
	// 					upDateCanvas();
	// 				}
	// 			}
	// 		};
	// 		modalStore.trigger(modal);
	// 	}
	// }

	// *****************************************************************

	// function deleteLens(gops: GaussOp[], index: number): void {
	// 	const modal: ModalSettings = {
	// 		type: 'confirm',
	// 		// Data
	// 		title: 'Please Confirm - Delete Lens?',
	// 		body: 'Are you sure you wish to delete lens?',
	// 		// TRUE if confirm pressed, FALSE if cancel pressed
	// 		response: (r: boolean) => {
	// 			console.log('response:', r);
	// 			if (r) {
	// 				gops.splice(index, 1);
	// 				gpLensIndex = -1;
	// 				gpDistIndex = -1;
	// 			}
	// 		}
	// 	};
	// 	modalStore.trigger(modal);
	// }



	// function showGaussGraph() {
	// 	const c: ModalComponent = { ref: GaussGraphModal };
	// 	const modal: ModalSettings = {
	// 		type: 'component',
	// 		component: c,
	// 		title: 'Gauss Graphical Analysis',
	// 		body: 'Beam Radius & Power Density at Image Plane',
	// 		value: ['waistLabel', waistSizes[waistSizes.length - 1]],
	// 		response: (r: any) => {
	// 			console.log('gauss graph exited');
	// 		}
	// 	};
	// 	modalStore.trigger(modal);
	// }

	// function changeOpModal(e: MouseEvent, type: string, valueName: string) {
	// 	const index = getMeshIndex(e, type);
	// 	const c: ModalComponent = { ref: ModifyOpModal };
	// 	const modal: ModalSettings = {
	// 		type: 'component',
	// 		component: c,
	// 		title: 'Modify ' + type + ' Properties',
	// 		body: 'Modify ' + type + ' then either accept or cancel.',
	// 		value: [
	// 			'gopefl',
	// 			gpin[index].value.toString(),
	// 			'gopcolor',
	// 			gpin[index].color,
	// 			'valueName',
	// 			valueName
	// 		],
	// 		response: (r: any) => {
	// 			if (r) {
	// 				//console.log('response', r, typeof r);
	// 				gpin[index].value = parseFloat(r.value);
	// 				gpin[index].color = r.color;
	// 			} else {
	// 				//console.log('cancel response');
	// 			}
	// 		}
	// 	};
	// 	modalStore.trigger(modal);
	// }
*/

	// *****************************************************************
	let isUpdated = $derived(upDateCanvas(gpin));
	// update canvas scaling factors and other parameters
	function upDateCanvas(gp: GaussClass[]): boolean {
		zend = calcZend(gp);
		scaleZ = (2 * gridWidth) / (zend - zstart);
		zScale = zScale = [
			[zstart, calcZend(gp)],
			[-gridWidth, gridWidth]
		];
		const tempY = Math.max(...findWaistSizes(gp, source));
		const yLimit = setAxisLimits(0, tempY)[1];
		//console.log(tempY, yLimit);
		maxY = yLimit;
		scaleY = gridHeight / maxY;
		maxY = zend * 0.5;
		scaleY = gridWidth / maxY;
		return true;
	}

	let [psegs, zsegs, nsegs] = $derived(genLineSegArray(gpin, source, vertScale, zScale, zinc));

	let distanceMap = genTypeMap(gpin, 'distance');
	let lensMap = genTypeMap(gpin, 'lens');
	let lineMap = genTypeMap(gpin, 'distance');

	// find min waists for labeling
	let wps = findMinWaists(gpin, source, scaleY, zScale);

	let waistSizes = findWaistSizes(gpin, source);

	// generate grid lines
	let gridLines = genGridLines2(0, gridWidth, horizDivs, gridHeight, vertDivs);

	// location of waist on grid in gridunits
	let zWaistGridUnits = toGrid(0, zScale);

	// generate lens for plot
	let [radius, lensPosi, gop, lensIndex, eflLabelPosi, geos] = $derived(
		generateLensData(gpin, source, scaleZ, scaleY, zScale)
	);

	let bgcolor = true;
	// $: bgPlaneColor = $modeCurrent ? 'white' : 'black';
	// $: gridLineColor = $modeCurrent ? 0x000000 : 0xffffff;
	// $: gridTextColor = $modeCurrent ? 0x000000 : 0xffffff;
	let bgPlaneColor = bgcolor ? 'white' : 'black';
	let gridLineColor = bgcolor ? 0x000000 : 0xffffff;
	let gridTextColor = bgcolor ? 0x000000 : 0xffffff;

	let dragInitialPosition = 0;
	let dragcolor = 'lightblue';
	function onDblClickLens(e: MouseEvent) {
		const isCtrlKeyPressed = getExtraKeyInfo(e, 'ctrlKey');
		const isAltKeyPressed = getExtraKeyInfo(e, 'altKey');
		if (gpDragIndex < 0 && getMeshIndex(e, 'Lens') > 0) {
			console.log('first double click on lens');
			gpDragIndex = getMeshIndex(e, 'Lens');
			dragcolor = gpin[gpDragIndex].color;
			gpin[gpDragIndex].color = 'lightblue';
			upDateCanvas(gpin);
			dragInitialPosition = 0;
			for (let i = 0; i < gpDragIndex - 1; i++) {
				if (gpin[i].type === 'distance') {
					dragInitialPosition += gpin[i].value;
				}
			}
			//.log(gpDragIndex, dragcolor);
		} else {
			console.log('second double click on lens', dragcolor);
			gpin[gpDragIndex].color = dragcolor;
			gpDragIndex = -1;
			dragInitialPosition = 0;
			upDateCanvas(gpin);
		}
	}

	function canvasMove(e: WheelEvent) {
		if (gpDragIndex < 0) return; // quick exit if user is zooming
		const point = e['point' as keyof MouseEvent] as unknown as Vector3;
		const zloc = toWorld(point.z, zScale);
		if (gpDragIndex >= 0 && gpDragIndex < gpin.length) {
			const moveto = zloc - dragInitialPosition;
			gpin[gpDragIndex - 1].value = moveto >= 0 ? moveto : 0;
			upDateCanvas(gpin);
		}
	}

	function canvasWheel(e: WheelEvent) {
		const objInfo = e['nativeEvent' as keyof MouseEvent] as unknown as Object3D;
		const delta = objInfo['deltaY' as keyof Object] as unknown as number;
		if (gpLensIndex < 0 && gpDistIndex < 0) return; // quick exit if user is zooming
		if (gpLensIndex >= 0 && gpLensIndex < gpin.length) {
			if (delta < 0) {
				gpin[gpLensIndex].value += 1;
			} else {
				gpin[gpLensIndex].value -= 1;
			}
		}
		if (gpDistIndex >= 0 && gpDistIndex < gpin.length) {
			if (delta < 0) {
				gpin[gpDistIndex].value += 5;
			} else {
				gpin[gpDistIndex].value -= 5;
			}
		}
		upDateCanvas(gpin);
	}

	function showHelp(e: MouseEvent) {
		console.log('fire show help event', e);
		openHelpDialog = true;
	}

	let { camera, scene, renderer } = useThrelte();
	function resetControls() {
		//camTarget = new Vector3(0, 0, 0);
		//camLoc = [-300, 0, 0];
		//camera.current.position.set(camLoc[0], camLoc[1], camLoc[2]);
		//camera.current.lookAt(camTarget);
		//camera.current.rotation.set(0, -Math.PI / 2, 0);
		//upDateCanvas();
		console.log('camera', camera.current);
	}

	const gdata = gaussProfile(3.0, 10);
	const gaussVectorData = gaussVectorProfile(3.0, 10);
	let cameraZoom: number = $state(1.7);
</script>

<!-- <svelte:window on:keydown={onKeyDown} /> -->

<T.OrthographicCamera makeDefault position={cameraPosition} fov={75} zoom={cameraZoom}>
	<OrbitControls let:ref enableZoom enableDamping dampingFactor={0.075} target={targetPosition} />
</T.OrthographicCamera>
<!-- <T.DirectionalLight position={[0, 200, 200]} castShadow /> -->
<T.AmbientLight intensity={1} />

<!-- Center Test Pieces -->
<T.Group visible={false}>
	<!-- Center Crosss Section  -->
	<T.Mesh>
		<T.BoxGeometry args={[1, 1, 15]} />
		<T.MeshStandardMaterial />
	</T.Mesh>

	<T.Mesh>
		<T.BoxGeometry args={[1, 15, 1]} />
		<T.MeshStandardMaterial />
	</T.Mesh>

	<!-- Test text for location -->
	<T.Mesh position={[0, 20, 0]} rotation.y={-Math.PI / 2}>
		<Text text={'Center Cross Section'} fontSize={15} anchorX={'center'} anchorY={'bottom'} />
	</T.Mesh>
</T.Group>

<!-- plus & negative waist profile lines -->
{#if showSegLines}
	{#each { length: psegs.length } as _, index}
		<T.Mesh scale={[1, vertScale, 1]}>
			<T
				is={Line2}
				geometry={new LineGeometry().setPositions(psegs[index] as Float32Array)}
				material={new LineMaterial({
					color: lineColor,
					linewidth: gpin[lineMap[index]].tag ? 10 : 4
				})}
				name={'Line' + distanceMap[index]}
				onpointerenter={onLineEnter}
				onpointerleave={onLineLeave}
				onclick={onclickLine}
			/>
			<T
				is={Line2}
				geometry={new LineGeometry().setPositions(nsegs[index] as Float32Array)}
				material={new LineMaterial({
					color: lineColor,
					linewidth: gpin[lineMap[index]].tag ? 10 : 4
				})}
				name={'Line' + distanceMap[index]}
				onpointerenter={onLineEnter}
				onpointerleave={onLineLeave}
				onclick={onclickLine}
			/>
			<T
				is={Line2}
				geometry={new LineGeometry().setPositions(zsegs[index] as Float32Array)}
				material={new LineMaterial({
					color: lineColor,
					linewidth: 1
				})}
				name={'Line' + distanceMap[index]}
				onpointerenter={onLineEnter}
				onpointerleave={onLineLeave}
				onclick={onclickLine}
			/>
		</T.Mesh>
		{#if gpin[distanceMap[index]].tag}
			<T.Mesh position={centerLine(psegs[index], 5)} rotation.y={-Math.PI / 2}>
				<Text
					text={'d=' + gpin[distanceMap[index]].value.toFixed(0)}
					color={gridTextColor}
					fontSize={8}
					anchorX={'center'}
					anchorY={'bottom'}
				/>
			</T.Mesh>
		{/if}
	{/each}
{/if}

<!-- lenses  	[radius, lensPosi, gop, eflLabelPosi, geos] -->
{#if radius.length > 0}
	{#each { length: radius.length } as _, index}
		<T.Group scale={[1, vertScale, 1]}>
			<T.Mesh
				geometry={geos[index]}
				name={'Lens' + lensIndex[index].toString()}
				position={lensPosi[index]}
				rotation={[Math.PI / 2, 0, 0]}
				onpointerenter={onLensEnter}
				onpointerleave={onLensLeave}
				onclick={onClickLens}
				ondblclick={onDblClickLens}
			>
				<T.MeshPhongMaterial
					color={gop[index].color}
					opacity={1.0}
					transparent
					side={DoubleSide}
					shininess={100}
				/>
			</T.Mesh>
			{#if gpin[lensMap[index]]?.tag}
				<T.Mesh position={eflLabelPosi[index]} rotation.y={-Math.PI / 2}>
					<Text
						text={'f=' +
							gop[index].value.toFixed(1) +
							' mm, ap=' +
							radius[index].toFixed(1) +
							' mm'}
						color={gridTextColor}
						fontSize={10}
						anchorX={'center'}
						anchorY={'bottom'}
					/>
				</T.Mesh>
			{/if}

			<!-- <Lens
			radius={lenses[0][index]}
			{scaleY}
			{scaleZ}`
			position={[lenses[1][index][0], lenses[1][index][1], lenses[1][index][2]]}
			gop={lenses[2][index]}
		/> -->
		</T.Group>
	{/each}
{/if}

<!-- background plane - in this case along Y-Z aaxis -->
<T.Mesh
	position={[100 + offsetbackground, 0, 0]}
	rotation={[0, 0, 0]}
	visible={true}
	onwheel={(e: WheelEvent) => canvasWheel(e)}
	onpointermove={(e: WheelEvent) => canvasMove(e)}
>
	<T.BoxGeometry args={[1, 2 * gridHeight + 50, 2 * gridWidth + 100]} />
	<T.MeshStandardMaterial side={DoubleSide} color={'goldenrod'} transparent opacity={0.05} />
</T.Mesh>

<!-- add background grid lines -->
<T.Mesh position={[100, 0, 0]} visible={true}>
	{#each gridLines as line}
		<T is={Line2} geometry={genLineSegment(line)} material={new LineMaterial({ linewidth: 0.5 })} />
	{/each}
	<T
		is={Line2}
		geometry={genLineSegment(gridLines[0])}
		material={new LineMaterial({ linewidth: 0.5 })}
	/>
</T.Mesh>

<!-- Help Button -->
<!-- <T.Group position={[0, gridHeight, gridWidth + 30]} onclick={showHelp}> -->
<T.Group position={[0, gridHeight, -gridWidth + 30]}>
	<T.Mesh rotation.z={Math.PI / 2} visible={true} onclick={showHelp}>
		<T.CylinderGeometry args={[12, 12, 5, 32]} />
		<T.MeshStandardMaterial color={'yellow'} />
	</T.Mesh>
	<Text
		position={[-2.6, 0, 0]}
		rotation.y={-Math.PI / 2}
		text={'?'}
		color={'black'}
		fontSize={10}
		anchorX={'center'}
		anchorY={'middle'}
	/>
</T.Group>

<!-- Title -->
<T.Mesh position={[100, gridHeight + 25, -gridWidth - 50]} rotation.y={-Math.PI / 2} visible={true}>
	<Text text={titletext} color={'orange'} fontSize={12} anchorX={'left'} anchorY={'bottom'} />
</T.Mesh>

<!-- Image Plane Button -->
<T.Group position={[0, 0, gridWidth + 12]}>
	<T.Mesh rotation.z={Math.PI / 2} visible={true}>
		<T.CylinderGeometry args={[9, 9, 1, 32]} />
		<T.MeshStandardMaterial color={'tan'} />
	</T.Mesh>

	<T.Mesh position={[-5, -5, 0]}>
		<T
			is={Line2}
			geometry={new LineGeometry().setPositions(gdata)}
			material={new LineMaterial({
				color: 0xffffff,
				linewidth: 2
			})}
			name={'gLine'}
		/>
	</T.Mesh>
</T.Group>
