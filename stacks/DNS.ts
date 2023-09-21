import { HostedZone } from "aws-cdk-lib/aws-route53";
import { StackContext } from "sst/constructs";

const zoneMap: Record<string, string> = {
  dev: "dev.roberttimisapp.com",
  prod: "roberttimisapp.com",
};

export function DNS({ stack }: StackContext) {
  const zone = zoneMap[stack.stage] || zoneMap.dev;
  const domain = zoneMap[stack.stage] || `${stack.stage}.${zoneMap.dev}`;
  const hostedZone = HostedZone.fromLookup(stack, "HostedZone", {
    domainName: zone,
  });

  return { zone, domain, hostedZone };
}
