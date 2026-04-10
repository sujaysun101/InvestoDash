export async function buildWebResearchSummary(
  companyName: string,
  founderName: string,
) {
  const companyQuery = encodeURIComponent(`${companyName} startup funding`);
  const founderQuery = encodeURIComponent(`${founderName} LinkedIn background`);

  if (process.env.SERPER_API_KEY) {
    const [companyResult, founderResult] = await Promise.all([
      fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.SERPER_API_KEY,
        },
        body: JSON.stringify({ q: `${companyName} startup funding`, num: 3 }),
      }).then((response) => response.json()),
      fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.SERPER_API_KEY,
        },
        body: JSON.stringify({ q: `${founderName} LinkedIn background`, num: 3 }),
      }).then((response) => response.json()),
    ]);

    const companySnippet =
      companyResult.organic?.[0]?.snippet ?? "No recent funding confirmation found.";
    const founderSnippet =
      founderResult.organic?.[0]?.snippet ??
      "Founder background could not be independently confirmed.";

    return `${companySnippet} ${founderSnippet}`.trim();
  }

  return `Public web context can be enriched with a search provider such as Serper or Exa. Suggested searches: https://www.google.com/search?q=${companyQuery} and https://www.google.com/search?q=${founderQuery}.`;
}
