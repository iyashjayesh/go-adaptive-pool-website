# go-adaptive-pool Website

This repository contains the documentation website for [go-adaptive-pool](https://github.com/iyashjayesh/go-adaptive-pool) - a production-grade adaptive worker pool for Go.

**Live Website:** [https://iyashjayesh.github.io/go-adaptive-pool-website/](https://iyashjayesh.github.io/go-adaptive-pool-website/)

## Tech Stack

- **Framework:** [Starlight](https://starlight.astro.build/) (Astro)
- **Deployment:** GitHub Pages (via GitHub Actions)
- **Package Manager:** pnpm

## Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iyashjayesh/go-adaptive-pool-website.git
   cd go-adaptive-pool-website
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

## Project Structure

- `src/content/docs/`: Contains all documentation content in Markdown/MDX.
- `src/content/docs/guides/`: Guides like Introduction, Getting Started, Configuration.
- `src/content/docs/reference/`: Technical references like Benchmarks and Comparison.
- `src/content/docs/blog/`: Blog posts.
- `astro.config.mjs`: Starlight configuration (sidebar, social links, etc.).

## Contributing

Documentation updates are welcome! Please open a Pull Request with your changes.