import { getConnection } from "typeorm";

export const deleteSchema = async (schema: any) => {
  await getConnection()
    .createQueryBuilder()
    .delete()
    .from(schema)
    .execute();
};
