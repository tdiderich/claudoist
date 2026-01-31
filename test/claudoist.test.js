'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { test } = require('node:test');

const {
  initRepo,
  newAccount,
  newNote,
  ingestCall,
  processNextCalls,
  buildDashboard,
  updateNextCall,
  ensureNextCall,
  readText,
  formatDateLocal,
  formatRfc3339,
  loadCalendarMap,
  listAccountSlugs,
  pickAccountForEvent,
  formatEventTime,
  setScriptRootForTests,
  getScriptRoot,
  setGoogleApiForTests,
  loadCredentials,
  fetchEvents,
} = require('../claudoist');

const { makeTempDir, write, read, withCwd } = require('./helpers');

function scaffoldMinimalRepo(root) {
  const dirs = ['templates', 'prompts', 'schemas', 'scripts', 'playbooks', 'accounts', 'internal', 'data/public', 'data/private'];
  dirs.forEach((dir) => fs.mkdirSync(path.join(root, dir), { recursive: true }));

  write(path.join(root, 'templates', 'account.md'), '---\naccount: \"\"\n---\n');
  write(path.join(root, 'templates', 'todos.md'), '# Todos - {{account}}\n\n## Now\n- [ ] ...\n');
  write(path.join(root, 'templates', 'next_call.md'), '---\naccount: \"\"\ndate: YYYY-MM-DD\n---\n\n## Agenda\n\n## Notes\n');
  write(path.join(root, 'templates', 'note.md'), '---\ndate: YYYY-MM-DD\ntype: \"\"\n---\n\n## Raw notes\n');
  write(path.join(root, 'prompts', 'summarize_call.md'), 'Summarize');
  write(path.join(root, 'prompts', 'process_next_call.md'), 'Process');
  write(path.join(root, 'prompts', 'plan_agenda.md'), 'Plan');
  write(path.join(root, 'claudoist.config'), 'AGENT=manual\n');
}

test('initRepo creates scaffolded structure', () => {
  const root = makeTempDir();
  const fixture = makeTempDir();
  scaffoldMinimalRepo(fixture);

  const previousRoot = getScriptRoot();
  setScriptRootForTests(fixture);
  try {
    withCwd(fixture, () => {
      initRepo([root]);
    });

    assert.ok(fs.existsSync(path.join(root, 'templates', 'account.md')));
    assert.ok(fs.existsSync(path.join(root, 'prompts', 'summarize_call.md')));
    assert.ok(fs.existsSync(path.join(root, 'accounts')));
    assert.ok(fs.existsSync(path.join(root, 'data', 'public', 'README.md')));
  } finally {
    setScriptRootForTests(previousRoot);
  }
});

test('newAccount scaffolds account files', () => {
  const root = makeTempDir();
  scaffoldMinimalRepo(root);

  newAccount(root, ['acme', 'Acme', 'Co']);
  assert.ok(fs.existsSync(path.join(root, 'accounts', 'acme', 'account.md')));
  assert.ok(fs.existsSync(path.join(root, 'accounts', 'acme', 'todos.md')));
  assert.ok(fs.existsSync(path.join(root, 'accounts', 'acme', 'next_call.md')));

  const account = read(path.join(root, 'accounts', 'acme', 'account.md'));
  assert.ok(/account:\s+\"Acme Co\"/.test(account), account);
});

test('newNote creates dated note with optional type', () => {
  const root = makeTempDir();
  scaffoldMinimalRepo(root);

  newNote(root, ['acme', 'kickoff', 'call']);
  const dateStr = formatDateLocal(new Date());
  const notePath = path.join(root, 'accounts', 'acme', 'notes', `${dateStr}-kickoff.md`);
  assert.ok(fs.existsSync(notePath));
  const content = read(notePath);
  assert.ok(new RegExp(`date:\\s+${dateStr}`).test(content), content);
  assert.ok(content.includes('type: \"call\"'));
});

test('ingestCall prints fallback when agent is manual', () => {
  const root = makeTempDir();
  scaffoldMinimalRepo(root);
  const raw = path.join(root, 'raw.md');
  write(raw, 'notes');

  let output = '';
  const log = console.log;
  console.log = (msg) => {
    output += (msg || '') + '\\n';
  };
  try {
    ingestCall(root, ['acme', raw]);
  } finally {
    console.log = log;
  }

  assert.ok(output.includes('Next steps:'));
});

test('processNextCalls lists files when no agent configured', () => {
  const root = makeTempDir();
  scaffoldMinimalRepo(root);
  newAccount(root, ['acme', 'Acme']);

  let output = '';
  const log = console.log;
  console.log = (msg) => {
    output += (msg || '') + '\\n';
  };
  try {
    processNextCalls(root, []);
  } finally {
    console.log = log;
  }

  assert.ok(output.includes('Next-call files to process:'));
});

test('buildDashboard aggregates todos', () => {
  const root = makeTempDir();
  scaffoldMinimalRepo(root);
  newAccount(root, ['acme', 'Acme']);
  write(path.join(root, 'accounts', 'acme', 'todos.md'), '# Todos - Acme\n\n## Now\n- [ ] Task\n\n## Done\n- [x] Finished\n');

  buildDashboard(root, [path.join(root, 'TODOS.md')]);
  const content = read(path.join(root, 'TODOS.md'));
  assert.ok(content.includes('### Acme'));
  assert.ok(/- \[x\]\s+Acme\s+-\s+Finished/.test(content), content);
});

test('updateNextCall inserts agenda line', () => {
  const root = makeTempDir();
  scaffoldMinimalRepo(root);
  newAccount(root, ['acme', 'Acme']);
  const nextCall = ensureNextCall(root, 'acme', '2026-01-30', 'Acme');

  const event = {
    summary: 'Kickoff',
    start: { dateTime: '2026-01-30T15:00:00-05:00' },
  };
  updateNextCall(nextCall, event);
  const content = read(nextCall);
  assert.ok(content.includes('Kickoff'), content);
});

test('calendar helpers parse times and mapping', async () => {
  const root = makeTempDir();
  scaffoldMinimalRepo(root);
  newAccount(root, ['acme', 'Acme']);

  write(path.join(root, 'data', 'private', 'calendar_map.json'), JSON.stringify({
    attendees: { 'test@acme.com': 'acme' },
    domains: { 'acme.com': 'acme' },
    keywords: { 'Acme': 'acme' },
  }));

  const cmap = loadCalendarMap(root);
  assert.strictEqual(cmap.domains['acme.com'], 'acme');

  const event = {
    summary: 'Acme review',
    attendees: [{ email: 'test@acme.com' }],
    start: { dateTime: '2026-01-30T10:00:00-05:00' },
  };
  const when = formatEventTime(event);
  assert.ok(when instanceof Date);

  const prompt = { ask: async () => '' };
  const slug = await pickAccountForEvent(event, listAccountSlugs(root), cmap, prompt);
  assert.strictEqual(slug, 'acme');
});

test('formatRfc3339 includes timezone offset', () => {
  const date = new Date('2026-01-30T10:00:00-05:00');
  const formatted = formatRfc3339(date);
  assert.ok(/[-+][0-9]{2}:[0-9]{2}$/.test(formatted));
});

test('mocked OAuth + calendar fetch works without network', async () => {
  const root = makeTempDir();
  scaffoldMinimalRepo(root);

  const client = {
    installed: {
      client_id: 'client-id',
      client_secret: 'client-secret',
      redirect_uris: ['http://localhost:1234/oauth2callback'],
    },
  };
  write(path.join(root, 'data', 'private', 'google-oauth.json'), JSON.stringify(client, null, 2));
  write(
    path.join(root, 'data', 'private', 'google-token.json'),
    JSON.stringify({ access_token: 'token', refresh_token: 'refresh', expiry_date: Date.now() + 3600 * 1000 })
  );

  class FakeOAuth2 {
    constructor(id, secret, redirect) {
      this.id = id;
      this.secret = secret;
      this.redirect = redirect;
      this.credentials = {};
      this.handlers = {};
    }
    setCredentials(tokens) {
      this.credentials = tokens;
    }
    on(event, cb) {
      this.handlers[event] = cb;
    }
  }

  const fakeGoogle = {
    auth: {
      OAuth2: FakeOAuth2,
    },
    calendar: ({ auth }) => ({
      events: {
        list: async () => ({
          data: {
            items: [
              { summary: 'Test Event', start: { dateTime: '2026-01-30T10:00:00-05:00' } },
            ],
          },
        }),
      },
    }),
  };

  setGoogleApiForTests(fakeGoogle);
  try {
    const auth = await loadCredentials(root);
    assert.ok(auth.credentials.access_token === 'token');

    const start = new Date('2026-01-30T00:00:00-05:00');
    const end = new Date('2026-01-30T23:59:59-05:00');
    const events = await fetchEvents(root, start, end);
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].summary, 'Test Event');
  } finally {
    setGoogleApiForTests(null);
  }
});
