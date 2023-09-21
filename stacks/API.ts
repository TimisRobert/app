import { Config, StackContext, dependsOn, use } from "sst/constructs";
import { Service } from "sst/constructs";
import { LinuxParameters } from "aws-cdk-lib/aws-ecs";
import { Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Secret as ECSSecret } from "aws-cdk-lib/aws-ecs";
import { DNS } from "./DNS";
import { Networking } from "./Networking";
import { Database } from "./Database";
import { Migrator } from "./Migrator";

// La grandezza della macchina va scelta in base alle necessita'
const sizeMap: Record<string, any> = {
  dev: { cpu: "0.25 vCPU", memory: "0.5 GB" },
  prod: { cpu: "1 vCPU", memory: "2 GB" },
};

export function API({ stack, app }: StackContext) {
  // Evitiamo di fare il deploy di risorse che da locale non usiamo
  if (app.local) {
    const url = new Config.Parameter(stack, "API_URL", {
      value: "http://localhost:3000",
    });

    return { url };
  }

  const { domain, zone } = use(DNS);
  const { db } = use(Database);
  const { vpc } = use(Networking);
  // Aspettiamo che le migrazioni siano state eseguite
  dependsOn(Migrator);

  const sg = new SecurityGroup(stack, "ServiceSecurityGroup", {
    vpc,
  });

  // Permettiamoci di collegarci al database
  sg.connections.allowTo(db, Port.tcp(5432));

  const size = sizeMap[stack.stage] || sizeMap.dev;

  const api = new Service(stack, "API", {
    file: "./packages/api/Dockerfile",
    customDomain: {
      domainName: `api.${domain}`,
      hostedZone: zone,
    },
    cdk: {
      vpc,
      applicationLoadBalancerTargetGroup: {
        healthCheck: { path: "/health" },
      },
      fargateService: {
        securityGroups: [sg],
      },
      container: {
        environment: {
          NODE_ENV: "production",
        },
        // Recuperiamo le credenziali direttamente da secret manager
        secrets: {
          DB_HOST: ECSSecret.fromSecretsManager(db.secret!, "host"),
          DB_NAME: ECSSecret.fromSecretsManager(db.secret!, "dbname"),
          DB_USER: ECSSecret.fromSecretsManager(db.secret!, "username"),
          DB_PASSWORD: ECSSecret.fromSecretsManager(db.secret!, "password"),
        },
        // Node non e' felice di esser eseguito come pid 1
        linuxParameters: new LinuxParameters(stack, "LinuxParameters", {
          initProcessEnabled: true,
        }),
      },
    },
    ...size,
  });

  const url = new Config.Parameter(stack, "API_URL", {
    value: api.customDomainUrl ?? api.url ?? "",
  });

  return { url };
}
