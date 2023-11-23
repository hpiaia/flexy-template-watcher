import { load } from "cheerio";
import { decode } from "html-entities";
import { serialize } from "object-to-formdata";

import { SESSION_TOKEN } from "./config";

export async function request(
  url: string,
  method: "get" | "post",
  body?: { template: { name: string; content: string } }
) {
  return fetch(url, {
    method,
    body: method === "post" && body ? serialize(body) : undefined,
    headers: { cookie: `FLEXYSESSID=${SESSION_TOKEN}` },
  }).then((res) => res.text());
}

export function scrapeTemplateContent(html: string) {
  const templateContent = load(html)("textarea#template_content").html();
  return decode(templateContent);
}
