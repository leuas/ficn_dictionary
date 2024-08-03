const axios = require('axios');
class finnZhDictionary {
    constructor() {
        this.apiUrl = "https://www.sanakirja.fi/api/search/api/sk/search";
        this.headers = {
            "Accept": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzIyNjcxMDQ0LCJqdGkiOiJjYmExZDJmOC01NzA3LTRlN2QtYTEwYi0yZDNiNjExOWQ2MzUiLCJ0eXBlIjoiYWNjZXNzIiwiaWRlbnRpdHkiOnsidXNlcl9pZCI6IjViZWRlNjhmLTIxZmYtNDE3Ny1iZDBiLWU0YjU5NWNhM2I2NSIsImNsaWVudCI6IkdVNzdSeTRMWThhOEc3NElCZzAzQm5WMDhBNTQ2azY1IiwiY2xpZW50X25hbWUiOiJzYW5ha2lyamEifSwibmJmIjoxNzIyNjcxMDQ0LCJleHAiOjE3MjI2NzQ2NDQsInVzZXJfY2xhaW1zIjp7Imhhc1ByZW1pdW1Db250ZW50Ijp0cnVlLCJzdGF0c1VzZXJUeXBlIjoidHJpYWwifX0.zreNLBCeOvXBoE6E1TN2gf4DfhXfXEkoOldIIcZXbEo",
            "Content-Type": "application/json",
            "Cookie": "xxoo-tmp=en-US",
            "Ngsw-Bypass": "true",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
        };
    }

    findTerm(word) {
        return new Promise((resolve, reject) => {
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

            axios.get(this.apiUrl, { headers: this.headers, params })
                .then(response => {
                    if (response.status === 200) {
                        const data = response.data;

                        const translations = data.data.map(entry => {
                            const word = entry.index[0];
                            const pos = entry.pos.join(", ");

                            return entry.senses.map(sense => {
                                const senseId = sense.id;
                                const created = sense.created;

                                return sense.examples.map(example => {
                                    const exampleText = example.text;
                                    const exampleCreated = example.created;

                                    return example.translations.map(translation => ({
                                        translationText: translation.text,
                                        ipa: translation.ipa && translation.ipa.length > 0 ? translation.ipa[0].ipa : "",
                                        audioUrl: translation.audio
                                    }));
                                });
                            });
                        });

                        resolve(translations.flat(3));  // Flatten the array to get all translations
                    } else {
                        reject(`Failed to fetch data. Status code: ${response.status}`);
                    }
                })
                .catch(error => {
                    reject("Error fetching data:", error);
                });
        });
    }
}

// Example usage:
const dictionary = new finnZhDictionary();
dictionary.findTerm("mies").then(translations => {
    translations.forEach(translation => {
        console.log(`Translation: ${translation.translationText}`);
        console.log(`IPA: ${translation.ipa}`);
        console.log(`Audio URL: ${translation.audioUrl}`);
        console.log();  // 分隔翻译
    });
}).catch(error => {
    console.error(error);
});
