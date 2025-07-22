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

export const PropertySchema = z.object({
	owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	category: z.string(), // API'den gelen data CategorySchema enum'u match etmeyebilir
	price: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid price format'),
	productId: z.number().nonnegative(),
	reviewers: z.array(z.string()), // address[] reviewers
	reviews: z.array(z.string()), // string[] reviews
	image: z.string().url('Invalid image URL'),
	address: z.string().min(1, 'Address is required'),
	id: z.string(),
	shortOwner: z
		.string()
		.regex(/^0x[a-fA-F0-9]{4}\.\.\.[a-fA-F0-9]{4}$/, 'Invalid short address format')
});

export type Property = z.infer<typeof PropertySchema>;
