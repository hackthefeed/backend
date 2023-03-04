import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser();

export function parse(xml: string) {
	return parser.parse(xml);
}
