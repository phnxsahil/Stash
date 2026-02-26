# Contributing to Stash

Thank you for your interest in contributing to Stash! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started with GitHub Codespaces

The fastest way to start contributing:

1. Click "Code" → "Create codespace on main"
2. Wait for automatic setup (3-5 minutes)
3. Copy `.env.example` to `.env` and add your credentials
4. Start coding!

## 📋 Development Workflow

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/apple-music-integration`)
- `fix/` - Bug fixes (e.g., `fix/auth-loop-issue`)
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add Apple Music OAuth support
fix(player): resolve preview audio playback issue
docs(readme): update Codespaces setup instructions
```

## 🔄 Pull Request Process

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style guidelines

3. **Test your changes**
   ```bash
   # Frontend type check
   npm run type-check
   
   # Build verification
   npm run build
   
   # Run tests (if available)
   npm test
   ```

4. **Commit your changes** using conventional commits

5. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** with:
   - Clear description of changes
   - Screenshots for UI changes
   - Link to related issues
   - Completed PR checklist

7. **Address review feedback** and update your PR

8. **Merge** once approved by maintainers

## 💻 Code Style Guidelines

### TypeScript/React

- Use **TypeScript** for all new code
- Follow **functional components** with hooks
- Use **named exports** for components
- Keep components **small and focused** (< 200 lines)
- Add **proper TypeScript types** (avoid `any`)

**Example:**
```typescript
interface SongCardProps {
  song: Song;
  onDelete: (id: string) => void;
}

export function SongCard({ song, onDelete }: SongCardProps) {
  // Component logic
}
```

### Python/FastAPI

- Follow **PEP 8** style guide
- Use **type hints** for function parameters and returns
- Add **docstrings** for functions
- Keep functions **focused** (single responsibility)

**Example:**
```python
def download_audio(url: str) -> str | None:
    """
    Downloads audio from a video URL.
    
    Args:
        url: Video URL from Instagram, TikTok, or YouTube
        
    Returns:
        Path to downloaded audio file, or None if failed
    """
    # Function logic
```

### CSS/Tailwind

- Use **Tailwind utility classes** over custom CSS
- Follow **mobile-first** responsive design
- Use **design system colors** (Spotify green: #1DB954)
- Apply **glass-morphism** pattern for cards

## 🧪 Testing Requirements

Before submitting a PR:

- [ ] Code builds without errors (`npm run build`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] No console errors in browser
- [ ] Tested on mobile and desktop viewports
- [ ] Tested dark and light themes (if UI change)
- [ ] Backend endpoints tested with sample data

## 🎨 UI/UX Guidelines

- **Mobile-first**: Design for mobile, enhance for desktop
- **Accessibility**: Add ARIA labels, keyboard navigation
- **Loading states**: Show spinners/skeletons during async operations
- **Error states**: Display user-friendly error messages
- **Animations**: Use smooth transitions (150-300ms)
- **Visual feedback**: Provide hover/active states for interactive elements

## 📝 Documentation

When adding new features:

- Update `README.md` if user-facing
- Add inline code comments for complex logic
- Update API documentation for new endpoints
- Include examples in PR description

## 🐛 Bug Reports

When reporting bugs, include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Screenshots** (if applicable)
5. **Environment** (browser, OS, device)
6. **Console errors** (if any)

Use the bug report template when creating issues.

## 💡 Feature Requests

When suggesting features:

1. **Problem description** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **Alternatives considered** - Other approaches?
4. **Additional context** - Screenshots, mockups, examples

## 🔒 Security

- **Never commit** API keys, tokens, or credentials
- Use **environment variables** for sensitive data
- Follow **OAuth best practices** (PKCE flow)
- Implement **rate limiting** for public endpoints
- Validate and sanitize **user inputs**

## 📞 Getting Help

- **Questions?** Open a GitHub Discussion
- **Bugs?** Create an issue with the bug template
- **Features?** Create an issue with the feature template
- **Chat?** Join our Discord (if available)

## 🙏 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Stash! 🎵**
