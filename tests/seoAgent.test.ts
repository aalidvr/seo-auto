import test from 'node:test';
import assert from 'node:assert/strict';
import { AgentError, ModelGateway, SEOAgent, requireJson } from '../src/seoAgent.js';

test('json validation parses fenced JSON and rejects invalid JSON', () => {
  assert.deepEqual(requireJson('```json\n{"x":1}\n```'), { x: 1 });
  assert.throws(() => requireJson('{invalid'));
});

test('full matrix produces 15 reviews, 37 trace entries, and publish_allowed=false', async () => {
  const result = await new SEOAgent(new ModelGateway({ mock: true })).run({
    primary_keyword: 'سئو',
    content_type: 'blog',
  });
  assert.equal(Object.keys(result.review_matrix).length, 15);
  assert.equal(result.trace.length, 37);
  assert.equal(result.publish_allowed, false);
});

test('no approval bypass throws AgentError', async () => {
  await assert.rejects(
    () =>
      new SEOAgent(new ModelGateway({ mock: true })).run({
        primary_keyword: 'x',
        content_type: 'blog',
        human_approval_required: false,
      }),
    AgentError
  );
});

test('balanced and economy profiles return awaiting_human_approval', async () => {
  for (const profile of ['balanced', 'economy'] as const) {
    const result = await new SEOAgent(new ModelGateway({ mock: true }), profile).run({
      primary_keyword: 'x',
      content_type: 'blog',
    });
    assert.equal(result.status, 'awaiting_human_approval');
  }
});
