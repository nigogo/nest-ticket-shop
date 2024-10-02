import {
	AbilityBuilder,
	AbilityClass,
	ExtractSubjectType,
	InferSubjects,
	PureAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Ticket } from '../../tickets/ticket.entity';
import { Event } from '../../events/event.entity';
import { UserType } from '../../users/user.entity';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subjects = InferSubjects<typeof Event | typeof Ticket> | 'all';

export type AppAbility = PureAbility<[Actions, Subjects]>;

@Injectable()
export class AbilityFactory {
	defineAbility(user: { role: UserType }) {
		const { can, build } = new AbilityBuilder<
			PureAbility<[Actions, Subjects]>
		>(PureAbility as AbilityClass<AppAbility>);

		if (user.role === 'admin') {
			can('manage', Event);
		} else if (user.role === 'user') {
			can('read', Event);
			can('create', Ticket);
		}

		return build({
			detectSubjectType: (item) =>
				item.constructor as ExtractSubjectType<Subjects>,
		});
	}
}
