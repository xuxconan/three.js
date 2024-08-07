import {
	MeshBasicMaterial,
	MeshDepthMaterial,
	MeshNormalMaterial,
	MeshLambertMaterial,
	MeshMatcapMaterial,
	MeshPhongMaterial,
	MeshToonMaterial,
	MeshStandardMaterial,
	MeshPhysicalMaterial,
	RawShaderMaterial,
	ShaderMaterial,
	ShadowMaterial,
} from 'three';

class XUXMoreMapSupportExtensionLoader {

	constructor( parser ) {

		this.parser = parser;
		this.name = "XUX_materials_more_map_support";

	}

	getMaterialType( materialIndex ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) return null;

		if (materialDef.materialType !== undefined) {
			switch(materialDef.materialType) {
				case "MeshBasicMaterial": return MeshBasicMaterial;
				case "MeshDepthMaterial": return MeshDepthMaterial;
				case "MeshNormalMaterial": return MeshNormalMaterial;
				case "MeshLambertMaterial": return MeshLambertMaterial;
				case "MeshMatcapMaterial": return MeshMatcapMaterial;
				case "MeshPhongMaterial": return MeshPhongMaterial;
				case "MeshToonMaterial": return MeshToonMaterial;
				case "MeshStandardMaterial": return MeshStandardMaterial;
				case "MeshPhysicalMaterial": return MeshPhysicalMaterial;
				case "RawShaderMaterial": return RawShaderMaterial;
				case "ShaderMaterial": return ShaderMaterial;
				case "ShadowMaterial": return ShadowMaterial;
				default: return MeshStandardMaterial;
			}
		}
		return MeshStandardMaterial;

	}

	extendMaterialParams( materialIndex, materialParams ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) {

			return Promise.resolve();

		}

		const pending = [];

		const extension = materialDef.extensions[ this.name ];

		if ( extension.lightMapIntensity !== undefined ) {

			materialParams.lightMapIntensity = extension.lightMapIntensity;

		}

		if ( extension.lightTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'lightMap', extension.lightTexture ) );

		}

		if ( extension.envTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'envMap', extension.envTexture ) );

		}

		return Promise.all( pending );

	}

}

export { XUXMoreMapSupportExtensionLoader }
