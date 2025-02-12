# Contributing to Mk Notes

First off, thank you for considering contributing to Mk Notes!

## Reporting bugs

If you find a bug, please open an issue on [GitHub](https://github.com/Myastr0/mk-notes/issues) with as much detail as possible. Include steps to reproduce the issue, the expected result, and the actual result.

## Code contribution

If you have an idea for an improvement or want to fix a bug, please open an Pull Request on [GitHub](https://github.com/Myastr0/mk-notes/pulls) and describe your changes in detail.

Explain why you think it would be a good addition to the project.

Follow these instruction to contribute to the project:

### Submitting Pull Requests

1. **Fork the repository**: Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**:

   ```sh
   git clone https://github.com/your-username/mk-notes.git
   cd mk-notes
   ```

3. **Create a new branch**:

   ```sh
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**: Implement your changes in the codebase.

5. **Commit your changes**:

   ```sh
   git commit -m "feat: add your feature"
   ```

6. **Push to your fork**:

   ```sh
   git push origin feature/your-feature-name
   ```

7. **Open a pull request**: Go to the [original repository](https://github.com/Myastr0/mk-notes/pulls) and click the "New pull request" button.
   Select your branch from the dropdown and submit the pull request.

### Coding Standards

- Follow the existing code style.
- Write clear, concise commit messages.
- Ensure your code passes all tests and lint checks.

### Installation

On first make sure you installed all dependencies by running:

```sh
yarn install
```

### Run CLI locally

To run the CLI locally, use the following command:

```sh
yarn cli <command>
```

### Contribution to documentation

If you want to contribute to the documentation, you can find the markdown files in the `docs` folder.

First install dependencies inside the `docs` folder:

```sh
cd docs
yarn install
```

Then you can run the documentation from the root directory:

```sh
yarn doc:serve
```

### Running Tests

To run the tests, use the following command:

```sh
yarn test
```

### Linting

To run the linter, use the following command:

```sh
yarn lint
```

Thank you for contributing!
