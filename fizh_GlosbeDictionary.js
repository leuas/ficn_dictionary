/* global api */
class fi_zh_Sanakirja {
    constructor(options) {
        this.options = options;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return '芬中词典';
        if (locale.indexOf('TW') != -1) return '芬中詞典';
        return 'Finnish-Chinese Dictionary';
    }

    setOptions(options) {
        this.options = options;
        this.maxexample = options.maxexample;
    }

    async findTerm(word) {
        this.word = word;
        let results = await this.findSanakirja(word);
        return results.filter(x => x);
    }

    async findSanakirja(word) {
        let notes = [];
        if (!word) return notes; // return empty notes

        const headers = {
            "Accept": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzIyNTk4Mjk1LCJqdGkiOiJkNGFhNzU5Mi02YjZjLTRiMDQtYTgwOS03YzIxMWVkZDg1MGQiLCJ0eXBlIjoiYWNjZXNzIiwiaWRlbnRpdHkiOnsidXNlcl9pZCI6IjViZWRlNjhmLTIxZmYtNDE3Ny1iZDBiLWU0YjU5NWNhM2I2NSIsImNsaWVudCI6IkdVNzdSeTRMWThhOEc3NElCZzAzQm5WMDhBNTQ2azY1IiwiY2xpZW50X25hbWUiOiJzYW5ha2lyamEifSwibmJmIjoxNzIyNTk4Mjk1LCJleHAiOjE3MjI2MDE4OTUsInVzZXJfY2xhaW1zIjp7Imhhc1ByZW1pdW1Db250ZW50Ijp0cnVlLCJzdGF0c1VzZXJUeXBlIjoidHJpYWwifX0.t2SVA6LeXdKAtvbex-JhMdYmLo1j65S7pViTNIOsSn8",
            "Content-Type": "application/json",
            "Cookie": "xxoo-tmp=en-US",
            "Ngsw-Bypass": "true",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
        };

        const api_url = "https://www.sanakirja.fi/api/search/api/sk/search";
        const params = {
            "keyword": word,
            "keyword_language": "fi",
            "target_language": "zh",
            "search_service": "ss",
            "dictionaries": "default",
            "mt_fallback": "true",
            "user_data": "true",
            "entry_langs": "true"
        };

        try {
            const response = await api.fetch(api_url, {
                method: 'GET',
                headers: headers,
                params: params
            });

            if (response.ok) {
                const data = await response.json();

                for (const entry of data.data) {
                    let definitions = [];

                    const expression = entry.index[0];
                    const pos = entry.pos.join(", ");

                    for (const sense of entry.senses) {
                        const sense_id = sense.id;
                        const created = sense.created;

                        let definition = `<span class='pos'>${pos}</span>`;
                        definition += `<span class='tran'>ID: ${sense_id} Created: ${created}</span>`;

                        let examples = sense.examples || [];
                        if (examples.length > 0 && this.maxexample > 0) {
                            definition += '<ul class="sents">';
                            for (const [index, example] of examples.entries()) {
                                if (index > this.maxexample - 1) break; // to control only 2 example sentence.
                                const example_text = example.text;
                                const example_created = example.created;

                                definition += `<li class='sent'><span class='eng_sent'>${example_text}</span><span class='chn_sent'>Created: ${example_created}</span></li>`;

                                let translations = example.translations || [];
                                for (const translation of translations) {
                                    const translation_text = translation.text;
                                    const ipa = translation.ipa.length > 0 ? translation.ipa[0].ipa : "";
                                    const audio_url = translation.audio || "";

                                    definition += `<li class='sent'><span class='eng_sent'>Translation: ${translation_text}</span><span class='chn_sent'>IPA: ${ipa}</span><span class='chn_sent'>Audio: ${audio_url}</span></li>`;
                                }
                            }
                            definition += '</ul>';
                        }
                        definition && definitions.push(definition);
                    }
                    let css = this.renderCSS();
                    notes.push({
                        css,
                        expression,
                        definitions
                    });
                }
            } else {
                console.error(`Failed to fetch data. Status code: ${response.status}`);
            }
        } catch (err) {
            console.error('Error fetching data: ', err);
        }
        return notes;
    }

    renderCSS() {
        let css = `
            <style>
                div.phrasehead{margin: 2px 0;font-weight: bold;}
                span.star {color: #FFBB00;}
                span.pos  {text-transform:lowercase; font-size:0.9em; margin-right:5px; padding:2px 4px; color:white; background-color:#0d47a1; border-radius:3px;}
                span.tran {margin:0; padding:0;}
                span.eng_tran {margin-right:3px; padding:0;}
                span.chn_tran {color:#0d47a1;}
                ul.sents {font-size:0.8em; list-style:square inside; margin:3px 0;padding:5px;background:rgba(13,71,161,0.1); border-radius:5px;}
                li.sent  {margin:0; padding:0;}
                span.eng_sent {margin-right:5px;}
                span.chn_sent {color:#0d47a1;}
            </style>`;
        return css;
    }
}
