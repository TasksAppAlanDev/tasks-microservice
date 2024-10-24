import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DB_NAME: string;
  DB_PASSWORD: string;
  DB_USER: string;
  DB_HOST: string;
  DB_PORT: number;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    DB_NAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_USER: joi.string().required(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error {error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  DB_NAME: envVars.DB_NAME,
  DB_PASSWORD: envVars.DB_PASSWORD,
  DB_USER: envVars.DB_USER,
  DB_HOST: envVars.DB_HOST,
  DB_PORT: envVars.DB_PORT,
};
