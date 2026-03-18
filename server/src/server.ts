import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) =>{
    return res.json({ status: "Healthy", timeStamp: new Date().toISOString() })
});

app.post("/chat", (req, res) => {
    /**
     * SSE:
     * 1. Send a special header
     * 2. Send data in special format
     */
    const body = req.body;
    res.writeHead(200, {
        "Content-Type": "text/event-stream"
    })

    setInterval(() => {
        // Sending data in the SSE protocol format
        res.write("event: ping\n") // Custom event
        res.write(`data: ${body?.query}\n\n`)
    }, 2000);
})

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})