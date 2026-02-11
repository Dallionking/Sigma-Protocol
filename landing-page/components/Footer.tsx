'use client';

import { Github, Twitter } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Documentation', href: 'https://github.com/dallionking/sigma-protocol#readme' },
    { label: 'GitHub', href: 'https://github.com/dallionking/sigma-protocol' },
    { label: 'Changelog', href: 'https://github.com/dallionking/sigma-protocol/blob/main/CHANGELOG.md' },
    { label: 'Roadmap', href: 'https://github.com/dallionking/sigma-protocol/issues' },
  ],
  community: [
    { label: 'Discord', href: 'https://discord.gg/sigma-protocol' },
    { label: 'Twitter/X', href: 'https://twitter.com/sigmaprotocol' },
    { label: 'Issues', href: 'https://github.com/dallionking/sigma-protocol/issues' },
    { label: 'Discussions', href: 'https://github.com/dallionking/sigma-protocol/discussions' },
  ],
  legal: [
    { label: 'MIT License', href: 'https://github.com/dallionking/sigma-protocol/blob/main/LICENSE' },
    { label: 'Privacy', href: 'https://github.com/dallionking/sigma-protocol/blob/main/PRIVACY.md' },
    { label: 'Terms', href: 'https://github.com/dallionking/sigma-protocol/blob/main/TERMS.md' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gotham-surface border-t border-gotham-purple/20">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Product */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gotham-gold">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-gotham-purple transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gotham-gold">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-gotham-purple transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gotham-gold">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-gotham-purple transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gotham-purple/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <p className="text-text-secondary text-sm">
              © {currentYear} Sigma Protocol. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-text-secondary bg-gotham-bg px-3 py-1 rounded-full">
              <span>Built with</span>
              <span className="text-gotham-purple font-semibold">Sigma Protocol</span>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/dallionking/sigma-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md hover:bg-gotham-purple/10 transition-colors text-text-secondary hover:text-gotham-purple"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/sigmaprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md hover:bg-gotham-purple/10 transition-colors text-text-secondary hover:text-gotham-purple"
              aria-label="Twitter/X"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
