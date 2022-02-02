const xachieve = getExcel('AchievementExcelConfigData');
const xgoal = getExcel('AchievementGoalExcelConfigData');
const xreward = getExcel('RewardExcelConfigData');
const xmat = getExcel('MaterialExcelConfigData');

function collateAchievement(lang) {
	const language = getLanguage(lang);
	let myachievement = xachieve.reduce((accum, obj) => {
		if(obj.IsDeleteWatcherAfterFinish === true) {
			// console.log(`disuse: ${obj.Id} ${language[obj.TitleTextMapHash]}`)
			return accum;
		}
		if(obj.Id === 84517) return accum; // Instant Karma achievement is unobtainable

		if(obj.PreStageAchievementId) {
			if(language[obj.DescTextMapHash] === '') return accum;
			let data = Object.values(accum).find(ele => ele.Id.includes(obj.PreStageAchievementId));
			data.Id.push(obj.Id);

			data.stages = data.stages + 1;
			if(data.stages > 3) console.log(`achievement ${obj.Id} has more than 3 stages`);

			data['stage'+data.stages] = addStage(obj, language);

			return accum;
		}

		let data = {};
		data.Id = [obj.Id];

		data.name = language[obj.TitleTextMapHash];
		if(data.name === '') return accum;

		data.achievementgroup = language[xgoal.find(e => e.Id === obj.GoalId).NameTextMapHash];
		data.ishidden = obj.IsShow === 'SHOWTYPE_HIDE' ? true : undefined;
		data.sortorder = obj.OrderId;
		data.stages = 1;

		data['stage'+data.stages] = addStage(obj, language);


		let filename = makeFileName(getLanguage('EN')[obj.TitleTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) {
			if(obj.Id !== 84004 && obj.Id !== 86007)
				console.log('filename collision: ' + filename + ' disuse: ' + obj.IsDisuse);
			filename+='a';
		}
		// if(accum[filename] !== undefined) return accum;
		accum[filename] = data;
		return accum;
	}, {});

	const groups = [...new Set(xgoal.map(e => language[e.NameTextMapHash]))];
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
	out.title = language[obj.TitleTextMapHash];
	if(language[obj.Ps5TitleTextMapHash] !== '')
		out.ps5title = language[obj.Ps5TitleTextMapHash];
	out.description = sanitizeDescription(language[obj.DescTextMapHash]);
	out.progress = obj.Progress;
	const rewards = xreward.find(e => e.RewardId === obj.FinishRewardId).RewardItemList.filter(f => f.ItemId);
	if(rewards.length === 0) console.log(`achievement ${obj.Id} has no rewards`);
	if(rewards.length > 1) console.log(`achievement ${obj.Id} has multiple rewards`);
	if(rewards[0].ItemId !== 201) console.log(`achievement ${obj.Id} has non-primogem reward`);
	out.reward = rewards.map(ele => {
		return {
			name: language[xmat.find(mat => mat.Id === ele.ItemId).NameTextMapHash], 
			count: ele.ItemCount
		}; 
	})[0];
	return out;
}

module.exports = collateAchievement;