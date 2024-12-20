import * as THREE from '../../build/three.module.js';
import { UISpan, UISelect, UIButton, UIText, UINumber, UIRow, UIInput} from './libs/ui.js';

/**
 * 压缩流程
 * 1、缓存oldImage，克隆compressImage，将对应map的image替换成compressImage
 * 2、压缩结果直接反映到map的image里
 * 3、取消则用oldImage赋值，确定则不做处理
 * 4、当material改变时，oldImage重新获取，compressImage重新克隆
 * 5、当map改变时，oldImage重新获取，compressImage重新克隆
 */

const MIME_TYPE_OPTIONS = {
	"image/jpeg": "jpg",
	"image/png": "png",
}

function dataURLtoBlob(dataurl) {
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
}

function blobToBase64 (blob) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader()
		fileReader.onload = (e) => {
			resolve(e.target.result)
		}
		// readAsDataURL
		fileReader.readAsDataURL(blob)
		fileReader.onerror = () => {
			reject(new Error('blobToBase64 error'))
		}
	})
}

function SidebarMaterialMapCompressor( editor, mapType, btnParent, rowParent ) {
	var strings = editor.strings;
	var signals = editor.signals;

	var taskId = 0; // 压缩任务id
	var isShow = false;
	var rows = [];

	var currentObject = null;
	var currentMaterial = null;
	var currentMap = null;
	var oldImage = null;
	var compressedImage = null;

	var compressWidth = 0;
	var compressHeight = 0;
	var compressQuality = 0.8;
	var compressMimeType = "image/jpeg";

	var btn = new UIButton( "压缩" ).setMarginLeft( '50px' ).onClick( function () {
		Toggle();
	})
	btnParent.add(btn);

	// 原始图
	var oldRow = new UIRow().setMarginLeft( '50px' ).setDisplay("none");
	oldRow.add(new UIText("原始图信息:"));
	rowParent.add(oldRow);
	rows.push(oldRow);

	var oldInfoRow = new UIRow().setMarginLeft( '75px' ).setDisplay("none");
	oldInfoRow.add(new UIText("分辨率:"));
	var oldResolutionText = new UIText("").setMarginLeft( '7px' );
	oldInfoRow.add(oldResolutionText);
	oldInfoRow.add(new UIText("大小:").setMarginLeft( '14px' ));
	var oldSizeText = new UIText("").setMarginLeft( '7px' );
	oldInfoRow.add(oldSizeText);
	oldInfoRow.add(new UIText("格式:").setMarginLeft( '14px' ));
	var oldMimeTypeText = new UIText("").setMarginLeft( '7px' );
	oldInfoRow.add(oldMimeTypeText);
	rowParent.add(oldInfoRow);
	rows.push(oldInfoRow);

	// 压缩图
	var newRow = new UIRow().setMarginLeft( '50px' ).setDisplay("none");
	newRow.add(new UIText("压缩图信息:"));
	rowParent.add(newRow);
	rows.push(newRow);

	var newInfoRow = new UIRow().setMarginLeft( '75px' ).setDisplay("none");
	newInfoRow.add(new UIText("分辨率:"));
	var newResolutionText = new UIText("").setMarginLeft( '7px' );
	newInfoRow.add(newResolutionText);
	newInfoRow.add(new UIText("大小:").setMarginLeft( '14px' ));
	var newSizeText = new UIText("").setMarginLeft( '7px' );
	newInfoRow.add(newSizeText);
	newInfoRow.add(new UIText("格式:").setMarginLeft( '14px' ));
	var newMimeTypeText = new UIText("").setMarginLeft( '7px' );
	newInfoRow.add(newMimeTypeText);
	rowParent.add(newInfoRow);
	rows.push(newInfoRow);

	// 设置
	var labelRow = new UIRow().setMarginLeft( '50px' ).setDisplay("none");
	labelRow.add(new UIText("压缩设置:"));
	rowParent.add(labelRow);
	rows.push(labelRow);

	var resolutionRow = new UIRow().setMarginLeft( '75px' ).setDisplay("none");
	resolutionRow.add(new UIText("宽:"));
	var widthInput = new UINumber(compressWidth).setRange(0, Infinity).setWidth( '60px' ).setFontSize( '12px' ).setMarginLeft( '7px' ).onChange( function() { compressWidth = parseInt(widthInput.getValue()) } );
	resolutionRow.add(widthInput);
	resolutionRow.add(new UIText("高:").setMarginLeft( '7px' ));
	var heightInput = new UINumber(compressHeight).setRange(0, Infinity).setWidth( '60px' ).setFontSize( '12px' ).setMarginLeft( '7px' ).onChange( function() { compressHeight = parseInt(heightInput.getValue()) } );
	resolutionRow.add(heightInput);
	rowParent.add(resolutionRow);
	rows.push(resolutionRow);

	var mimeTypeRow = new UIRow().setMarginLeft( '75px' ).setDisplay("none");
	mimeTypeRow.add(new UIText("压缩格式:"));
	var mimeTypeSelector = new UISelect().setOptions(MIME_TYPE_OPTIONS).setValue(compressMimeType).setFontSize( '12px' ).setMarginLeft( '7px' ).onChange( function() { compressMimeType = mimeTypeSelector.getValue() } );
	mimeTypeRow.add(mimeTypeSelector);
	rowParent.add(mimeTypeRow);
	rows.push(mimeTypeRow);

	var qualityRow = new UIRow().setMarginLeft( '75px' ).setDisplay("none");
	qualityRow.add(new UIText("压缩品质:"));
	var qualityInput = new UINumber(compressQuality).setRange(0, 1).setWidth( '60px' ).setFontSize( '12px' ).setMarginLeft( '7px' ).onChange( function() { compressQuality = parseFloat(qualityInput.getValue()) } );
	qualityRow.add(qualityInput);
	rowParent.add(qualityRow);
	rows.push(qualityRow);

	var operationRow = new UIRow().setMarginLeft( '50px' ).setDisplay("none");
	operationRow.add(new UIButton("压缩").setMarginLeft( '7px' ).onClick( function () {
		Compress();
	}));
	operationRow.add(new UIButton("取消").setMarginLeft( '7px' ).onClick( function () {
		Cancel();
		Hide();
	}));
	operationRow.add(new UIButton("确定").setMarginLeft( '7px' ).onClick( function () {
		Confirm();
		Hide();
	}));
	rowParent.add(operationRow);
	rows.push(operationRow);

	const addTaskId = function() {
		if (window.Number && taskId >= window.Number.MAX_SAFE_INTEGER)
			taskId = 0;
		taskId++;
	}

	const Show = function() {
		isShow = true;
		btn.setStyle("background-color", ["#409EFF"]);
		for (let i=0; i<rows.length; i++)
			rows[i].setDisplay("");
	}
	const Hide = function() {
		isShow = false;
		btn.setStyle("background-color", ["#222"]);
		for (let i=0; i<rows.length; i++)
			rows[i].setDisplay("none");
	}
	const Toggle = function() {
		if (isShow) Hide();
		else Show();
	}

	const Compress = function() {
		if (!oldImage || !compressedImage) return;

		addTaskId();
		const id = taskId; // 记录当前任务id

		console.log("开始压缩", compressQuality, compressWidth, compressHeight, compressMimeType)
		new Compressor(dataURLtoBlob(oldImage.src), {
			quality: compressQuality || 0.8,
			// convertSize: 10,
			width: compressWidth || oldImage.width,
			height: compressHeight || oldImage.height,
			mimeType: compressMimeType || "auto",
			success: (result) => {
				if (id !== taskId) return;
				blobToBase64(result).then((bs) => {
					compressedImage.src = bs;
				});
			},
			error(err) {
				if (id !== taskId) return;
				console.error(err);
			}
		});
	}
	const Cancel = function() {
		if (currentMap) {
			currentMap.image = oldImage;
			currentMap.needsUpdate = true;
		}
		if (currentMaterial)
			currentMaterial.needsUpdate = true;
		SetOldImage(oldImage);
		RefreshUI();
	}
	const Confirm = function() {
		compressedImage.onload = undefined;
		if (currentMap) {
			currentMap.needsUpdate = true;
		}
		if (currentMaterial)
			currentMaterial.needsUpdate = true;
		SetOldImage(compressedImage);
		RefreshUI();
	}

	// const SetObject = function (object) {
	// 	if (currentObject === object) return;
	// 	currentObject = object; // 选中object时触发
	// 	RefreshUI();
	// }
	// const SetMaterial = function(mat) {
	// 	if (currentMaterial === mat) return;
	// 	currentMaterial = mat; // 选中object、切换material时触发
	// 	RefreshUI();
	// }
	// const SetMap = function(map) {
	// 	if (currentMap === map) return;
	// 	currentMap = map; // 选中object、切换material、替换贴图map时触发
	// 	if (currentMap) {
	// 		SetOldImage(currentMap.image);
	// 	} else {
	// 		SetOldImage(null);
	// 	}
	// 	addTaskId();
	// 	RefreshUI();
	// }

	const SetOldImage = function(img) {
		oldImage = img;
		if (oldImage) {
			compressedImage = oldImage.cloneNode();
			compressedImage.onload = function() {
				if (currentMap)
					currentMap.needsUpdate = true;
				if (currentMaterial)
					currentMaterial.needsUpdate = true;
				RefreshUI();
			}
			widthInput.setValue(oldImage.width);
			heightInput.setValue(oldImage.height);
			currentMap.image = compressedImage;
			currentMap.needsUpdate = true;
			if (currentMaterial)
				currentMaterial.needsUpdate = true;
		} else {
			compressedImage = null;
		}
	}

	const RefreshUI = function() {
		if (!currentMaterial) return;
		btn.setDisplay(!!oldImage ? "" : "none");
		if (!oldImage) Hide();
		if (oldImage) {
			var width = oldImage.width;
			var height = oldImage.height;
			var blob = dataURLtoBlob(oldImage.src);
			oldResolutionText.setValue(width + " x " + height);
			oldSizeText.setValue(blob.size);
			oldMimeTypeText.setValue(blob.type);
		}
		if (compressedImage) {
			var width = compressedImage.width;
			var height = compressedImage.height;
			var blob = dataURLtoBlob(compressedImage.src);
			newResolutionText.setValue(width + " x " + height);
			newSizeText.setValue(blob.size);
			newMimeTypeText.setValue(blob.type);
		}
	}

	const Update = function(object, currentMaterialSlot = 0) {
		Hide();
		btn.setDisplay("none");

		currentObject = object;
		if ( object === null ) return;
		if ( object.material === undefined ) return;
		currentMaterial = editor.getObjectMaterial( object, currentMaterialSlot );

		if ( mapType in currentMaterial ) {
			btn.setDisplay("");
			currentMap = currentMaterial[mapType];
				if (currentMap) {
					SetOldImage(currentMap.image);
				} else {
					SetOldImage(null);
				}
				addTaskId();
				RefreshUI();
		}
	}

	signals.objectSelected.add( function ( selected ) {
		Update( selected );
	} );

	signals.materialChanged.add( Update );

	return {
		RefreshUI,
		// SetObject, SetMaterial, SetMap,
		Show, Hide, Toggle,
		Compress, Cancel, Confirm
	}
}

export { SidebarMaterialMapCompressor };
