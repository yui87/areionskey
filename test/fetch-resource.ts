/*
 * Tests for Fetch resource
 *
 * How to run the tests:
 * > npx cross-env TS_NODE_FILES=true TS_NODE_TRANSPILE_ONLY=true npx mocha test/fetch-resource.ts --require ts-node/register
 *
 * To specify test:
 * > npx cross-env TS_NODE_FILES=true TS_NODE_TRANSPILE_ONLY=true npx mocha test/fetch-resource.ts --require ts-node/register -g 'test name'
 */

process.env.NODE_ENV = 'test';

import * as assert from 'assert';
import * as childProcess from 'child_process';
import { async, startServer, signup, post, api, uploadFile, simpleGet, port, shutdownServer } from './utils';
import * as openapi from '@redocly/openapi-core';
import rndstr from 'rndstr';
import { randomUUID } from 'crypto';

// Request Accept
const ONLY_AP = 'application/activity+json';
const PREFER_AP = 'application/activity+json, */*';
const PREFER_HTML = 'text/html, */*';
const UNSPECIFIED = '*/*';

// Response Contet-Type
const AP = 'application/activity+json; charset=utf-8';
const JSON = 'application/json; charset=utf-8';
const HTML = 'text/html; charset=utf-8';

const CSP = `base-uri 'none'; default-src 'none'; script-src 'self' https://www.recaptcha.net/recaptcha/ https://www.gstatic.com/recaptcha/; img-src 'self' https: data: blob:; media-src 'self' https:; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src 'self' https:; manifest-src 'self'; connect-src 'self' data: blob: ws://misskey.local https://api.rss2json.com; frame-ancestors 'none'`;

describe('Fetch resource', () => {
	let p: childProcess.ChildProcess;

	let alice: any;
	let alicesPost: any;
	let image: any;
	let alicesPostImage: any;
	let video: any;
	let alicesPostVideo: any;
	let page: any;

	before(async () => {
		p = await startServer();
		alice = await signup({ username: 'alice' });
		alicesPost = await post(alice, {
			text: 'test'
		});
		//console.log('alicesPost', alicesPost);

		// upload image
		image = await uploadFile(alice);
		//console.log('image', image);

		// post image
		alicesPostImage = await post(alice, {
			text: 'image',
			fileIds: [ image.id ],
		});
		//console.log('alicesPostImage', alicesPostImage);

		// upload video
		video = await uploadFile(alice, 'anime.mp4');
		//console.log('video', video);

		// post video
		alicesPostVideo = await post(alice, {
			text: 'video',
			fileIds: [ video.id ],
		});
		//console.log('alicesPostVideo', alicesPostVideo);

		const pageRes = await api('pages/create', {
			title: '',
			name: rndstr(),
			summary: null,
			font: 'sans-serif',
			hideTitleWhenPinned: false,
			sensitive: false,
			alignCenter: false,
			content: [ { id: randomUUID(), type: 'text', text: 'Hello World!' } ],
			variables: [],
			eyeCatchingImageId :null,
		}, alice);
		page = pageRes.body;
		//console.log('page', page);
	});

	after(async () => {
		await shutdownServer(p);
	});

	describe('Common', () => {
		it('meta', async(async () => {
			const res = await api('meta', {
			});

			assert.strictEqual(res.status, 200);
		}));

		it('GET root', async(async () => {
			const res = await simpleGet('/');
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, HTML);
			assert.strictEqual(res.cspx, CSP);
		}));

		it('GET docs', async(async () => {
			const res = await simpleGet('/docs/ja-JP/about');
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, HTML);
			assert.strictEqual(res.cspx, CSP);
		}));

		it('GET api-doc', async(async () => {
			const res = await simpleGet('/api-doc');
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, HTML);
			assert.strictEqual(res.cspx, CSP);
		}));

		it('GET api.json', async(async () => {
			const res = await simpleGet('/api.json');
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, JSON);
		}));

		it('Validate api.json', async(async () => {
			const config = await openapi.loadConfig();
			const result = await openapi.bundle({
				config,
				ref: `http://localhost:${port}/api.json`
			});

			for (const problem of result.problems) {
				console.log(`${problem.message} - ${problem.location[0]?.pointer}`);
			}

			assert.strictEqual(result.problems.length, 0);
		}));

		it('GET info', async(async () => {
			const res = await simpleGet('/info');
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, HTML);
			assert.strictEqual(res.cspx, CSP);
		}));

		it('GET flush', async(async () => {
			const res = await simpleGet('/flush');
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, HTML);
			assert.strictEqual(res.cspx, CSP);
		}));

		it('GET page', (async () => {
			const res = await simpleGet(`/@alice/pages/${page.name}`);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, HTML);
			assert.strictEqual(res.cspx, CSP);
		}));

		it('GET embed', (async () => {
			const res = await simpleGet(`/notes/${alicesPostVideo.id}/embed`);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, HTML);
			assert.strictEqual(res.cspx, CSP);
		}));

		it('GET image', (async () => {
			const u = new URL(image.url);
			const res = await simpleGet(`${u.pathname}`);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, 'image/jpeg');
			assert.strictEqual(res.cspx, `default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'`);
		}));

		it('GET favicon.ico', async(async () => {
			const res = await simpleGet('/favicon.ico');
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, 'image/x-icon');
		}));

		it('GET apple-touch-icon.png', async(async () => {
			const res = await simpleGet('/apple-touch-icon.png');
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, 'image/png');
		}));
	});

	describe('/@:username', () => {
		it('Only AP => AP', async(async () => {
			const res = await simpleGet(`/@${alice.username}`, ONLY_AP);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, AP);
		}));

		it('Prefer AP => AP', async(async () => {
			const res = await simpleGet(`/@${alice.username}`, PREFER_AP);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, AP);
		}));

		it('Prefer HTML => HTML', async(async () => {
			const res = await simpleGet(`/@${alice.username}`, PREFER_HTML);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, HTML);
			assert.strictEqual(res.cspx, CSP);
		}));

		it('Unspecified => HTML', async(async () => {
			const res = await simpleGet(`/@${alice.username}`, UNSPECIFIED);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, HTML);
			assert.strictEqual(res.cspx, CSP);
		}));
	});

	describe('/users/:id', () => {
		it('Only AP => AP', async(async () => {
			const res = await simpleGet(`/users/${alice.id}`, ONLY_AP);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, AP);
		}));

		it('Prefer AP => AP', async(async () => {
			const res = await simpleGet(`/users/${alice.id}`, PREFER_AP);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, AP);
		}));

		it('Prefer HTML => Redirect to /@:username', async(async () => {
			const res = await simpleGet(`/users/${alice.id}`, PREFER_HTML);
			assert.strictEqual(res.status, 302);
			assert.strictEqual(res.location, `/@${alice.username}`);
		}));

		it('Undecided => AP', async(async () => {
			const res = await simpleGet(`/users/${alice.id}`, UNSPECIFIED);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, AP);
		}));
	});

	describe('/notes/:id', () => {
		it('Only AP => AP', async(async () => {
			const res = await simpleGet(`/notes/${alicesPost.id}`, ONLY_AP);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, AP);
		}));

		it('Prefer AP => AP', async(async () => {
			const res = await simpleGet(`/notes/${alicesPost.id}`, PREFER_AP);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, AP);
		}));

		it('Prefer HTML => HTML', async(async () => {
			const res = await simpleGet(`/notes/${alicesPost.id}`, PREFER_HTML);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, HTML);
			assert.strictEqual(res.cspx, CSP);
		}));

		it('Unspecified => HTML', async(async () => {
			const res = await simpleGet(`/notes/${alicesPost.id}`, UNSPECIFIED);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, HTML);
			assert.strictEqual(res.cspx, CSP);
		}));
	});

	describe('Feeds', () => {
		it('RSS', async(async () => {
			const res = await simpleGet(`/@${alice.username}.rss`, UNSPECIFIED);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, 'application/rss+xml; charset=utf-8');
		}));

		it('ATOM', async(async () => {
			const res = await simpleGet(`/@${alice.username}.atom`, UNSPECIFIED);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, 'application/atom+xml; charset=utf-8');
		}));

		it('JSON', async(async () => {
			const res = await simpleGet(`/@${alice.username}.json`, UNSPECIFIED);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.type, 'application/json; charset=utf-8');
		}));
	});
});
