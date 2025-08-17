# Contributing to EduAI Tutor

Thank you for your interest in contributing to EduAI Tutor! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 8+ or yarn
- Git
- Modern web browser
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/eduai-tutor.git
   cd eduai-tutor
   ```

2. **Set up the development environment**
   ```bash
   # Run the setup script
   node setup.cjs
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code formatting is handled by Prettier
- **Naming**: Use descriptive names for variables, functions, and components

### Component Guidelines

- **Functional Components**: Use functional components with hooks
- **Props Interface**: Define TypeScript interfaces for all props
- **Default Props**: Use default parameters instead of defaultProps
- **Error Boundaries**: Wrap components that might fail

```typescript
// Good component example
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  children,
  disabled = false
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### File Organization

```
src/
├── components/
│   ├── common/           # Reusable components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard-specific components
│   └── [feature]/       # Feature-specific components
├── hooks/               # Custom React hooks
├── services/            # API and external services
├── store/               # State management
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── database/            # Local database schemas
```

### State Management

- **Zustand**: Use Zustand for global state management
- **React Query**: Use for server state and caching
- **Local State**: Use useState for component-local state
- **Context**: Use sparingly, prefer Zustand for shared state

### Testing

- **Unit Tests**: Write tests for utility functions and hooks
- **Component Tests**: Test component behavior and user interactions
- **Integration Tests**: Test feature workflows
- **E2E Tests**: Test critical user journeys

```typescript
// Example test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🎯 Contribution Types

### Bug Fixes

1. **Search existing issues** to avoid duplicates
2. **Create an issue** if one doesn't exist
3. **Reference the issue** in your PR
4. **Include tests** that verify the fix

### New Features

1. **Discuss the feature** in an issue first
2. **Follow the existing patterns** and architecture
3. **Add comprehensive tests**
4. **Update documentation** as needed
5. **Consider accessibility** implications

### Documentation

- **README updates**: Keep setup instructions current
- **Code comments**: Document complex logic
- **API documentation**: Document new endpoints
- **Component docs**: Document props and usage

## 🔍 Code Review Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] No TypeScript errors
- [ ] No console errors or warnings
- [ ] Accessibility guidelines followed
- [ ] Performance impact considered

### Pull Request Guidelines

1. **Clear title**: Describe what the PR does
2. **Detailed description**: Explain the changes and why
3. **Link issues**: Reference related issues
4. **Screenshots**: Include for UI changes
5. **Testing notes**: Explain how to test the changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Accessibility tested

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated
```

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues**
2. **Try the latest version**
3. **Check the documentation**
4. **Reproduce the issue**

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 95]
- Node.js: [e.g., 18.0.0]
- npm: [e.g., 8.0.0]

## Additional Context
Screenshots, logs, etc.
```

## 💡 Feature Requests

### Before Requesting

1. **Check existing issues**
2. **Consider the scope** and impact
3. **Think about implementation**

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches considered

## Additional Context
Mockups, examples, etc.
```

## 🏗️ Architecture Guidelines

### Component Architecture

- **Single Responsibility**: Each component should have one clear purpose
- **Composition**: Prefer composition over inheritance
- **Props Interface**: Well-defined, typed interfaces
- **Error Handling**: Graceful error handling and fallbacks

### State Management

- **Local First**: Use local state when possible
- **Lift State Up**: Share state at the appropriate level
- **Immutable Updates**: Always update state immutably
- **Side Effects**: Handle side effects in useEffect or custom hooks

### Performance

- **Lazy Loading**: Code split large components
- **Memoization**: Use React.memo and useMemo appropriately
- **Bundle Size**: Monitor and optimize bundle size
- **Accessibility**: Ensure keyboard navigation and screen reader support

## 🔒 Security Guidelines

- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize user-generated content
- **CSRF Protection**: Implement CSRF tokens for forms
- **Secrets**: Never commit API keys or secrets
- **Dependencies**: Keep dependencies updated

## 📚 Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide)

### Tools
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com)

## 🤝 Community

- **Be Respectful**: Treat everyone with respect
- **Be Constructive**: Provide helpful feedback
- **Be Patient**: Remember that everyone is learning
- **Be Inclusive**: Welcome contributors of all backgrounds

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: support@yourdomain.com for urgent issues

## 🎉 Recognition

Contributors are recognized in:
- **README**: Listed in the contributors section
- **Releases**: Mentioned in release notes
- **Social Media**: Highlighted on project social accounts

Thank you for contributing to EduAI Tutor! Together, we're building the future of programming education. 🚀