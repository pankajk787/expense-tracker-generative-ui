import express from "express";
import cors from "cors";
import { agent } from "./agent.ts";
import type { StreamMessage } from "./types.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) =>{
    return res.json({ status: "Healthy", timeStamp: new Date().toISOString() })
});

app.post("/chat", async (req, res) => {
    /**
     * SSE:
     * 1. Send a special header
     * 2. Send data in special format
     */
    const body = req.body;
    res.writeHead(200, {
        "Content-Type": "text/event-stream"
    })

    const response = await agent.stream({
        messages: [
            {
                role: "user",
                content: body?.query
                // content: "Bought a Carrier AC worth 30000 on Jan 20 this year"
            }
        ]
    }, {
        streamMode: ["messages", "custom"],
        configurable: { thread_id: "1" } // Todo:  dynamically thread_id - chat id
    });

    for await (const [eventType, chunk] of response) {
        
        let message: StreamMessage = {} as StreamMessage;
        if(eventType === "custom") {
            message = chunk;
        } else if(eventType === "messages") {
            if(chunk[0].content === "") continue;
            const messageType = chunk[0].type;
            if(messageType === "ai") {
                message = { type: "ai", payload: { text: chunk[0].content as string } };
            } else if(messageType === "tool") {
                message = { type: "tool", payload: { name: chunk[0].name!, result: JSON.parse(chunk[0].content as string )} }
            }
        }
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${JSON.stringify(message)}\n\n`)
    }

    res.end();

    // setInterval(() => {
    //     // Sending data in the SSE protocol format
    //     res.write("event: ping\n") // Custom event
    //     res.write(`data: ${body?.query}\n\n`)
    // }, 2000);
})

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})