import { Configuration, OpenAIApi } from 'openai'

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, get, remove } from 'firebase/database'
import './style.css'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})


const appSettings = {
    databaseURL: `https://knowitall-openai-85d71-default-rtdb.firebaseio.com/`
}
const app = initializeApp(appSettings)
const database = getDatabase(app)
const conversationInDB = ref(database)

const openai = new OpenAIApi(configuration)

const chatbotConversation = document.getElementById('chatbot-conversation')
 
let conversationStr = ''

 
document.addEventListener('submit', (e) => {
    e.preventDefault()
    const userInput = document.getElementById('user-input')
    conversationStr += `${userInput.value} ->`
    console.log(conversationStr)   
    // push(conversationInDB, {
    //     role: 'user',
    //     content: userInput.value
    // })
    fetchReply()
    
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newSpeechBubble)
    newSpeechBubble.textContent = userInput.value
    userInput.value = ''
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
})

async function fetchReply(){
    const response = await openai.createCompletion({
        model:'davinci:ft-bird-branch-2023-06-02-19-16-05',
        prompt: conversationStr,
        presence_penalty:0,
        frequency_penalty:0.3,
        temperature:0,
        max_tokens: 100,
        stop:['\n', '->']
    })
    conversationStr += ` ${response.data.choices[0].text} \n`
    renderTypewriterText(response.data.choices[0].text)
    console.log(response)
    // get(conversationInDB).then(async snapshot => {
    //     if(snapshot.exists()){
    //        const conversationArr = Object.values(snapshot.val())
            
    //         // renderTypewriterText(response.data.choices[0].message.content)
    //         // push(conversationInDB, response.data.choices[0].message)
    //     } else {
    //         throw {messsage:'No data found'}
    //     }
    // })
    
    
}

function renderTypewriterText(text) {
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor')
    chatbotConversation.appendChild(newSpeechBubble)
    let i = 0
    const interval = setInterval(() => {
        newSpeechBubble.textContent += text.slice(i-1, i)
        if (text.length === i) {
            clearInterval(interval)
            newSpeechBubble.classList.remove('blinking-cursor')
        }
        i++
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    }, 50)
}

// document.getElementById('clear-btn').addEventListener('click', () => {
//     remove(conversationInDB)
//     chatbotConversation.innerHTML = '<div class="speech speech-ai">How can I help you?</div>'
// })

function renderConversationFromDb(){
    get(conversationInDB).then(async (snapshot)=>{
        if(snapshot.exists()) {
            Object.values(snapshot.val()).forEach(dbObj => {
                const newSpeechBubble = document.createElement('div')
                newSpeechBubble.classList.add(
                    'speech',
                    `speech-${dbObj.role === 'user' ? 'human' : 'ai'}`
                    )
                chatbotConversation.appendChild(newSpeechBubble)
                newSpeechBubble.textContent = dbObj.content
            })
            chatbotConversation.scrollTop = chatbotConversation.scrollHeight
        }
    })
}

renderConversationFromDb()