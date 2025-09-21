class OpenAIAPI {
	static async generateResponse(userMessage, conversationHistory = []) {
		const apiKey = process.env.OPEN_ROUTER_KEY;
        if (!apiKey) {
            throw new Error("OpenAI API key is not set in environment variables.");
        }
		const endpoint = "https://openrouter.ai/api/v1/chat/completions";
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "openai/gpt-4.1-mini",
				messages: conversationHistory.concat([{ role: "user", content: userMessage }]),
				max_tokens: 150,
			}),
		});
		const responseData = await response.json();
		// Log the entire API response for debugging
		console.log("Response from OpenAI API:", responseData.choices[0].message);
		// Check if choices array is defined and not empty
		if (
			responseData.choices &&
			responseData.choices.length > 0 &&
			responseData.choices[0].message
		) {
			return responseData.choices[0].message.content;
		} else {
			// Handle the case where choices array is undefined or empty
			console.error("Error: No valid response from OpenAI API");
			return "Sorry, I couldn't understand that.";
		}
	}
}
module.exports = { OpenAIAPI };
