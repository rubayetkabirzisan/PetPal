// Import the class directly to access static methods
import { AuthService } from '../../services/AuthService';

describe('AuthService', () => {
	test('should authenticate user with valid credentials', async () => {
		const result = await AuthService.authenticate('validUser', 'validPassword');
		expect(result).toBe(true);
	});

	test('should not authenticate user with invalid credentials', async () => {
		const result = await AuthService.authenticate('invalidUser', 'invalidPassword');
		expect(result).toBe(false);
	});
});