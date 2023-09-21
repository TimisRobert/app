import { SSTConfig } from "sst";
import { DNS } from "./stacks/DNS";
import { Networking } from "./stacks/Networking";
import { Database } from "./stacks/Database";
import { API } from "./stacks/API";
import { Web } from "./stacks/Web";
import { Migrator } from "./stacks/Migrator";

export default {
  config(input) {
    const profiles: Record<string, string> = {
      dev: "Development",
      prod: "Production",
    };

    return {
      name: "app",
      // Modificare qui la regione
      region: "eu-central-1",
      // Aggiungiamo il profilo
      profile: profiles[input.stage || "dev"] || profiles.dev,
    };
  },
  stacks(app) {
    // Impostazioni di default per le lambda
    app.setDefaultFunctionProps({
      runtime: "nodejs18.x",
      architecture: "arm_64",
    });

    // Facciamo in modo che alcune risorse tipo S3 e tabelle Dynamo
    // vengano rimosse in automatico su Development
    if (app.stage !== "prod") {
      app.setDefaultRemovalPolicy("destroy");
    }

    // Evitiamo il deploy di cose che non servono in locale
    if (app.local) {
      app.stack(DNS).stack(API).stack(Web);
    } else {
      app
        .stack(DNS)
        .stack(Networking)
        .stack(Database)
        .stack(Migrator)
        .stack(API)
        .stack(Web);
    }
  },
} satisfies SSTConfig;
