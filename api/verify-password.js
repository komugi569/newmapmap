export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body;
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (password === correctPassword) {
    return res.status(200).json({ success: true, token: process.env.ADMIN_TOKEN });
  }

  return res.status(401).json({ success: false });
}