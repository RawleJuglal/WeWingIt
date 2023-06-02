import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)
// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2


const handler = async (event) => {
  try {
    const response = await openai.createCompletion({
      model:'davinci:ft-bird-branch-2023-06-02-19-16-05',
      prompt: event.body,
      presence_penalty:0.3,
      frequency_penalty:0,
      temperature:0,
      max_tokens: 100,
      stop:['\n', '->']
  })
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        reply: response.data
      }),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
