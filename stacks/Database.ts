import { InstanceClass, InstanceSize, InstanceType } from "aws-cdk-lib/aws-ec2";
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
} from "aws-cdk-lib/aws-rds";
import { StackContext, use } from "sst/constructs";
import { Networking } from "./Networking";

// La grandezza della macchina e lo storage allocato, in GiB, vanno scelti in base alle necessita'
const sizeMap: Record<string, any> = {
  dev: {
    instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
    allocatedStorage: 10,
    maxAllocatedStorage: 20,
  },
  prod: {
    instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MEDIUM),
    allocatedStorage: 10,
    maxAllocatedStorage: 100,
  },
};

export function Database({ stack }: StackContext) {
  const { vpc } = use(Networking);

  const size = sizeMap[stack.stage] || sizeMap.dev;

  const db = new DatabaseInstance(stack, "Database", {
    vpc,
    vpcSubnets: { subnets: vpc.isolatedSubnets },
    engine: DatabaseInstanceEngine.postgres({
      version: PostgresEngineVersion.VER_14,
    }),
    databaseName: "app",
    ...size,
  });

  return { db };
}
