import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// OpenAI client
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


let userThreads = {};


// Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { userId, message } = req.body;


        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }


        if (!userThreads[userId]) {
            const thread = await client.beta.threads.create();
            userThreads[userId] = thread.id;
        }

        const threadId = userThreads[userId];

        await client.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
        });

        //Ejecutar petición al asistente

        const myAssistant = await client.beta.threads.runs.create(threadId, {
            assistant_id: process.env.ASSISTANT_ID,
        });

        console.log("Ejecucion creada: ", myAssistant, "Status inicial: ", myAssistant.status);

        //Esperar a que la ejecucion termine

        let runStatus = myAssistant.status;
        let attempt = 0;
        const maxAttempts = 30;

        while (runStatus !== 'completed' && attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log('DEBUG: calling retrieve with threadId:', threadId, 'runId:', myAssistant.id);
            const run = await client.beta.threads.runs.retrieve(myAssistant.id, { thread_id: threadId });
            runStatus = run.status;
            attempt++;
            console.log("Intento" + attempt + "Status: " + runStatus);
        }

        if (runStatus !== 'completed') {
            console.log("Ejecucion no completada");
        }

        //Sacar los mensajes del thread
        const messages = await client.beta.threads.messages.list(threadId);

        console.log("Total de mensajes: ", messages.data.length);

        //Filtra los mensajes para obtener solo los del asistente
        const assistantMessages = messages.data.filter(message => message.role === 'assistant');

        console.log("Mensajes del asistente: ", assistantMessages);


        //Envia la respuesta al cliente
        const reply = assistantMessages.sort((a, b) => b.created_at - a.created_at)[0].content[0].text.value;
        console.log("Respuesta del asistente: ", reply);

        return res.json({ answer: reply });


    } catch (error) {
        console.error('OpenAI error:', error);
        return res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
