# Tokens in Generative AI

---

## What are Tokens in AI APIs?

---

Tokens are crucial fragments of ChatGPT API. Tokens are fragments or segments of words. Before processing prompts, the API breaks down the input into these individual tokens.

These tokens do not necessarily align exactly with the start or end of words — they can include trailing spaces and even sub-words.

- **Token limits:** Usually, requests can employ up to 4097 tokens shared between the prompt and completion, depending on the model. For instance, if your prompt consists of 4000 tokens, your completion can contain a maximum of 97 tokens. This limit is currently a technical constraint, but there are often creative ways to work within it, such as condensing your prompt or breaking the text into smaller chunks.

- **Token pricing:** The API provides various model types at different price points. Each model possesses a range of capabilities, with "gpt-3.5-turbo" being the most capable. Requests made to these different models have different prices. Detailed information regarding token pricing is available on the product API page.

- **Exploring tokens:** The API treats words based on their context in the corpus data. GPT-3 takes the prompt, converts the input into a list of tokens, processes the prompt, and then converts the predicted tokens back into the words as a response. Note that what may appear as two identical words are generated as different tokens depending on their structure within the text. For example, consider how the API generates token values for the word "red" based on its context.

---

## Token Tools

---

The most popular of all tools is the `OpenAI interactive tokenizer tool`. This tool helps calculate the number of tokens and observe how text is broken down into tokens.

Alternatively, if there is a need to tokenize text programmatically, use `Tiktoken`, a fast BPE tokenizer specifically designed for OpenAI models.

Other libraries include the `transformers` package for Python or the `gpt-3-encoder` package for Node.js.

---

## How to count tokens?

---

To count tokens for calling an OpenAI, follow these steps:

- Identify the API endpoint: Determine which endpoint of the OpenAI you plan to call.

- Each endpoint represents a specific function or resource that the API provides.

- Review the API documentation: Access the API documentation provided by the API provider. The documentation will outline the structure of the API requests and responses, including any required headers, parameters, or authentication methods.

- Check if API needs token-based authentication: Token-based authentication involves including an access token in the request header to authorize the API call. The token is typically obtained by registering an application with the API provider and following their authentication process.

- Obtain an access token: If token-based authentication is required, obtain an access token by following the authentication process specified by the API provider. This action may involve registering an application, providing credentials, and receiving a token.

- Count the tokens for each API: Once you have an access token, count it as one token for each API call you make. Each request to the API endpoint, including the access token in the header, counts as a single token.

- Track token usage: Keep track of the number of tokens you have used to ensure you stay within any usage limits or quotas the API provider sets. Some APIs may restrict the number of tokens you can use within a certain period.

---

## OpenAI guidelines for tokens count

---

As per the official document of OpenAI, below are the estimates for the token count:

- 1 token ~= 4 chars in English

- 1 token ~= ¾ words

- 100 tokens ~= 75 words

- 1-2 sentences ~= 30 tokens

- 1 paragraph ~= 100 tokens

- 1,500 words ~= 2048 tokens

---

## Example: Counting tokens for API calls

---

For example, you have an OpenAI endpoint that requires a GET request to retrieve a user's information. The endpoint has the following details:

- Request Method: GET

- Endpoint URL: `https://api.example.com/users/{userId}`

- Path Parameter: userId (value: "123")

- Query Parameter: includeAddress (value: true)

### Counting the tokens for this request

- The request method 'GET' typically requires 1 token.

- The endpoint URL doesn't consume additional tokens.

- The path parameter 'userId\’ with value '123' doesn't consume additional tokens.

- The query parameter 'includeAddress' with the value 'true' consumes 2 tokens (1 token for the parameter name and 1 token for the parameter value).

- Summing up the tokens from steps 1 to 4, the total token count for this API request would be 3 tokens.

**Note:** The exact method of counting tokens may vary depending on the specific API implementation or API provider. Consult the API documentation for accurate information on token usage and any associated costs or limitations.
