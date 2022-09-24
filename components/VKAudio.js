class VKAudio {
	constructor(vkApi) {
		this.api = vkApi;
	}
	
	async getFullSection(section_id, start_from) {
		console.log(start_from ? "Next section: "+start_from : "Section: "+section_id);
	
		const section = await this.api.call("catalog.getSection", {section_id, start_from});
		return section.section.next_from ? [...section.audios, ...await this.getFullSection(section_id, section.section.next_from)] : section.audios;
	}

	async getAudioList(id) {
		const sections = await this.api.call("catalog.getAudio", {owner_id: id});
		return await this.getFullSection(sections.catalog.default_section);
	}
	
	
	async getOldAudioList(id, offset = 0) { //Requires VK UserAgent
		const res = await this.api.call("audio.get", {owner_id: id, count: 200, offset});
		return res.items.length + offset == res.count ? res.items : [...res.items, ...await this.getOldAudioList(id, offset+200)]
	}
}

module.exports = VKAudio;
