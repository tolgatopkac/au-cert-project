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
	price: z.number().min(0, 'Property price must be a positive number'),
	propertyAddress: z.string().min(5, 'Property address is required'),
	images: z.url('Property images are required')
});

export type CreatePropertyFormData = z.infer<typeof CreatePropertyFormSchema>;

export const formData = $state<CreatePropertyFormData>({
	propertyTitle: '',
	description: '',
	category: CategorySchema.options[0],
	price: '',
	propertyAddress: '',
	images: ''
});

export const formUI = $state({
	loading: false,
	success: false,
	error: null as string | ZodTreeError | null,
	txHash: null
});

// Real-time validation
/* 	$effect(() => {
		validationErrors = {};
		
		if (formData.propertyTitle.length > 0 && formData.propertyTitle.length < 3) {
			validationErrors.propertyTitle = 'Title must be at least 3 characters';
		}
		
		if (formData.description.length > 0 && formData.description.length < 10) {
			validationErrors.description = 'Description must be at least 10 characters';
		}
		
		if (formData.price && (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0)) {
			validationErrors.price = 'Price must be a valid positive number';
		}
		
		if (formData.propertyAddress.length > 0 && formData.propertyAddress.length < 5) {
			validationErrors.propertyAddress = 'Address must be at least 5 characters';
		}

		if (formData.images && !isValidURL(formData.images)) {
			validationErrors.images = 'Please enter a valid image URL';
		}
	});
 */

// Check if form is valid

// Preview property data
/* 	let previewProperty = $derived(() => ({
		title: formData.propertyTitle || 'Property Title',
		description: formData.description || 'Property description will appear here...',
		category: formData.category,
		price: formData.price || '0',
		address: formData.propertyAddress || 'Property Address',
		image: formData.images || '',
		owner: walletState.address || '0x...',
		shortOwner: walletState.address ? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}` : '0x...1234'
	})); */

export async function createPropertyFormSubmit() {
	if (!walletState.isConnected) {
		formUI.error = 'Please connect your wallet first';
		return;
	}
	console.log('Submitting property form with data:', formData);

	// TODO: Validate form
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
	formData.price = '';
	formData.propertyAddress = '';
	formData.images = '';

	formUI.loading = false;
	formUI.success = false;
	formUI.error = null;
	formUI.txHash = null;
}
