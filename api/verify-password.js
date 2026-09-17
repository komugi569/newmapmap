// api/verify-password.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body;

  
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (password === correctPassword) {
    // 簡易的なトークンを返す(本当はJWTなどが望ましいが、まずはシンプルに)
    return res.status(200).json({ success: true, token: process.env.ADMIN_TOKEN });
  }

  return res.status(401).json({ success: false });
}