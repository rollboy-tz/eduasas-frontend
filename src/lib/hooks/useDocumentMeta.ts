/**
 * @file Mbadala wa Vite/CSR wa Next.js `export const metadata` (ambayo
 * ipo tu kwenye Server Components - haipo kabisa kwenye Vite). Inaweka
 * `document.title` na kuingiza/kusasisha `<meta name="robots">` tag.
 *
 * Imeachwa bila dependency ya nje (hakuna react-helmet-async) kwa
 * makusudi ili ibaki nyepesi - kwa dashboard pages chache zilizofungwa na
 * auth, hii inatosha. Tumia head-manager kamili tu app ikiwa na public/
 * SEO pages nyingi zenye mahitaji magumu zaidi (Open Graph, canonical, n.k).
 */
import { useEffect } from "react";

export interface DocumentMetaOptions {
  /** Inaonekana kwenye browser tab na bookmarks. */
  title: string;
  description?: string;
  /** Protected/dashboard pages karibu zote zinapaswa kupitisha `true`. */
  noindex?: boolean;
}

/**
 * Weka document title (na hiari: description/robots) kwa muda component
 * hii ipo mounted - inarudisha title ya awali baada ya unmount ili route
 * nyingine zisiache jina la page hii "likining'inia" kwenye tab.
 */
export function useDocumentMeta({ title, description, noindex }: DocumentMetaOptions): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    if (description) {
      let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!descriptionTag) {
        descriptionTag = document.createElement("meta");
        descriptionTag.setAttribute("name", "description");
        document.head.appendChild(descriptionTag);
      }
      descriptionTag.setAttribute("content", description);
    }

    if (noindex) {
      let robotsTag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (!robotsTag) {
        robotsTag = document.createElement("meta");
        robotsTag.setAttribute("name", "robots");
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute("content", "noindex, nofollow");
    }

    return () => {
      document.title = previousTitle;
      // Meta tags (description/robots) hazionduwelewi kwa makusudi -
      // route inayofuata itaziandika upya kupitia hook hii hii.
    };
  }, [title, description, noindex]);
}