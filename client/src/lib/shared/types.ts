import { z } from 'zod';

// create enum for categories with zod
export const CategorySchema = z.enum([
	'Apartment',
	'House',
	'Villa',
	'Penthouse',
	'Loft',
	'Cabin',
	'Condo',
	'Townhouse'
]);
