import { getJson } from '../misc/fetch';
import { query as urlQuery } from '../prelude/url';

type ILink = {
	href: string;
	rel?: string;
	type?: string;
	template?: string;
};

type IWebFinger = {
	links: ILink[];
	subject: string;
};

export default async function(query: string): Promise<IWebFinger> {
	const url = genUrl(query);

	return await getJson(url, 'application/jrd+json, application/json');
}

function genUrl(query: string) {
	if (query.match(/^https?:\/\//)) {
		const u = new URL(query);
		return `${u.protocol}//${u.hostname}/.well-known/webfinger?` + urlQuery({ resource: query });
	}

	const m = query.match(/^([^@]+)@(.*)/);
	if (m) {
		const hostname = m[2];
		return `https://${hostname}/.well-known/webfinger?` + urlQuery({ resource: `acct:${query}` });
	}

	throw new Error(`Invalid query (${query})`);
}
