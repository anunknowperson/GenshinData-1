const xachieve = getExcel('AchievementExcelConfigData');
const xgoal = getExcel('AchievementGoalExcelConfigData');
const xreward = getExcel('RewardExcelConfigData');
const xmat = getExcel('MaterialExcelConfigData');

function collateAchievement(lang) {
	const language = getLanguage(lang);
	let myachievement = xachieve.reduce((accum, obj) => {
		if(obj.isDisuse === true) {
			// console.log(`disuse: ${obj.id} ${language[obj.titleTextMapHash]}`)
			return accum;
		}
		if(obj.id === 84517) return accum; // Instant Karma achievement is unobtainable

		if(obj.preStageAchievementId) {
			if(language[obj.descTextMapHash] === '') return accum;
			let data = Object.values(accum).find(ele => ele.id.includes(obj.preStageAchievementId));
			data.id.push(obj.id);

			data.stages = data.stages + 1;
			if(data.stages > 3) console.log(`achievement ${obj.id} has more than 3 stages`);

			data['stage'+data.stages] = addStage(obj, language);

			return accum;
		}

		let data = {};
		data.id = [obj.id];

		data.name = language[obj.titleTextMapHash];
		if(data.name === '') return accum;

		data.achievementgroup = language[xgoal.find(e => e.id === obj.goalId).nameTextMapHash];
		data.ishidden = obj.isShow === 'SHOWTYPE_HIDE' ? true : undefined;
		data.sortorder = obj.orderId;
		data.stages = 1;

		data['stage'+data.stages] = addStage(obj, language);


		let filename = makeFileName(getLanguage('EN')[obj.titleTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) {
			if(obj.id !== 84004 && obj.id !== 86007)
				console.log('filename collision: ' + filename + ' disuse: ' + obj.isDisuse);
			filename+='a';
		}
		// if(accum[filename] !== undefined) return accum;
		accum[filename] = data;
		return accum;
	}, {});

	const groups = [...new Set(xgoal.map(e => language[e.nameTextMapHash]))];
	// for(const g of groups) { showNumber(myachievement, g); };
	console.log('total: ' + Object.values(myachievement).reduce((accum, ele) => { accum+=ele.stages; return accum }, 0));

	// const wonder = Object.values(myachievement).filter(e => e.achievementgroup === 'Wonders of the World');
	// console.log(wonder.sort((a, b) => a.sortorder - b.sortorder).map(e => e.name).slice(170));

	return myachievement;
}

function showNumber(myachievement, group) {
	const tmp = Object.values(myachievement).filter(e => e.achievementgroup === group).reduce((accum, ele) => {
		accum+=ele.stages;
		return accum;
	}, 0);
	console.log(`${group}: ${tmp}`);
}

function addStage(obj, language) {
	let out = {};
	out.title = language[obj.titleTextMapHash];
	if(language[obj.ps5TitleTextMapHash] !== '')
		out.ps5title = language[obj.ps5TitleTextMapHash];
	out.description = sanitizeDescription(language[obj.descTextMapHash]);
	out.progress = obj.progress;
	const rewards = xreward.find(e => e.rewardId === obj.finishRewardId).rewardItemList.filter(f => f.itemId);
	if(rewards.length === 0) console.log(`achievement ${obj.id} has no rewards`);
	if(rewards.length > 1) console.log(`achievement ${obj.id} has multiple rewards`);
	if(rewards[0].itemId !== 201) console.log(`achievement ${obj.id} has non-primogem reward`);
	out.reward = rewards.map(ele => {
		return {
			name: language[xmat.find(mat => mat.id === ele.itemId).nameTextMapHash], 
			count: ele.itemCount
		}; 
	})[0];
	return out;
}

module.exports = collateAchievement;