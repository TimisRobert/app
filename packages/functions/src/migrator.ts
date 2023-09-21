import { up } from "@app/core/migrator";

export const handler = async () => {
  // TS e node 18 non vanno molto d'accordo su fetch
  // @ts-ignore
  const resp = await fetch(
    `http://localhost:2773/secretsmanager/get?secretId=${process.env.SECRET_ARN}`,
    {
      method: "GET",
      headers: {
        "X-Aws-Parameters-Secrets-Token": process.env.AWS_SESSION_TOKEN,
      },
    }
  );

  const secret = await resp.json();
  const { host, dbname, username, password } = JSON.parse(secret.SecretString);

  await up(`postgres://${username}:${password}@${host}/${dbname}`);
};
