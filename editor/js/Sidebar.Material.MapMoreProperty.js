import * as THREE from 'three';

import { UIButton, UIRow, UISelect, UIText } from './libs/ui.js';

function SidebarMaterialMapMoreProperty( editor, property, uiParent ) {

	const strings = editor.strings;
	const signals = editor.signals;

	const magFilterOptions = {
		[THREE.NearestFilter]:
			`${THREE.NearestFilter}: ${
				strings.getKey("sidebar/mapMore/magFilterOptions/nearestFilter")
			}`,
		[THREE.LinearFilter]:
			`${THREE.LinearFilter}: ${
				strings.getKey("sidebar/mapMore/magFilterOptions/linearFilter")
			}`,
	};

	const minFilterOptions = {
		[THREE.NearestFilter]:
			`${THREE.NearestFilter}: ${
				strings.getKey("sidebar/mapMore/minFilterOptions/nearestFilter")
			}`,
		[THREE.NearestMipmapNearestFilter]:
			`${THREE.NearestMipmapNearestFilter}: ${
				strings.getKey("sidebar/mapMore/minFilterOptions/nearestMipmapNearestFilter")
			}`,
		[THREE.NearestMipmapLinearFilter]:
			`${THREE.NearestMipmapLinearFilter}: ${
				strings.getKey("sidebar/mapMore/minFilterOptions/nearestMipmapLinearFilter")
			}`,
		[THREE.LinearFilter]:
			`${THREE.LinearFilter}: ${
				strings.getKey("sidebar/mapMore/minFilterOptions/linearFilter")
			}`,
		[THREE.LinearMipmapNearestFilter]:
			`${THREE.LinearMipmapNearestFilter}: ${
				strings.getKey("sidebar/mapMore/minFilterOptions/linearMipmapNearestFilter")
			}`,
		[THREE.LinearMipmapLinearFilter]:
			`${THREE.LinearMipmapLinearFilter}: ${
				strings.getKey("sidebar/mapMore/minFilterOptions/linearMipmapLinearFilter")
			}`,
	};

	const wrapModeOptions = {
		[THREE.RepeatWrapping]:
			`${THREE.RepeatWrapping}: ${
				strings.getKey("sidebar/mapMore/wrapModeOptions/repeatWrapping")
			}`,
		[THREE.ClampToEdgeWrapping]:
			`${THREE.ClampToEdgeWrapping}: ${
				strings.getKey("sidebar/mapMore/wrapModeOptions/clampToEdgeWrapping")
			}`,
		[THREE.MirroredRepeatWrapping]:
			`${THREE.MirroredRepeatWrapping}: ${
				strings.getKey("sidebar/mapMore/wrapModeOptions/mirroredRepeatWrapping")
			}`,
	}

	const mappingOptions = {
		[THREE.UVMapping]:
			`${THREE.UVMapping}: ${
				strings.getKey("sidebar/mapMore/mappingOptions/uvMapping")
			}`,
		[THREE.CubeReflectionMapping]:
			`${THREE.CubeReflectionMapping}: ${
				strings.getKey("sidebar/mapMore/mappingOptions/cubeReflectionMapping")
			}`,
		[THREE.CubeRefractionMapping]:
			`${THREE.CubeRefractionMapping}: ${
				strings.getKey("sidebar/mapMore/mappingOptions/cubeRefractionMapping")
			}`,
		[THREE.EquirectangularReflectionMapping]:
			`${THREE.EquirectangularReflectionMapping}: ${
				strings.getKey("sidebar/mapMore/mappingOptions/equirectangularReflectionMapping")
			}`,
		[THREE.EquirectangularRefractionMapping]:
			`${THREE.EquirectangularRefractionMapping}: ${
				strings.getKey("sidebar/mapMore/mappingOptions/equirectangularRefractionMapping")
			}`,
		[THREE.CubeUVReflectionMapping]:
			`${THREE.CubeUVReflectionMapping}: ${
				strings.getKey("sidebar/mapMore/mappingOptions/cubeUVReflectionMapping")
			}`,
	}

	const indent = "50px";
	const selectWidth = "150px";
	const selectFontSize = "12px";

	const moreBtnRow = new UIRow();
	const moreBtn = new UIButton( strings.getKey("sidebar/mapMore/showBtnLabel") )
		.setMarginLeft(indent)
		.onClick( toggle );
	moreBtnRow.add(moreBtn);
	uiParent.add(moreBtnRow);

	let shown = false;
	const moreRows = [];

	function toggle() {
		if (shown) hide()
		else show();
	}
	function show() {
		signals.hideAllMapMoreSettings.dispatch();
		shown = true;
		moreBtn.setTextContent( strings.getKey("sidebar/mapMore/hideBtnLabel") );
		for (let i=0; i<moreRows.length; i++) {
			moreRows[i].setDisplay( '' );
		}
	}
	function hide() {
		shown = false;
		moreBtn.setTextContent( strings.getKey("sidebar/mapMore/showBtnLabel") );
		for (let i=0; i<moreRows.length; i++) {
			moreRows[i].setDisplay( 'none' );
		}
	}

	// wrapS
	const wrapSRow = new UIRow().setDisplay( 'none' );
	wrapSRow.add(new UIText( strings.getKey("sidebar/mapMore/wrapSLabel") )
		.setClass( 'Label' ) )
		.setMarginLeft(indent);
	const wrapS = new UISelect()
		.setWidth( selectWidth )
		.setFontSize( selectFontSize )
		.setOptions( wrapModeOptions )
		.onChange( onMoreSettingsChange );
	wrapSRow.add(wrapS);
	uiParent.add(wrapSRow);
	moreRows.push(wrapSRow);

	// wrapT
	const wrapTRow = new UIRow().setDisplay( 'none' );
	wrapTRow.add(new UIText( strings.getKey("sidebar/mapMore/wrapTLabel") )
		.setClass( 'Label' ) )
		.setMarginLeft(indent);
	const wrapT = new UISelect()
		.setWidth( selectWidth )
		.setFontSize( selectFontSize )
		.setOptions( wrapModeOptions )
		.onChange( onMoreSettingsChange );
	wrapTRow.add(wrapT);
	uiParent.add(wrapTRow);
	moreRows.push(wrapTRow);

	// minFilter
	const minFilterRow = new UIRow().setDisplay( 'none' );
	minFilterRow.add(new UIText( strings.getKey("sidebar/mapMore/minFilterLabel") )
		.setClass( 'Label' ) )
		.setMarginLeft(indent);
	const minFilter = new UISelect()
		.setWidth( selectWidth )
		.setFontSize( selectFontSize )
		.setOptions( minFilterOptions )
		.onChange( onMoreSettingsChange );
	minFilterRow.add(minFilter);
	uiParent.add(minFilterRow);
	moreRows.push(minFilterRow);

	// magFilter
	const magFilterRow = new UIRow().setDisplay( 'none' );
	magFilterRow.add(new UIText( strings.getKey("sidebar/mapMore/magFilterLabel") )
		.setClass( 'Label' ) )
		.setMarginLeft(indent);
	const magFilter = new UISelect()
		.setWidth( selectWidth )
		.setFontSize( selectFontSize )
		.setOptions( magFilterOptions )
		.onChange( onMoreSettingsChange );
	magFilterRow.add(magFilter);
	uiParent.add(magFilterRow);
	moreRows.push(magFilterRow);

	// mapping
	const mappingRow = new UIRow().setDisplay( 'none' );
	mappingRow.add(new UIText( strings.getKey("sidebar/mapMore/mappingLabel") )
		.setClass( 'Label' ) )
		.setMarginLeft(indent);
	const mapping = new UISelect()
		.setWidth( selectWidth )
		.setFontSize( selectFontSize )
		.setOptions( mappingOptions )
		.onChange( onMoreSettingsChange );
	mappingRow.add(mapping);
	uiParent.add(mappingRow);
	moreRows.push(mappingRow);

	let object = null;
	let map = null;
	let materialSlot = null;
	let material = null;

	function onMoreSettingsChange() {
		if (!map) return;
		map.wrapS = parseInt(wrapS.getValue());
		map.wrapT = parseInt(wrapT.getValue());
		map.minFilter = parseInt(minFilter.getValue());
		map.magFilter = parseInt(magFilter.getValue());
		map.mapping = parseInt(mapping.getValue());
		map.needsUpdate = true;
		material.needsUpdate = true;
	}

	function update( currentObject, currentMaterialSlot = 0 ) {
		hide();
		moreBtnRow.setDisplay( 'none' );

		map = null;
		object = currentObject;
		materialSlot = currentMaterialSlot;
		if ( object === null ) return;
		if ( object.material === undefined ) return;

		material = editor.getObjectMaterial( object, materialSlot );
		if ( property in material ) {
			if ( material[ property ] !== null ) {
				map = material[ property ];
			}

			if (map) {
				moreBtnRow.setDisplay( '' );
				if ( wrapS !== undefined ) {
					wrapS.setValue( map.wrapS );
				}
				if ( wrapT !== undefined ) {
					wrapT.setValue( map.wrapT );
				}
				if ( minFilter !== undefined ) {
					minFilter.setValue( map.minFilter );
				}
				if ( magFilter !== undefined ) {
					magFilter.setValue( map.magFilter );
				}
				if ( mapping !== undefined ) {
					mapping.setValue( map.mapping );
				}
			}
		}
	}

	signals.objectSelected.add( function ( selected ) {
		update( selected );
	} );

	signals.materialChanged.add( update );

	signals.hideAllMapMoreSettings.add( function () {
		hide();
	} )

	return { toggle, show, hide };

}

export { SidebarMaterialMapMoreProperty };
