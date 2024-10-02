import { AppAbility } from '../../casl/ability.factory/ability.factory';

export interface PolicyHandlerInterface {
	handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = PolicyHandlerInterface | PolicyHandlerCallback;
