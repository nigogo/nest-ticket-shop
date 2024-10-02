import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
	AbilityFactory,
	AppAbility,
} from '../../casl/ability.factory/ability.factory';
import { PolicyHandler } from '../interfaces/policy.interface';
import { CHECK_POLICIES_KEY } from '../decorators/policy.decorator';

@Injectable()
export class AbilityGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private abilityFactory: AbilityFactory
	) {}

	canActivate(context: ExecutionContext): boolean {
		const policyHandlers =
			this.reflector.get<PolicyHandler[]>(
				CHECK_POLICIES_KEY,
				context.getHandler()
			) || [];

		const { user } = context.switchToHttp().getRequest();
		const ability = this.abilityFactory.defineAbility(user);

		return policyHandlers.every((handler) =>
			this.execPolicyHandler(handler, ability)
		);
	}

	private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
		if (typeof handler === 'function') {
			return handler(ability);
		}
		return handler.handle(ability);
	}
}
