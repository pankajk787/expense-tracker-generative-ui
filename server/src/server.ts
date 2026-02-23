import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) =>{
    return res.json({ status: "Healthy", timeStamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})