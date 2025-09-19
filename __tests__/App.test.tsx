import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders main application component', () => {
	render(<App />);
	const linkElement = screen.getByText(/welcome to the app/i);
	expect(linkElement).toBeInTheDocument();
});

test('checks if button is clickable', () => {
	render(<App />);
	const buttonElement = screen.getByRole('button', { name: /click me/i });
	expect(buttonElement).toBeEnabled();
});