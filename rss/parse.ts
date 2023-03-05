import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
	ignoreAttributes: false,
});

export function parse(xml: string) {
	return parser.parse(xml);
}
