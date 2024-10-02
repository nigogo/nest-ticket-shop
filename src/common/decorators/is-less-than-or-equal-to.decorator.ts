import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	isInt,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsLessThanOrEqualTo', async: false })
export class IsLessThanOrEqualToConstraint implements ValidatorConstraintInterface {
	validate(value: unknown, args: ValidationArguments) {
		const [relatedPropertyName] = args.constraints;
		const relatedValue = (args.object as { [key: string]: unknown })[relatedPropertyName];

		if (!isInt(value) || !isInt(relatedValue)) {
			return false;
		}

		// if (!(value <= relatedValue)) console.error('IsLessThanOrEqualTo constraint failed', value, args.property, 'but', relatedValue,  relatedPropertyName);
		return value <= relatedValue;
	}

	defaultMessage(args: ValidationArguments) {
		const [relatedPropertyName] = args.constraints;
		return `${args.property} must be less than or equal to ${relatedPropertyName}`;
	}
}

export function IsLessThanOrEqualTo(property: string, validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [property],
			validator: IsLessThanOrEqualToConstraint,
		});
	};
}
