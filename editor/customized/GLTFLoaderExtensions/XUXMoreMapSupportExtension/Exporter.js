class XUXMoreMapSupportExtensionExporter {

	constructor( writer ) {

		this.writer = writer;
		this.name = 'XUX_materials_more_map_support';

	}

	writeMaterial( material, materialDef ) {

		const writer = this.writer;
		const extensionsUsed = writer.extensionsUsed;

		const extensionDef = {};

		extensionDef.lightMapIntensity = material.lightMapIntensity;

		if ( material.lightMap ) {

			const lightMapDef = {
				index: writer.processTexture( material.lightMap ),
				texCoord: material.lightMap.channel,
			};
			writer.applyTextureTransform( lightMapDef, material.lightMap );
			extensionDef.lightTexture = lightMapDef;

		}

		extensionDef.envMapIntensity = material.envMapIntensity;

		if ( material.envMap ) {

			const envMapDef = {
				index: writer.processTexture( material.envMap ),
				texCoord: material.envMap.channel
			};
			writer.applyTextureTransform( envMapDef, material.envMap );
			extensionDef.envTexture = envMapDef;

		}

		materialDef.extensions = materialDef.extensions || {};
		materialDef.extensions[ this.name ] = extensionDef;

		materialDef.materialType = material.type;

		extensionsUsed[ this.name ] = true;


	}

}

export { XUXMoreMapSupportExtensionExporter }
