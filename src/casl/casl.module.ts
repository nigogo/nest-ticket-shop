import { Module } from '@nestjs/common';
import { AbilityFactory } from './ability.factory/ability.factory';

@Module({
	providers: [AbilityFactory],
	exports: [AbilityFactory],
})
export class CaslModule {
}
