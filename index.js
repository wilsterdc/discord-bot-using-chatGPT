require('dotenv/config')
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

client.on('ready', () => {
    console.log('The bot is online.');
});

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    let conversationLog = [{role: 'system', content: 'Dr. Vegapunk AI'}];

    try {
        await message.channel.sendTyping();

        let prevMessages = await message.channel.messages.fetch({ limit: 15 });
        prevMessages.reverse();

        prevMessages.forEach((msg) => {
            conversationLog.push({
                role: 'user',
                content: msg.content,
            });
        });

        const result = await openai
        .createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: conversationLog,
        })
        .catch((error) => {
            console.log(`OPENAI ERR: ${error}`);
        });
        
        message.reply(result.data.choices[0].message);
    } catch (error) {
        console.log(`ERR: ${error}`);
    }
});

client.login(process.env.BOT_TOKEN);