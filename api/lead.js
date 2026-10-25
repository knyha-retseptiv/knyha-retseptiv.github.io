module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method' });
    return;
  }
  var body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};
  var name = String(body.name || '').trim().slice(0, 80);
  var phone = String(body.phone || '').trim();
  var page = String(body.page || '').slice(0, 300);
  if (name.length < 2 || !/^\+380\d{9}$/.test(phone)) {
    res.status(400).json({ ok: false, error: 'invalid' });
    return;
  }
  var token = process.env.TELEGRAM_BOT_TOKEN;
  var chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    res.status(500).json({ ok: false, error: 'config' });
    return;
  }
  var text = 'Нова заявка: «150 Забутих рецептів»\n' +
    'Ім’я: ' + name + '\n' +
    'Телефон: ' + phone + '\n' +
    'Сторінка: ' + page;
  try {
    var r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text })
    });
    if (!r.ok) {
      res.status(502).json({ ok: false, error: 'telegram' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'network' });
  }
};
