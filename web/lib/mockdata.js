const SOURCES = ['billing.cbl', 'copybooks/rates.cpy', 'jobs/nightly_invoice.jcl',
  'jobs/monthly_close.jcl', 'jobs/tax_report.jcl', 'jobs/backup.jcl'];
const BASE = new URL('../../mock/', import.meta.url);

async function read(path, optional = false) {
  try {
    const response = await fetch(new URL(path, BASE), { cache: 'no-store' });
    if (!response.ok) {
      if (optional) return null;
      throw new Error(`Could not load mock/${path} (HTTP ${response.status}).`);
    }
    return await response.text();
  } catch (error) {
    if (optional) return null;
    throw new Error(`Could not load mock/${path}. Serve the project with an HTTP server.`, { cause: error });
  }
}

function json(text, path, optional = false) {
  if (text === null) return null;
  try { return JSON.parse(text); }
  catch {
    if (optional) return null;
    throw new Error(`Invalid JSON in mock/${path}.`);
  }
}

function customers(text) {
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const header = lines.shift().split(',').map(value => value.trim());
  const required = ['customer_id', 'name', 'category', 'monthly_amount'];
  if (!required.every(key => header.includes(key))) throw new Error('Invalid customer CSV headers.');
  return lines.filter(line => line.trim()).map((line, index) => {
    const cells = line.split(',').map(value => value.trim());
    const row = Object.fromEntries(header.map((key, i) => [key, cells[i]]));
    const category = Number(row.category), amount = Number(row.monthly_amount);
    if (cells.length !== header.length || !row.customer_id || !row.category
      || !Number.isInteger(category) || !Number.isFinite(amount)) {
      throw new Error(`Invalid customer CSV row ${index + 2}.`);
    }
    return { customer_id: row.customer_id, name: row.name, category, monthly_amount: amount };
  });
}

export async function loadMock() {
  const paths = [...SOURCES, 'customers.csv', 'last_changed.json', 'policy.json',
    'change.diff', 'test_result.json'];
  const results = await Promise.all(paths.map(path => read(path,
    path === 'change.diff' || path === 'test_result.json')));
  const loaded = Object.fromEntries(paths.map((path, i) => [path, results[i]]));
  return {
    files: Object.fromEntries(SOURCES.map(path => [path, loaded[path]])),
    customers: customers(loaded['customers.csv']),
    policy: json(loaded['policy.json'], 'policy.json'),
    lastChanged: json(loaded['last_changed.json'], 'last_changed.json'),
    diff: loaded['change.diff'],
    testResult: json(loaded['test_result.json'], 'test_result.json', true),
  };
}
