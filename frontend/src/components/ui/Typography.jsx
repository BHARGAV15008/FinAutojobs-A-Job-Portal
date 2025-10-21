import React from 'react';
import { cn } from '../../utils/cn';

// Typography Components for FinAutoJobs

export const HeroHeading = ({ children, className, ...props }) => (
  <h1 className={cn("heading-hero", className)} {...props}>
    {children}
  </h1>
);

export const SectionHeading = ({ children, className, ...props }) => (
  <h2 className={cn("heading-section", className)} {...props}>
    {children}
  </h2>
);

export const CardHeading = ({ children, className, ...props }) => (
  <h3 className={cn("heading-card", className)} {...props}>
    {children}
  </h3>
);

export const JobTitle = ({ children, className, ...props }) => (
  <h3 className={cn("job-title", className)} {...props}>
    {children}
  </h3>
);

export const CompanyName = ({ children, className, ...props }) => (
  <span className={cn("company-name", className)} {...props}>
    {children}
  </span>
);

export const SalaryText = ({ children, className, ...props }) => (
  <span className={cn("salary-text", className)} {...props}>
    {children}
  </span>
);

export const BodyLarge = ({ children, className, ...props }) => (
  <p className={cn("body-large", className)} {...props}>
    {children}
  </p>
);

export const BodyRegular = ({ children, className, ...props }) => (
  <p className={cn("body-regular", className)} {...props}>
    {children}
  </p>
);

export const BodySmall = ({ children, className, ...props }) => (
  <p className={cn("body-small", className)} {...props}>
    {children}
  </p>
);

export const JobMeta = ({ children, className, ...props }) => (
  <span className={cn("job-meta", className)} {...props}>
    {children}
  </span>
);

export const NavBrand = ({ children, className, ...props }) => (
  <span className={cn("nav-brand", className)} {...props}>
    {children}
  </span>
);

export const NavLink = ({ children, className, ...props }) => (
  <span className={cn("nav-link", className)} {...props}>
    {children}
  </span>
);

export const FormLabel = ({ children, className, ...props }) => (
  <label className={cn("form-label", className)} {...props}>
    {children}
  </label>
);

export const FormHelper = ({ children, className, ...props }) => (
  <span className={cn("form-helper", className)} {...props}>
    {children}
  </span>
);

export const DashboardMetric = ({ children, className, ...props }) => (
  <span className={cn("dashboard-metric", className)} {...props}>
    {children}
  </span>
);

export const DashboardLabel = ({ children, className, ...props }) => (
  <span className={cn("dashboard-label", className)} {...props}>
    {children}
  </span>
);

// Button Text Components
export const ButtonPrimaryText = ({ children, className, ...props }) => (
  <span className={cn("btn-primary-text", className)} {...props}>
    {children}
  </span>
);

export const ButtonSecondaryText = ({ children, className, ...props }) => (
  <span className={cn("btn-secondary-text", className)} {...props}>
    {children}
  </span>
);

// Utility function to get font family classes
export const getFontFamily = (type = 'sans') => {
  const fontFamilies = {
    sans: 'font-sans',
    heading: 'font-heading',
    body: 'font-body',
    display: 'font-display',
  };
  return fontFamilies[type] || fontFamilies.sans;
};

// Utility function to get font weight classes
export const getFontWeight = (weight = 'normal') => {
  const fontWeights = {
    thin: 'font-thin',
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  };
  return fontWeights[weight] || fontWeights.normal;
};

export default {
  HeroHeading,
  SectionHeading,
  CardHeading,
  JobTitle,
  CompanyName,
  SalaryText,
  BodyLarge,
  BodyRegular,
  BodySmall,
  JobMeta,
  NavBrand,
  NavLink,
  FormLabel,
  FormHelper,
  DashboardMetric,
  DashboardLabel,
  ButtonPrimaryText,
  ButtonSecondaryText,
  getFontFamily,
  getFontWeight,
};
