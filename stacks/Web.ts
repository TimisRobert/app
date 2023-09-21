import { StackContext, SvelteKitSite, use } from "sst/constructs";
import { DNS } from "./DNS";
import { API } from "./API";

export function Web({ stack }: StackContext) {
  const { domain, zone } = use(DNS);
  const { url } = use(API);

  const web = new SvelteKitSite(stack, "Web", {
    path: "./packages/web",
    customDomain: {
      domainName: domain,
      hostedZone: zone,
    },
    bind: [url],
  });

  return { web };
}
