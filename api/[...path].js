import app from "../server/server.js";

export default function handler(req, res) {
    return res.status(200).json({
        success: true,
        message: "Vercel catch-all function is working",
        url: req.url,
    });
}