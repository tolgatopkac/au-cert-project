import { goto } from '$app/navigation';
import { PropertyService } from '$lib/services/propertyService';
import { CategorySchema } from '$lib/shared/types';
import { walletState } from '$lib/web3.svelte';
import { z } from 'zod/v4';

type ZodTreeError = {
	errors: string[];
	properties?: Record<string, { errors: string[] }>;
};

export const CreatePropertyFormSchema = z.object({
	propertyTitle: z.string().min(3, 'Property title is required'),
	description: z.string().min(10, 'Property description is required'),
	category: CategorySchema,
	price: z.number().min(0.1, 'Property price must be a positive number (0.1)'),
	propertyAddress: z.string().min(5, 'Property address is required'),
	images: z.url('Property images are required')
});

export type CreatePropertyFormData = z.infer<typeof CreatePropertyFormSchema>;

export const formData = $state<CreatePropertyFormData>({
	propertyTitle: '',
	description: '',
	category: CategorySchema.options[0],
	price: 0.0,
	propertyAddress: '',
	images: ''
});

export const formUI = $state({
	loading: false,
	success: false,
	error: null as string | ZodTreeError | null,
	txHash: null
});

export async function createPropertyFormSubmit() {
	if (!walletState.isConnected) {
		formUI.error = 'Please connect your wallet first';
		return;
	}
	console.log('Submitting property form with data:', formData);

	const validationResult = CreatePropertyFormSchema.safeParse(formData);
	if (!validationResult.success) {
		formUI.error = z.treeifyError(validationResult.error);
		console.log('Validation errors:', formUI.error);
		return;
	}

	try {
		formUI.loading = true;
		formUI.error = null;
		formUI.success = false;

		const result = await PropertyService.createProperty(formData);

		formUI.success = true;
		formUI.txHash = result.txHash;
		goto(`/my-properties`);
		createPropertyFormReset();
	} catch (error) {
		console.error('Failed to create property:', error);
		formUI.error = error instanceof Error ? error.message : 'Failed to create property';
	} finally {
		formUI.loading = false;
	}
}

export function createPropertyFormReset() {
	formData.propertyTitle = '';
	formData.description = '';
	formData.category = CategorySchema.options[0];
	formData.price = 0.0;
	formData.propertyAddress = '';
	formData.images = '';

	formUI.loading = false;
	formUI.success = false;
	formUI.error = null;
	formUI.txHash = null;
}
