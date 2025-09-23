import mercadopago from 'mercadopago';
import dotenv from 'dotenv';

// Load local .env if present
dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

async function main() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    console.error('Please set MERCADOPAGO_ACCESS_TOKEN in your environment');
    process.exit(1);
  }
  // mercadopago package may export differently depending on env/packaging; normalize here
  const mp = (mercadopago && typeof mercadopago.configure === 'function')
    ? mercadopago
    : (mercadopago && mercadopago.default && typeof mercadopago.default.configure === 'function')
      ? mercadopago.default
      : null;

  if (!mp) {
    console.warn('mercadopago SDK does not expose configure(); will fallback to HTTP POST to create plan');
  } else {
    mp.configure({ access_token: token });
  }

  const plan = {
    reason: 'Plan Básico Veterinaria',
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: 15000
    },
    status: 'active'
  };

  try {
    // The SDK may expose preapproval_plan.create; if not, fallback to HTTP using global fetch when available
    if (mp && mp.preapproval_plan && typeof mp.preapproval_plan.create === 'function') {
      const res = await mp.preapproval_plan.create(plan);
      console.log('Created plan id:', res.body.id);
      console.log(JSON.stringify(res.body, null, 2));
    } else {
      let fetchFn = typeof fetch === 'function' ? fetch : null;
      if (!fetchFn) {
        try {
          const nf = await import('node-fetch');
          fetchFn = nf.default;
        } catch (e) {
          console.error('node-fetch is required in this environment. Install with: npm install node-fetch@2');
          process.exit(1);
        }
      }
      const response = await fetchFn('https://api.mercadopago.com/preapproval_plan', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(plan)
      });
      const body = await response.json();
      console.log('Created plan id:', body.id);
      console.log(JSON.stringify(body, null, 2));
    }
  } catch (e) {
    console.error('Failed to create preapproval plan', e?.message || e);
    if (e?.response?.body) console.error('response:', e.response.body);
    process.exit(1);
  }
}

main();
