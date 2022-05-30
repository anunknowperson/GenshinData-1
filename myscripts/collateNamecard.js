const xmat = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');

function collateNamecard(lang) {
	const language = getLanguage(lang);
	let mynamecard = xmat.reduce((accum, obj) => {
		if(obj.materialType !== 'MATERIAL_NAMECARD') return accum;

		let data = {};
		data.id = obj.id;
		// data.rankLevel = obj.rankLevel; // all rarity 4

		data.name = language[obj.nameTextMapHash];
		data.description = sanitizeDescription(language[obj.descTextMapHash]);
		data.sortorder = obj.id;

		let sauce = xsource.find(ele => ele.id === obj.id);
		data.source = sauce.textList.map(ele => language[ele]).filter(ele => ele !== '');


		data.nameicon = obj.icon;
		data.namebanner = obj.picPath[0] !== "" ? obj.picPath[0] : undefined;
		data.namebackground = obj.picPath[1];

		let filename = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return mynamecard;
}

module.exports = collateNamecard;