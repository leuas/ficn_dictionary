class fizh_GlosbeDictionary {
    constructor() {
        this.baseUrl = 'https://glosbe.com/fi/zh/';
    }

    findTerm(word) {
        return new Promise(async (resolve, reject) => {
            if (!word) {
                reject('No word provided');
                return;
            }

            let url = this.baseUrl + encodeURIComponent(word);
            try {
                let response = await fetch(url);
                let data = await response.text();
                let parser = new DOMParser();
                let doc = parser.parseFromString(data, 'text/html');

                let results = this.parseResults(doc);
                resolve(results);
            } catch (error) {
                reject(error);
            }
        });
    }

    parseResults(doc) {
        let notes = [];
        function T(node) {
            return node ? node.innerText.trim() : '';
        }

        // Example of parsing logic based on the Glosbe structure
        let entries = doc.querySelectorAll('.translate-block') || [];
        for (const entry of entries) {
            let expression = T(entry.querySelector('.phrase'));
            let translation = T(entry.querySelector('.translate-result'));
            let definitions = [];
            let examples = entry.querySelectorAll('.example') || [];

            for (const example of examples) {
                let fiExample = T(example.querySelector('.fi-example'));
                let zhExample = T(example.querySelector('.zh-example'));
                definitions.push({
                    fi: fiExample,
                    zh: zhExample
                });
            }

            if (expression && translation) {
                notes.push({
                    expression,
                    translation,
                    definitions
                });
            }
        }

        return notes;
    }
}
