import { Config } from "../config";

export async function sendTelegramNotification(
  payload: object
): Promise<boolean> {
  const botToken = Config.telegram_token;

  if (!botToken) {
    console.error("Telegram Bot Token is not configured.");
    return false;
  }
  // payload ที่รับเข้ามาควรจะมี chat_id, text, parse_mode อยู่แล้ว

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Telegram API result:", result); // 🪵 ตรวจสอบผลตอบกลับจริง
    return result.ok;
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
    return false;
  }
}
