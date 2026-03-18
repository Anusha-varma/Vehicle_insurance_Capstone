import { Routes } from '@angular/router';
import { adminGuard } from './guards/role.guards';
import { customerGuard } from './guards/role.guards';	
import { claimOfficerGuard } from './guards/role.guards';
import { underwriterGuard } from './guards/role.guards';
export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./components/home/home').then((m) => m.HomeComponent),
	},
	{
		path: 'login',
		loadComponent: () =>
			import('./components/login/login').then((m) => m.LoginComponent),
	},
	{
		path: 'register',
		loadComponent: () =>
			import('./components/register/register').then((m) => m.RegisterComponent),
	},
	{
		path: 'customer',
		loadComponent: () =>
			import('./components/customer-dashboard/customer-dashboard').then((m) => m.CustomerDashboardComponent),
		canActivate: [customerGuard],
	},
	{
		path: 'admin',
		loadComponent: () =>
			import('./components/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
		canActivate: [adminGuard],
	},

	{
	       path: 'claim-officer',
	       loadComponent: () =>
		       import('./components/claim-officer-dashboard/claim-officer-dashboard').then((m) => m.ClaimOfficerDashboardComponent),
	       canActivate: [claimOfficerGuard],
	   },
	   {
	       path: 'underwriter',
	       loadComponent: () =>
		       import('./components/underwriter-dashboard/underwriter-dashboard').then((m) => m.UnderwriterDashboardComponent),
	       canActivate: [underwriterGuard],
	   },
	{
		path: 'policies',
		loadComponent: () =>
			import('./components/policies/policies').then((m) => m.PoliciesComponent),
	},
	{
		path: 'apply-policy/:policyId',
		loadComponent: () =>
			import('./components/apply-policy/apply-policy').then((m) => m.ApplyPolicyComponent),
	},
	{
		path: 'quote/:policyId',
		loadComponent: () =>
			import('./components/quote-form/quote-form').then((m) => m.QuoteFormComponent),
	},
	{
		path: 'claim/:subscriptionId',
		loadComponent: () =>
			import('./components/claim-form/claim-form').then((m) => m.ClaimFormComponent),
	},
	{ path: '**', redirectTo: '' },
];
