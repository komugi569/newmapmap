export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("受け取ったpassword:", JSON.stringify(req.body?.password));
  console.log("環境変数ADMIN_PASSWORD:", JSON.stringify(process.env.ADMIN_PASSWORD));

  const { password } = req.body;
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (password === correctPassword) {
    return res.status(200).json({ success: true, token: process.env.ADMIN_TOKEN });
  }

  return res.status(401).json({ success: false });
}