const xmat = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xcostume = getExcel('AvatarCostumeExcelConfigData');
const xavatar = getExcel('AvatarExcelConfigData');

// for AvatarCostumeExcelConfigData
const propertyMap = {
	id: 'BDFMGMADMGC', // 200301
	avatarId: 'PDBPABLOMMA', // 10000003
	iconName: 'MKPEEANCLCO' // UI_AvatarIcon_QinCostumeSea
}

// taken from collateCharacter.js
const playerIdToTextMapHash = { 10000005: 2329553598, 10000007: 3241049361 };

function collateOutfit(lang) {
	const language = getLanguage(lang);
	let myoutfit = xcostume.reduce((accum, obj) => {

		let data = {};
		data.id = obj[propertyMap.id];

		data.name = language[obj.nameTextMapHash];
		data.description = sanitizeDescription(language[obj.descTextMapHash]);

		data.isdefault = obj.isDefault === true;

		const AvatarId = obj[propertyMap.avatarId];
		if(playerIdToTextMapHash[AvatarId])
			data.character = language[playerIdToTextMapHash[AvatarId]];
		else
			data.character = language[xavatar.find(ele => ele.id === obj[propertyMap.avatarId]).nameTextMapHash];

		if(obj.itemId) {
			let sauce = xsource.find(ele => ele.id === obj.itemId);
			data.source = sauce.textList.map(ele => language[ele]).filter(ele => ele !== '' && ele !== undefined);

			data.namecard = xmat.find(ele => ele.id === obj.itemId).icon;
		} else {
			data.namecard = 'UI_AvatarIcon_Costume_Card';
		}

		if(obj[propertyMap.iconName]) {
			data.nameicon = obj[propertyMap.iconName];
			const name = data.nameicon.slice(data.nameicon.lastIndexOf('_')+1);
			data.namesplash = `UI_Costume_${name}`;
		}
		if(obj.sideIconName)
			data.namesideicon = obj.sideIconName;



		// data.nameicon = obj.icon;
		// data.namebanner = obj.useParam[0] !== "" ? obj.useParam[0] : undefined;
		// data.namebackground = obj.useParam[1];

		let filename = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
		if(filename === '') return accum;
		if(filename === 'defaultoutfit') return accum;
		if(playerIdToTextMapHash[AvatarId])
			filename += makeFileName(getLanguage('EN')[playerIdToTextMapHash[AvatarId]]);
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return myoutfit;
}

module.exports = collateOutfit;