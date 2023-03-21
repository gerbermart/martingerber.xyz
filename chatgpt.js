class ChatGPT {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    generateResponse(prompt) {
        const openai = require("@openai/api");
        const api = new openai(this.apiKey);

        const parameters = {
            "model": "text-davinci-002",
            "prompt": prompt,
            "temperature": 0.7,
            "max_tokens": 60,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0
        };

        return api.completions.create(parameters)
            .then(response => response.data.choices[0].text);
    }
}
