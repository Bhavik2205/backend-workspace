import { EntityTarget } from "typeorm";
import { DB } from "@configs";

const repositoryMap = new Map<any, Map<string, EntityTarget<any>>>();

export function InitRepository(entity: EntityTarget<any>) {
  return (target: any, propertyKey: string) => {
    if (!repositoryMap.has(target.constructor)) {
      repositoryMap.set(target.constructor, new Map());
    }

    const entityMap = repositoryMap.get(target.constructor);
    entityMap!.set(propertyKey, entity);
  };
}

export function InjectRepositories(target: any) {
  const entityMap = repositoryMap.get(target.constructor);
  if (!entityMap) return;

  // eslint-disable-next-line no-restricted-syntax
  for (const [propertyKey, entity] of entityMap) {
    const repository = DB.ds().getRepository(entity);
    // eslint-disable-next-line no-param-reassign
    target[propertyKey] = repository;
  }
}
