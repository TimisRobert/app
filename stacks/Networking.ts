import { FckNatInstanceProvider } from "cdk-fck-nat";
import { StackContext } from "sst/constructs";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  Port,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";

export function Networking({ stack }: StackContext) {
  const natGatewayProvider = new FckNatInstanceProvider({
    instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
  });

  // La sottorete standard ha come indirizzo 10.0.0.0/16
  const vpc = new Vpc(stack, "Vpc", {
    subnetConfiguration: [
      { cidrMask: 24, name: "Public", subnetType: SubnetType.PUBLIC },
      {
        cidrMask: 24,
        name: "Private",
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
      {
        cidrMask: 24,
        name: "Isolated",
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
    ],
    natGatewayProvider,
    maxAzs: 2,
  });

  // Permettiamo alla sottorete privata di avere connessioni in uscita
  // tramite il NAT Gateway
  vpc.privateSubnets.forEach((privateSubnet) => {
    natGatewayProvider.connections.allowFrom(
      Peer.ipv4(privateSubnet.ipv4CidrBlock),
      Port.tcp(443)
    );
  });

  return {
    vpc,
  };
}
