/* DEADLAB Commercial Backend — Cloudflare Worker + D1 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Secret',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { ...cors, 'Content-Type': 'application/json;charset=UTF-8' },
      });

    try {
      // 1. License Verification (Replaces public codes.json)
      if (path === '/api/verify' && request.method === 'POST') {
        const { code, device_id } = await request.json();
        const cleanCode = (code || '').trim().toUpperCase();
        if (!cleanCode) return json({ ok: false, error: '请输入兑换码 / Please enter license key' }, 400);

        const lic = await env.DB.prepare('SELECT * FROM licenses WHERE code = ?')
          .bind(cleanCode)
          .first();

        if (!lic) return json({ ok: false, error: '兑换码不存在 / Invalid license key' }, 404);
        if (lic.expires_at && lic.expires_at < Date.now()) {
          return json({ ok: false, error: '兑换码已过期 / License expired' }, 403);
        }

        const res = await env.DB.prepare(
          'UPDATE licenses SET used_count = used_count + 1 WHERE code = ? AND used_count < max_uses'
        )
          .bind(cleanCode)
          .run();

        if (!res.meta.changes) {
          return json({ ok: false, error: '该兑换码激活次数已达上限 / Activation limit reached' }, 403);
        }

        const token = await signToken(
          { code: lic.code, plan: lic.plan, did: device_id || 'web', exp: Date.now() + 30 * 86400 * 1000 },
          env.JWT_SECRET
        );

        return json({ ok: true, plan: lic.plan, token, remaining: lic.max_uses - lic.used_count - 1 });
      }

      // 2. Payment Webhook (Stripe / Lemon Squeezy / Mianbaoduo / Afdian)
      if (path === '/api/webhook/pay' && request.method === 'POST') {
        const secret = request.headers.get('X-Webhook-Secret') || url.searchParams.get('secret');
        if (secret !== env.WEBHOOK_SECRET) return json({ ok: false, error: 'Unauthorized' }, 401);

        const body = await request.json();
        const orderId = String(body.order_id || body.id || '');
        const plan = body.plan || 'pro';
        const email = body.email || '';
        const maxUses = plan === 'team' ? 5 : plan === 'pro' ? 2 : 1;

        if (!orderId) return json({ ok: false, error: 'Missing order_id' }, 400);

        const existing = await env.DB.prepare('SELECT code FROM licenses WHERE order_id = ?')
          .bind(orderId)
          .first();
        if (existing) return json({ ok: true, code: existing.code, duplicated: true });

        const newCode = `DL-${plan.toUpperCase()}-${randomHex(6)}`;
        await env.DB.prepare(
          'INSERT INTO licenses (code, plan, max_uses, used_count, order_id, buyer_email, created_at) VALUES (?, ?, ?, 0, ?, ?, ?)'
        )
          .bind(newCode, plan, maxUses, orderId, email, Date.now())
          .run();

        return json({ ok: true, code: newCode, plan, max_uses: maxUses });
      }

      // 3. Cloud Project Sync (Replaces localStorage-only storage)
      if (path === '/api/projects') {
        const auth = await verifyAuthHeader(request, env.JWT_SECRET);
        if (!auth) return json({ ok: false, error: '请先激活授权码 / License activation required' }, 401);

        if (request.method === 'GET') {
          const { results } = await env.DB.prepare(
            'SELECT id, title, payload_json, updated_at FROM projects WHERE license_code = ? ORDER BY updated_at DESC LIMIT 50'
          )
            .bind(auth.code)
            .all();
          return json({
            ok: true,
            projects: results.map((r) => ({ id: r.id, title: r.title, data: JSON.parse(r.payload_json), updated_at: r.updated_at })),
          });
        }

        if (request.method === 'POST') {
          const { id, title, data } = await request.json();
          const pid = id || `prj_${randomHex(8)}`;
          await env.DB.prepare(
            `INSERT INTO projects (id, license_code, title, payload_json, updated_at)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET title=excluded.title, payload_json=excluded.payload_json, updated_at=excluded.updated_at`
          )
            .bind(pid, auth.code, title || 'Untitled Sandbox', JSON.stringify(data), Date.now())
            .run();
          return json({ ok: true, id: pid });
        }
      }

      // 4. Team Blind Assessment: Create Room
      if (path === '/api/team/create' && request.method === 'POST') {
        const { project_name } = await request.json();
        const roomId = `rm_${randomHex(6)}`;
        const adminToken = `adm_${randomHex(12)}`;

        await env.DB.prepare(
          'INSERT INTO team_rooms (room_id, admin_token, project_name, status, created_at) VALUES (?, ?, ?, ?, ?)'
        )
          .bind(roomId, adminToken, project_name || 'Team Audit', 'open', Date.now())
          .run();

        return json({
          ok: true,
          room_id: roomId,
          admin_token: adminToken,
          invite_path: `/team.html?room=${roomId}`,
        });
      }

      // 5. Team Blind Assessment: Submit Vote
      if (path === '/api/team/submit' && request.method === 'POST') {
        const { room_id, voter_alias, role, levels, veto, note } = await request.json();
        const room = await env.DB.prepare('SELECT status FROM team_rooms WHERE room_id = ?').bind(room_id).first();
        if (!room) return json({ ok: false, error: '协作房间不存在 / Room not found' }, 404);
        if (room.status !== 'open') return json({ ok: false, error: '该评估已封盘 / Room locked' }, 403);

        await env.DB.prepare(
          'INSERT INTO team_votes (room_id, voter_alias, role, levels_json, veto_json, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(
            room_id,
            (voter_alias || 'Member').slice(0, 20),
            role || 'member',
            JSON.stringify(levels),
            JSON.stringify(veto || {}),
            (note || '').slice(0, 200),
            Date.now()
          )
          .run();

        return json({ ok: true });
      }

      // 6. Team Blind Assessment: Real-time Aggregation & Divergence Radar
      if (path === '/api/team/result' && request.method === 'GET') {
        const roomId = url.searchParams.get('room');
        const room = await env.DB.prepare('SELECT room_id, project_name, status FROM team_rooms WHERE room_id = ?')
          .bind(roomId)
          .first();
        if (!room) return json({ ok: false, error: 'Room not found' }, 404);

        const { results } = await env.DB.prepare(
          'SELECT voter_alias, role, levels_json, veto_json, note, created_at FROM team_votes WHERE room_id = ? ORDER BY created_at ASC'
        )
          .bind(roomId)
          .all();

        const keys = ['need', 'cap', 'econ', 'dist', 'dep', 'stam'];
        const votes = results.map((r) => ({
          alias: r.voter_alias,
          role: r.role,
          levels: JSON.parse(r.levels_json),
          veto: JSON.parse(r.veto_json),
          note: r.note,
        }));

        const avgLevels = {};
        const divergences = [];
        if (votes.length > 0) {
          for (const k of keys) {
            const vals = votes.map((v) => Number(v.levels[k] ?? 1));
            const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
            const min = Math.min(...vals);
            const max = Math.max(...vals);
            avgLevels[k] = Math.round(mean - 0.1);
            if (max - min >= 2) {
              divergences.push({ key: k, min, max, spread: max - min });
            }
          }
        }

        return json({
          ok: true,
          room,
          count: votes.length,
          avgLevels,
          divergences,
          votes,
        });
      }

      return json({ ok: false, error: 'Not Found' }, 404);
    } catch (err) {
      return json({ ok: false, error: err.message }, 500);
    }
  },
};

function randomHex(len) {
  const arr = new Uint8Array(Math.ceil(len / 2));
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, len).toUpperCase();
}

async function signToken(payload, secret) {
  const enc = new TextEncoder();
  const data = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  if (!secret) throw new Error('JWT_SECRET is not configured');
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
  return `${data}.${sig}`;
}

async function verifyAuthHeader(request, secret) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const enc = new TextEncoder();
  if (!secret) return null;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const sigBytes = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
  if (!valid) return null;
  const payload = JSON.parse(decodeURIComponent(escape(atob(data))));
  if (payload.exp && payload.exp < Date.now()) return null;
  return payload;
}
