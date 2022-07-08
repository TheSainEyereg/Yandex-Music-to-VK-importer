const {VK} = require("vk-io");
const {YMApi} = require("ym-api");
const VKAudio = require("./components/VKAudio.js");
const {isSimilarByIncludingChunks, isSimilarByLevenshtein} = require("./components/algorithmic.js");
const {VKtoken, VKUserAgent, YMAuth, YMplayListId} = require("./config.json");

const vkApi = new VK({token: VKtoken, apiHeaders: { "User-Agent": VKUserAgent }}).api;
const vkAudio = new VKAudio(vkApi);
const ymApi = new YMApi();

function isSimilar(str1, str2) {
	//Split every string by ",", "&", "-", "and" and "feat."
	const str1Arr = str1.split(/[,&-/\\\ ]|and|feat\./gi).filter(x => x.length > 0);
	const str2Arr = str2.split(/[,&-/\\\ ]|and|feat\./gi).filter(x => x.length > 0);

	// Compare all words in str1Arr and str2Arr by levenshtein distance
	for (let i = 0; i < str1Arr.length; i++) {
		for (let j = 0; j < str2Arr.length; j++) {
			if (isSimilarByLevenshtein(str1Arr[i], str2Arr[j]) < 0.5) return false;
		}
	}

	return true;
}

(async () => {
	const client = await vkApi.account.getProfileInfo();

	await ymApi.init({uid: YMAuth.uid, access_token: YMAuth.access_token});
	const ymList = await ymApi.getPlaylist(YMplayListId ? ""+YMplayListId : "3");
	const vkList = await vkAudio.getOldAudioList(client.id);
	const list = ymList.tracks.reverse();
	const inVKandYM = [];

	// Check every track in ymList to find similar tracks in vkList and if not found - add it
	console.log("Checking for missing tracks...");
	for (let i = 0; i < list.length; i++) {
		const title = list[i].track.title;
		//const artist = list[i].track.artists.map(e => e.name).join(", ");
		const artist = list[i].track.artists[0].name;
		const version = list[i].track.version;
		const vkTrack = vkList.find(item =>
			(item.artist.toLowerCase().includes(artist.toLowerCase()) || isSimilar(item.artist, artist)) &&
			(item.title.toLowerCase().includes(title.toLowerCase()) || isSimilar(item.title, title))
		);
		if (!vkTrack) {
			console.log(`"${artist} - ${title} ${version ? "("+version+")": ""}" missing in VK!`);
			const vkSearch = await vkApi.call("audio.search", {q: artist + " - " + title + (version ? "("+version+")": ""), count: 200});
			const foundTrack = vkSearch.items.find(item =>
				(item.artist.toLowerCase().includes(artist.toLowerCase()) || isSimilar(item.artist, artist)) &&
				(item.title.toLowerCase().includes(title.toLowerCase()) || isSimilar(item.title, title))
			);
			if (!vkSearch.items.length || !foundTrack) {console.log(`Can't find any track in VK!`); continue;}
			await vkApi.call("audio.add", {owner_id: foundTrack.owner_id, audio_id: foundTrack.id});
			console.log(`Track has been added to VK!`);
			const addedTrack = await vkApi.call("audio.get", {owner_id: client.id, count: 1})
			inVKandYM.push(addedTrack.items[0]);
		} else {
			inVKandYM.push(vkTrack);
		}
	}

	// Check every track in vkList and if it not in ymList - delete it
	console.log("Checking for extra tracks...");
	for (const vkTrack of vkList) {
		if (!inVKandYM.includes(vkTrack)) {
			console.log(`"${vkTrack.artist} - ${vkTrack.title}" missing in YM!`);
			await vkApi.call("audio.delete", {owner_id: vkTrack.owner_id, audio_id: vkTrack.id});
			console.log(`Track has been deleted from VK!`);
		}
	}

	//Reprder tracks in VK
	console.log(`Reordering tracks in VK...`);
	const vkNewList = (await vkApi.call("audio.get", {owner_id: client.id, count: 200})).items.reverse();
	for (let i = 0; i < inVKandYM.length; i++) {
		if (i === 0) continue;
		if (vkNewList[i].id === inVKandYM[i].id) continue;
		await vkApi.call("audio.reorder", {owner_id: inVKandYM[i].owner_id, audio_id: inVKandYM[i].id, before: inVKandYM[i-1].id});
		console.log(`Moved ${inVKandYM[i].artist} - ${inVKandYM[i].title} to position ${i}`);
	}
	
	console.log(`All done!`);
})()