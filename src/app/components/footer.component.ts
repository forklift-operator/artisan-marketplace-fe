import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-gray-900 text-gray-300 mt-20 py-12">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 class="text-white font-bold mb-4 text-lg">About Artisan Market</h3>
            <p class="text-sm leading-relaxed">A beautiful marketplace for handmade and artisan products. Support local crafters and artisans.</p>
          </div>
          <div>
            <h3 class="text-white font-bold mb-4 text-lg">Quick Links</h3>
            <ul class="text-sm space-y-2">
              <li><a href="#" class="hover:text-amber-400 transition">Browse Products</a></li>
              <li><a href="#" class="hover:text-amber-400 transition">Sell with Us</a></li>
              <li><a href="#" class="hover:text-amber-400 transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-white font-bold mb-4 text-lg">Follow Us</h3>
            <div class="flex gap-4 text-sm">
              <a href="#" class="hover:text-amber-400 transition">Facebook</a>
              <a href="#" class="hover:text-amber-400 transition">Instagram</a>
              <a href="#" class="hover:text-amber-400 transition">Twitter</a>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; 2024 Artisan Market. All rights reserved. ✋ Handmade with care.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
