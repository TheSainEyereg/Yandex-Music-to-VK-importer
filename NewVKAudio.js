class NewVKAudio {
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
		return await this.getFullSection(sections.catalog.default_section, "");
	}
}

module.exports = NewVKAudio;