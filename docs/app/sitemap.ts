import type { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

// Required for static export
export const dynamic = 'force-static'

const BASE_URL = 'https://www.mk-notes.io' // Update this to your actual domain

/**
 * Recursively scan directory for .mdx files to generate sitemap URLs
 */
function scanDirectory(dir: string, basePath: string = ''): string[] {
  const pages: string[] = []
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name)
      const relativePath = path.join(basePath, item.name)
      
      if (item.isDirectory()) {
        // Recursively scan subdirectories
        pages.push(...scanDirectory(fullPath, relativePath))
      } else if (item.isFile() && item.name.endsWith('.mdx')) {
        // Convert .mdx file to URL path
        const urlPath = relativePath
          .replace(/\.mdx$/, '')
          .replace(/\\/g, '/') // Normalize path separators
        
        // Skip index files as they represent the directory itself
        if (item.name === 'index.mdx') {
          pages.push(`/docs/${basePath.replace(/\\/g, '/')}`)
        } else {
          pages.push(`/docs/${urlPath}`)
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dir}:`, (error as Error).message)
  }
  
  return pages
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages that should always be included
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]

  // Scan for documentation pages
  const contentDir = path.join(process.cwd(), 'content/docs')
  const docPages = scanDirectory(contentDir)

  // Convert documentation pages to sitemap format
  const documentationPages = docPages.map((page) => ({
    url: `${BASE_URL}${page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...documentationPages]
}
