import { Script, StackContext, use } from "sst/constructs";
import { Database } from "./Database";
import { Networking } from "./Networking";
import {
  ParamsAndSecretsLayerVersion,
  ParamsAndSecretsVersions,
} from "aws-cdk-lib/aws-lambda";
import { Port } from "aws-cdk-lib/aws-ec2";

export function Migrator({ stack }: StackContext) {
  const { vpc } = use(Networking);
  const { db } = use(Database);

  const script = new Script(stack, "Migrator", {
    onCreate: "./packages/functions/src/migrator.handler",
    onUpdate: "./packages/functions/src/migrator.handler",
    defaults: {
      function: {
        // Ci attacchiamo alla VPC per comunicare con il database
        vpc,
        vpcSubnets: { subnets: vpc.privateSubnets },
        // Usiamo un layer particolare per poter recuperare i secret comodamente
        paramsAndSecrets: ParamsAndSecretsLayerVersion.fromVersion(
          ParamsAndSecretsVersions.V1_0_103
        ),
        // Aggiungiamo i file necessari per la migrazione.
        copyFiles: [
          {
            from: "./packages/core/drizzle",
            // Questo e' il motivo del path precedente
            to: "./drizzle",
          },
        ],
        environment: {
          // Specifichiamo l'ARN (identificativo) del segreto contenente le credenziali
          SECRET_ARN: db.secret!.secretArn,
        },
      },
    },
  });

  // Permettiamo alle funzioni di collegarsi al database
  script.createFunction!.connections.allowTo(db, Port.tcp(5432));
  script.updateFunction!.connections.allowTo(db, Port.tcp(5432));

  // Permettiamo alle funzioni di leggere il segreto
  db.secret!.grantRead(script.createFunction!);
  db.secret!.grantRead(script.updateFunction!);

  return { script };
}
