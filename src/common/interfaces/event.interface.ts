import { TicketInterface } from './ticket.interface';

export interface EventInterface {
	id: number;
	name: string;
	date: Date;
	location: string;
	total_tickets: number;
	available_tickets: number;
	ticket_price: number;
}