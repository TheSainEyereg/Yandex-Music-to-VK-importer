const {VK} = require("vk-io");
const {YMApi} = require("ym-api");
const {isSimilarByIncludingChunks, isSimilarByLevenshtein} = require("./algorithmic.js");
const {VKtoken, VKID, YMAuth} = require("./config.json");

const vkApi = new VK({token: VKtoken,}).api;
const ymApi = new YMApi();

function isSimilar(str1, str2) {
	//Split every string by ",", "&", "-", "and" and "feat."
	const str1Arr = str1.split(/[,&-]|and|feat\./g);
	const str2Arr = str2.split(/[,&-]|and|feat\./g);

	// Compare all words in str1Arr and str2Arr by levenshtein distance
	for (let i = 0; i < str1Arr.length; i++) {
		for (let j = 0; j < str2Arr.length; j++) {
			if (isSimilarByLevenshtein(str1Arr[i], str2Arr[j]) > 0.5) return true;
		}
	}

	return false;
}

(async () => {
	await ymApi.init({username: YMAuth.login, password: YMAuth.password});
	const ymList = await ymApi.getPlaylist("3");
	const vkList = await vkApi.call("audio.get", {owner_id: VKID, count: 200});

	const list = ymList.tracks.reverse();
	// Check every track in ymList to find similar tracks in vkList and if not found - add it
	for (let i = 0; i < list.length; i++) {
		const title = list[i].track.title;
		const artist = list[i].track.artists[0].name;
		if (!vkList.items.find(item =>
				(item.artist.toLowerCase().includes(artist.toLowerCase()) || isSimilar(item.artist, artist)) &&
				(item.title.toLowerCase().includes(title.toLowerCase()) || isSimilar(item.title, title))
			)) {
			console.log(`"${artist} - ${title}" missing!`);
			const vkSearch = await vkApi.call("audio.search", {q: artist + " - " + title, count: 200});
			if (!vkSearch.items.length) {console.log(`Can't find track!`); continue;}
			await vkApi.call("audio.add", {owner_id: vkSearch.items[0].owner_id, audio_id: vkSearch.items[0].id});
			console.log(`Track has been added!`);
		} //else console.log(`"${artist} - ${title}" present!`);
	}
})()