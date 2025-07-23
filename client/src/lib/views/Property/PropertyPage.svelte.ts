/* onst pageState = $state({
    loading: true,
    property: null,
    reviews: [],
    reviewStats: { averageRating: 0, totalReviews: 0 },
    error: null,
    userHasReviewed: false
}); */

import { PropertySchema } from '$lib/shared/types';
import z from 'zod/v4';

export const PageSchema = z.object({
	loading: z.boolean().default(true),
	property: z.nullable(PropertySchema).default(null),
	// TODO: Add review schema
	reviews: z.array(z.any()).default([]),
	reviewStats: z.object({
		averageRating: z.number().default(0),
		totalReviews: z.number().default(0)
	}),
	error: z.nullable(z.string()).default(null),
	userHasReviewed: z.boolean().default(false)
});

export type PageState = z.infer<typeof PageSchema>;

export const propertyPageState: PageState = $state({
	loading: true,
	property: null,
	reviews: [],
	reviewStats: { averageRating: 0, totalReviews: 0 },
	error: null,
	userHasReviewed: false
});
