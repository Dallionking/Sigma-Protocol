import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        textArea.remove();
        return false;
      }
    }
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}

export async function fetchGitHubStars(): Promise<number> {
  try {
    const response = await fetch('https://api.github.com/repos/dallionking/sigma-protocol', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error('GitHub API request failed');
    }

    const data = await response.json();
    return data.stargazers_count || 1000;
  } catch (error) {
    console.error('Error fetching GitHub stars:', error);
    return 1000; // Fallback value
  }
}
