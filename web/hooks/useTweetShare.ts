import { NetworkName, SUPPORTED_NETWORKS } from "@/utils/ethereum";
import { StrategiesWithProjects } from "./useStrategiesHandler";

export function useTweetShare(
  runId: string,
  strategies: StrategiesWithProjects,
  network: NetworkName,
  prompt: string
) {
  const selectedProjectsInfo = strategies
    .map((s, i) => {
      return {
        weight: s.weight ? s.weight?.toFixed(4) : 0,
        index: i,
        selected: s.selected && s.project.twitter,
      };
    })
    .filter((s) => s.selected);

  const weights = selectedProjectsInfo.map((s) => s.weight);
  const projects = selectedProjectsInfo.map((s) => s.index);
  const tweetHandles = strategies
    .filter((x) => x.project.twitter && x.selected)
    .map((x) => `@${x.project.twitter}`)
    .join("\n");
  const tweetText = `
Join me in supporting ${prompt} by donating to these projects on fundpublicgoods.ai!

${tweetHandles}

Link: https://dev.fundpublicgoods.ai/s/${runId}?network=${SUPPORTED_NETWORKS[network]}&weights=${weights}&projects=${projects}
`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;

  return tweetUrl;
}
