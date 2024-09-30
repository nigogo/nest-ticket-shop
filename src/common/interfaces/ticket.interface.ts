import { EventInterface } from './event.interface';
import { UserInterface } from './user.interface';

export interface TicketInterface {
	id: number;
	purchase_time: Date;
	price_paid: number;
	event?: EventInterface;
	user?: UserInterface;
}