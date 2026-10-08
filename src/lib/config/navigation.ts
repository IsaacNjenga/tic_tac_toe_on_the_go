import type { Component } from 'svelte';
import House from '@lucide/svelte/icons/house';
import Settings from '@lucide/svelte/icons/settings-2';

export type NavigationItem = {
	title: string;
	href: '/home' | '/settings';
	icon: Component;
};

export const navigationItems: NavigationItem[] = [
	{ title: 'Home', href: '/home', icon: House },
	{ title: 'Settings', href: '/settings', icon: Settings }
];
