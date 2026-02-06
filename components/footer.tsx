export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#0a2463] to-[#14b8a6] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-black font-serif">MÓRBRIDALS</h3>
            <p className="text-black text-sm">Your destination for elegant women's fashion, clutches, and jewelry.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-black">
              <li>
                <a href="#" className="hover:text-teal-400 transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition">
                  Returns
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-black">
              <li>
                <a href="#" className="hover:text-teal-400 transition">
                  Unstitched
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition">
                  Stitched
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition">
                  Bridal
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition">
                  Accessories
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-black text-sm mb-4">Subscribe for exclusive offers</p>
            <div className="flex mb-4">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-full bg-gray-800 text-white outline-none"
              />
              <button className="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded-r-full transition">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-black hover:text-teal-400 transition">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-black hover:text-teal-400 transition">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-black hover:text-teal-400 transition">
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
              <a href="#" className="text-black hover:text-teal-400 transition">
                <i className="fab fa-pinterest text-xl"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="text-black text-sm text-center">&copy; 2025 MÓRBRIDALS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
